import { packGrid, unpackGrid } from '$lib/models/PokedexGridRow';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { requireLoopbackUrl } from '../support/loopback';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import CatchRecordRepository from '$lib/repositories/CatchRecordRepository';
import { loadPokedexGrid, loadPokedexEntryDetail } from '$lib/services/PokedexGridService';
import type { Pokedex } from '$lib/models/Pokedex';

const url = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);
const serviceKey = process.env.E2E_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;

describe('compact Pokédex and partial catch writes', () => {
	let admin: SupabaseClient;
	let client: SupabaseClient;
	let owner = '';
	let national: Pokedex;
	let scoped: Pokedex;
	let firstId: string;
	let secondId: string;
	beforeAll(async () => {
		if (!serviceKey || !anonKey) throw new Error('Use npm run test:integration');
		admin = createClient(url, serviceKey, { auth: { persistSession: false } });
		const email = `grid-${crypto.randomUUID()}@example.test`;
		const password = crypto.randomUUID();
		const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
		if (created.error) throw created.error;
		owner = created.data.user.id;
		client = createClient(url, anonKey, { auth: { persistSession: false } });
		const signed = await client.auth.signInWithPassword({ email, password });
		if (signed.error) throw signed.error;
		const repo = new PokedexRepository(client, owner);
		national = await repo.create({ name: 'Grid national', isFormDex: false });
		scoped = await repo.create({ name: 'Grid forms', isFormDex: true, gameScope: 'Scarlet' });
		const links = await client
			.from('pokedex_dex_scopes')
			.insert({ pokedexId: scoped._id, dexId: 'scarlet-paldea' });
		if (links.error) throw links.error;
		scoped = (await repo.findById(scoped._id))!;
		const grid = await loadPokedexGrid(client, owner, national);
		[firstId, secondId] = grid.slice(0, 2).map((row) => row.pokedexEntry._id);
	});
	afterAll(async () => {
		if (owner) await admin.auth.admin.deleteUser(owner);
	});

	it('loads saved scopes with ownership and prevents cross-account reads', async () => {
		expect(scoped.dexScopes).toEqual(['scarlet-paldea']);
		const other = new PokedexRepository(client, crypto.randomUUID());
		expect(await other.findById(scoped._id)).toBeNull();
	});

	it('matches full ordering and statuses while reducing serialized rows by at least 60%', async () => {
		for (const dex of [national, scoped]) {
			const initial = await loadPokedexGrid(client, owner, dex);
			const catches = new CatchRecordRepository(client, owner, dex._id);
			for (let offset = 0; offset < initial.length - 1; offset += 500)
				await catches.bulkUpsert(
					initial.slice(offset, Math.min(offset + 500, initial.length - 1)).map((row, index) => ({
						pokemonId: row.pokedexEntry._id,
						caught: index % 3 === 0,
						inHome: index % 7 === 0,
						personalNotes: ''
					}))
				);
			const grid = await loadPokedexGrid(client, owner, dex);
			const full = await new CombinedDataRepository(client, owner, dex._id).findAllCombinedData(
				owner,
				dex.isFormDex,
				'',
				dex.gameScope || '',
				dex.dexScopes
			);
			expect(grid.map((row) => row.pokedexEntry._id)).toEqual(
				full.map((row) => row.pokedexEntry._id)
			);
			expect(grid.length).toBeGreaterThan(400);
			expect(unpackGrid(packGrid(grid))).toEqual(grid);
			expect(JSON.stringify(packGrid(grid)).length).toBeLessThan(JSON.stringify(full).length * 0.4);
			expect(JSON.stringify(grid)).not.toContain('personalNotes');
			expect(JSON.stringify(grid)).not.toContain('catchInformation');
		}
	});

	it('preserves omitted notes and statuses in mixed partial bulk writes, including new records', async () => {
		const repo = new CatchRecordRepository(client, owner, national._id);
		await repo.bulkUpsert([
			{ pokemonId: firstId, personalNotes: 'Keep this note', caught: true, inHome: true }
		]);
		await repo.bulkUpsert([
			{ pokemonId: firstId, haveToEvolve: true, caught: false },
			{ pokemonId: secondId, personalNotes: 'New record' }
		]);
		expect(await repo.findByUserAndPokemon(owner, firstId, national._id)).toMatchObject({
			personalNotes: 'Keep this note',
			caught: false,
			haveToEvolve: true,
			inHome: true
		});
		expect(await repo.findByUserAndPokemon(owner, secondId, national._id)).toMatchObject({
			personalNotes: 'New record',
			caught: false
		});
		await repo.bulkUpsert([{ pokemonId: firstId, personalNotes: '' }]);
		expect(await repo.findByUserAndPokemon(owner, firstId, national._id)).toMatchObject({
			personalNotes: '',
			inHome: true,
			haveToEvolve: true
		});
	});

	it('returns full details only for members of this dex', async () => {
		const detail = await loadPokedexEntryDetail(client, owner, national, Number(firstId));
		expect(detail?.pokedexEntry).toHaveProperty('catchInformation');
		expect(detail?.catchRecord).toHaveProperty('personalNotes');
		expect(await loadPokedexEntryDetail(client, owner, national, 999999)).toBeNull();
		const forms = await loadPokedexGrid(client, owner, scoped);
		const base = new Set(
			(await loadPokedexGrid(client, owner, national)).map((row) => row.pokedexEntry._id)
		);
		const formOnly = forms.find((row) => !base.has(row.pokedexEntry._id));
		expect(formOnly).toBeDefined();
		expect(
			await loadPokedexEntryDetail(client, owner, national, Number(formOnly!.pokedexEntry._id))
		).toBeNull();
	});
});
