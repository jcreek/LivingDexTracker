import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { requireLoopbackUrl } from '../support/loopback';

const url = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;
const serviceKey = process.env.E2E_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('database integrity and ownership', () => {
	const createdUserIds: string[] = [];
	beforeAll(() => {
		if (!anonKey || !serviceKey) {
			throw new Error('Integration tests require TEST_SUPABASE_ANON_KEY and E2E_SERVICE_ROLE_KEY');
		}
	});

	afterAll(async () => {
		if (!serviceKey) return;
		const admin = createClient(url, serviceKey);
		await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
	});

	it('enforces catch-record uniqueness and cascades records when a Pokédex is deleted', async () => {
		const admin = createClient(url, serviceKey!);
		const email = `integration-cascade-${Date.now()}@example.test`;
		const { data: created, error: userError } = await admin.auth.admin.createUser({
			email,
			password: 'Integration123!',
			email_confirm: true
		});
		expect(userError).toBeNull();
		const userId = created.user!.id;
		createdUserIds.push(userId);
		const { data: dex, error: dexError } = await admin
			.from('pokedexes')
			.insert({ userId, name: 'Cascade', isLivingDex: true })
			.select('id')
			.single();
		expect(dexError).toBeNull();
		const { data: pokemon } = await admin
			.from('pokemon')
			.select('id')
			.order('id')
			.limit(1)
			.single();
		const record = { userId, pokedexId: dex!.id, pokemonId: pokemon!.id, caught: true };
		expect((await admin.from('catch_records').insert(record)).error).toBeNull();
		expect((await admin.from('catch_records').insert(record)).error?.code).toBe('23505');

		expect((await admin.from('pokedexes').delete().eq('id', dex!.id)).error).toBeNull();
		const { count } = await admin
			.from('catch_records')
			.select('*', { count: 'exact', head: true })
			.eq('pokedexId', dex!.id);
		expect(count).toBe(0);
	});

	it("does not disclose another user's Pokédex through row-level security", async () => {
		const admin = createClient(url, serviceKey!);
		const stamp = Date.now();
		const password = 'Integration123!';
		const firstEmail = `integration-owner-${stamp}@example.test`;
		const secondEmail = `integration-other-${stamp}@example.test`;
		const first = await admin.auth.admin.createUser({
			email: firstEmail,
			password,
			email_confirm: true
		});
		const second = await admin.auth.admin.createUser({
			email: secondEmail,
			password,
			email_confirm: true
		});
		expect(first.error).toBeNull();
		expect(second.error).toBeNull();
		createdUserIds.push(first.data.user!.id, second.data.user!.id);
		const { data: dex } = await admin
			.from('pokedexes')
			.insert({ userId: first.data.user!.id, name: 'Owner only', isLivingDex: true })
			.select('id')
			.single();

		const other = createClient(url, anonKey!);
		expect(
			(await other.auth.signInWithPassword({ email: secondEmail, password })).error
		).toBeNull();
		const { data, error } = await other.from('pokedexes').select('id').eq('id', dex!.id);
		expect(error).toBeNull();
		expect(data).toEqual([]);
	});

	it('keeps mapping membership unique for each Pokédex', async () => {
		const admin = createClient(url, serviceKey!);
		const email = `integration-mapping-${Date.now()}@example.test`;
		const created = await admin.auth.admin.createUser({
			email,
			password: 'Integration123!',
			email_confirm: true
		});
		createdUserIds.push(created.data.user!.id);
		const { data: dex } = await admin
			.from('pokedexes')
			.insert({ userId: created.data.user!.id, name: 'Unique mapping', isLivingDex: true })
			.select('id')
			.single();
		const { data: pokemon } = await admin
			.from('pokemon')
			.select('id')
			.order('id')
			.limit(1)
			.single();
		const mapping = { pokedexId: dex!.id, pokemonId: pokemon!.id };
		expect((await admin.from('pokedex_pokemon_mapping').insert(mapping)).error).toBeNull();
		expect((await admin.from('pokedex_pokemon_mapping').insert(mapping)).error?.code).toBe('23505');
	});

	it('rejects mapping rows that reference missing records', async () => {
		const admin = createClient(url, serviceKey!);
		const { error } = await admin.from('pokedex_pokemon_mapping').insert({
			pokedexId: '00000000-0000-0000-0000-000000000000',
			pokemonId: -1
		});
		expect(error?.code).toBe('23503');
	});
});
