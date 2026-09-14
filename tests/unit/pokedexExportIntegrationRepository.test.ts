import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import PokedexExportIntegrationRepository from '$lib/repositories/PokedexExportIntegrationRepository';

type Result = { data: unknown; error: unknown };

/** A chainable stand-in for the Supabase query builder that records each call made on it. */
function fakeSupabase(result: Result) {
	const calls: unknown[][] = [];
	const builder: Record<string, unknown> = {};
	for (const method of ['select', 'update', 'upsert', 'single', 'eq', 'is', 'or']) {
		builder[method] = (...args: unknown[]) => {
			calls.push([method, ...args]);
			return builder;
		};
	}
	// Awaiting the builder runs the query, as it does in supabase-js.
	builder.then = (resolve: (value: Result) => unknown, reject?: (reason: unknown) => unknown) =>
		Promise.resolve(result).then(resolve, reject);
	const from = vi.fn(() => builder);
	return { supabase: { from } as unknown as SupabaseClient, calls, from };
}

const VERSION = '2026-09-14T12:00:00.123456+00:00';
const WRITTEN: Result = { data: [{ id: 'int-1' }], error: null };

describe('PokedexExportIntegrationRepository.updateExportStatus', () => {
	it('writes only while the row still has the version the caller read', async () => {
		const { supabase, calls, from } = fakeSupabase(WRITTEN);
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		const applied = await repo.updateExportStatus('int-1', { enabled: false }, VERSION);

		expect(applied).toBe(true);
		expect(from).toHaveBeenCalledWith('pokedex_export_integrations');
		expect(calls).toEqual([
			['update', { enabled: false }],
			['eq', 'id', 'int-1'],
			['eq', 'userId', 'user-1'],
			['eq', 'updatedAt', VERSION],
			['is', 'pokedexId', null],
			['select', 'id']
		]);
	});

	it('writes unconditionally without a version, scoped to the Pokédex', async () => {
		const { supabase, calls } = fakeSupabase(WRITTEN);
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', 'dex-1');

		expect(await repo.updateExportStatus('int-1', { lastError: null })).toBe(true);
		expect(calls).toEqual([
			['update', { lastError: null }],
			['eq', 'id', 'int-1'],
			['eq', 'userId', 'user-1'],
			['eq', 'pokedexId', 'dex-1'],
			['select', 'id']
		]);
	});

	it.each([
		['no row matched, e.g. after a reconnect changed it', { data: [], error: null }],
		['the response carries no rows', { data: null, error: null }]
	])('reports nothing written when %s', async (_label, result) => {
		const { supabase } = fakeSupabase(result);
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		expect(await repo.updateExportStatus('int-1', { enabled: false }, VERSION)).toBe(false);
	});

	it('logs and reports nothing written when the update fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { supabase } = fakeSupabase({ data: null, error: { message: 'boom' } });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		expect(await repo.updateExportStatus('int-1', { enabled: false })).toBe(false);
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});

describe('PokedexExportIntegrationRepository.listAll', () => {
	it('maps each row version, defaulting a missing one to null', async () => {
		const row = {
			userId: 'user-1',
			pokedexId: null,
			provider: 'google_drive',
			enabled: true,
			fileName: null,
			folderId: null,
			path: null,
			accessToken: 'access',
			refreshToken: 'refresh',
			accessTokenExpiresAt: null,
			metadata: null,
			lastExportedAt: null,
			lastError: null
		};
		const { supabase } = fakeSupabase({
			data: [
				{ ...row, id: 'with-version', updatedAt: VERSION },
				{ ...row, id: 'without-version' }
			],
			error: null
		});
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		const [withVersion, withoutVersion] = await repo.listAll();

		expect(withVersion).toMatchObject({ _id: 'with-version', updatedAt: VERSION });
		expect(withoutVersion).toMatchObject({ _id: 'without-version', updatedAt: null });
	});
});

function dbRow(id: string) {
	return {
		id,
		userId: 'user-1',
		pokedexId: null,
		provider: 'dropbox',
		enabled: true,
		fileName: null,
		folderId: null,
		path: '/Backups',
		accessToken: 'access',
		refreshToken: 'refresh',
		accessTokenExpiresAt: null,
		metadata: null,
		lastExportedAt: null,
		lastError: null,
		updatedAt: VERSION
	};
}

describe('PokedexExportIntegrationRepository queries', () => {
	it('lists enabled integrations scoped to one Pokédex', async () => {
		const { supabase, calls } = fakeSupabase({ data: [dbRow('int-1')], error: null });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', 'dex-1');

		const [integration] = await repo.listEnabled();

		expect(integration).toMatchObject({ _id: 'int-1', provider: 'dropbox', path: '/Backups' });
		expect(calls).toEqual([
			['select', '*'],
			['eq', 'userId', 'user-1'],
			['eq', 'pokedexId', 'dex-1'],
			['eq', 'enabled', true]
		]);
	});

	it.each([
		['dex-1', ['or', 'pokedexId.eq.dex-1,pokedexId.is.null']],
		[null, ['is', 'pokedexId', null]]
	])('lists enabled integrations for Pokédex %j or the whole account', async (pokedexId, scope) => {
		const { supabase, calls } = fakeSupabase({ data: [dbRow('int-1')], error: null });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', pokedexId);

		expect(await repo.listEnabledForPokedexOrUser()).toHaveLength(1);
		expect(calls).toEqual([
			['select', '*'],
			['eq', 'userId', 'user-1'],
			['eq', 'enabled', true],
			scope
		]);
	});

	it.each(['listAll', 'listEnabled', 'listEnabledForPokedexOrUser'] as const)(
		'%s returns nothing when no rows come back',
		async (method) => {
			const { supabase } = fakeSupabase({ data: null, error: null });
			const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

			expect(await repo[method]()).toEqual([]);
		}
	);

	it.each(['listAll', 'listEnabled', 'listEnabledForPokedexOrUser'] as const)(
		'%s throws when the query fails',
		async (method) => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
			const { supabase } = fakeSupabase({ data: null, error: { message: 'boom' } });
			const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

			await expect(repo[method]()).rejects.toThrow('Failed to load export integrations: boom');
			consoleError.mockRestore();
		}
	);
});

describe('PokedexExportIntegrationRepository.upsert', () => {
	it('saves one account-wide integration per provider', async () => {
		const { supabase, calls } = fakeSupabase({ data: dbRow('int-1'), error: null });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', 'dex-1');

		const saved = await repo.upsert({ provider: 'dropbox', enabled: true, lastError: null });

		expect(saved).toMatchObject({ _id: 'int-1', updatedAt: VERSION });
		expect(calls).toEqual([
			[
				'upsert',
				{
					userId: 'user-1',
					pokedexId: null,
					provider: 'dropbox',
					enabled: true,
					lastError: null
				},
				{ onConflict: 'userId,provider' }
			],
			['select'],
			['single']
		]);
	});

	it.each([
		['the save fails', { data: null, error: { message: 'boom' } }, 'boom'],
		['nothing comes back', { data: null, error: null }, 'No result returned']
	])('throws when %s', async (_label, result, message) => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { supabase } = fakeSupabase(result);
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		await expect(repo.upsert({ provider: 'dropbox' })).rejects.toThrow(
			`Failed to save export integration: ${message}`
		);
		consoleError.mockRestore();
	});
});

describe('PokedexExportIntegrationRepository.updateTokens', () => {
	it.each([
		['dex-1', ['eq', 'pokedexId', 'dex-1']],
		[null, ['is', 'pokedexId', null]]
	])('stores refreshed tokens scoped to Pokédex %j', async (pokedexId, scope) => {
		const { supabase, calls } = fakeSupabase({ data: null, error: null });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', pokedexId);
		const patch = { accessToken: 'new-access', accessTokenExpiresAt: null };

		await repo.updateTokens('int-1', patch);

		expect(calls).toEqual([
			['update', patch],
			['eq', 'id', 'int-1'],
			['eq', 'userId', 'user-1'],
			scope
		]);
	});

	it('logs instead of throwing when the token update fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { supabase } = fakeSupabase({ data: null, error: { message: 'boom' } });
		const repo = new PokedexExportIntegrationRepository(supabase, 'user-1', null);

		await expect(repo.updateTokens('int-1', { accessToken: 'x' })).resolves.toBeUndefined();
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
