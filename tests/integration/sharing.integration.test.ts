import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { requireLoopbackUrl } from '../support/loopback';

const url = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;
const serviceKey = process.env.E2E_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('read-only Pokédex sharing', () => {
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

	it('generates a stable token and exposes only sanitized data through the RPC', async () => {
		const admin = createClient(url, serviceKey!);
		const email = `integration-sharing-${Date.now()}@example.test`;
		const password = 'Integration123!';
		const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
		expect(created.error).toBeNull();
		const userId = created.data.user!.id;
		createdUserIds.push(userId);

		const { data: dex, error: dexError } = await admin
			.from('pokedexes')
			.insert({
				userId,
				name: 'Shared & Safe',
				description: 'Public description',
				isLivingDex: true
			})
			.select('id, shareToken')
			.single();
		expect(dexError).toBeNull();
		expect(dex!.shareToken).toMatch(/^[0-9a-f-]{36}$/i);

		const { data: pokemon } = await admin
			.from('pokemon')
			.select('id')
			.order('id')
			.limit(1)
			.single();
		expect(
			(
				await admin.from('catch_records').insert({
					userId,
					pokedexId: dex!.id,
					pokemonId: pokemon!.id,
					caught: true,
					inHome: true,
					personalNotes: 'This must remain private'
				})
			).error
		).toBeNull();

		const anonymous = createClient(url, anonKey!);
		const direct = await anonymous.from('pokedexes').select('*').eq('id', dex!.id);
		expect(direct.error).toBeNull();
		expect(direct.data).toEqual([]);
		const directCatchRecords = await anonymous
			.from('catch_records')
			.select('*')
			.eq('pokedexId', dex!.id);
		expect(directCatchRecords.error).toBeNull();
		expect(directCatchRecords.data).toEqual([]);

		const result = await anonymous.rpc('get_shared_pokedex', {
			p_share_token: dex!.shareToken
		});
		expect(result.error).toBeNull();
		expect(result.data).toMatchObject({
			name: 'Shared & Safe',
			description: 'Public description',
			catchStatuses: [
				{
					pokemonId: String(pokemon!.id),
					caught: true,
					inHome: true
				}
			]
		});
		const serialized = JSON.stringify(result.data);
		expect(serialized).not.toContain(userId);
		expect(serialized).not.toContain(dex!.shareToken);
		expect(serialized).not.toContain('This must remain private');
		expect(serialized).not.toContain('personalNotes');

		const attemptedWrite = await anonymous
			.from('catch_records')
			.update({ caught: false })
			.eq('pokedexId', dex!.id)
			.eq('pokemonId', pokemon!.id)
			.select();
		expect(attemptedWrite.error).toBeNull();
		expect(attemptedWrite.data).toEqual([]);
		const unchanged = await admin
			.from('catch_records')
			.select('caught')
			.eq('pokedexId', dex!.id)
			.eq('pokemonId', pokemon!.id)
			.single();
		expect(unchanged.data?.caught).toBe(true);

		const owner = createClient(url, anonKey!);
		expect((await owner.auth.signInWithPassword({ email, password })).error).toBeNull();
		const ownerDex = await owner.from('pokedexes').select('shareToken').eq('id', dex!.id).single();
		expect(ownerDex.data?.shareToken).toBe(dex!.shareToken);
		expect(
			(await owner.from('pokedexes').update({ shareToken: crypto.randomUUID() }).eq('id', dex!.id))
				.error
		).not.toBeNull();

		const missing = await anonymous.rpc('get_shared_pokedex', {
			p_share_token: crypto.randomUUID()
		});
		expect(missing.error).toBeNull();
		expect(missing.data).toBeNull();

		expect((await admin.from('pokedexes').delete().eq('id', dex!.id)).error).toBeNull();
		const deleted = await anonymous.rpc('get_shared_pokedex', {
			p_share_token: dex!.shareToken
		});
		expect(deleted.error).toBeNull();
		expect(deleted.data).toBeNull();
	});
});
