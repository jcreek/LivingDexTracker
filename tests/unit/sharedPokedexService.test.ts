import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PokedexEntry } from '$lib/models/PokedexEntry';
import type { SharedPokedexRpcData } from '$lib/models/SharedPokedex';

const { findAllCombinedData } = vi.hoisted(() => ({ findAllCombinedData: vi.fn() }));
vi.mock('$lib/repositories/CombinedDataRepository', () => ({
	default: vi.fn().mockImplementation(() => ({ findAllCombinedData }))
}));

import {
	calculateSharedProgress,
	isShareToken,
	loadSharedPokedex
} from '$lib/services/SharedPokedexService';

const TOKEN = '123e4567-e89b-42d3-a456-426614174000';

function supabaseWithRpc(result: { data: unknown; error: unknown }) {
	const rpc = vi.fn().mockResolvedValue(result);
	return { supabase: { rpc } as unknown as SupabaseClient, rpc };
}

describe('shared Pokédex helpers', () => {
	it('accepts UUID capability tokens and rejects malformed route values', () => {
		expect(isShareToken('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
		expect(isShareToken('not-a-token')).toBe(false);
		expect(isShareToken('123e4567-e89b-12d3-a456-426614174000/extra')).toBe(false);
	});

	it('counts caught and needs-to-evolve entries as progress', () => {
		const progress = calculateSharedProgress(
			[
				{
					pokemonId: '1',
					caught: true,
					haveToEvolve: false,
					inHome: false,
					hasGigantamaxed: false
				},
				{
					pokemonId: '2',
					caught: false,
					haveToEvolve: true,
					inHome: false,
					hasGigantamaxed: false
				}
			],
			4
		);
		expect(progress).toEqual({ caught: 2, completionPercentage: 50 });
		expect(calculateSharedProgress([], 0)).toEqual({ caught: 0, completionPercentage: 0 });
	});
});

describe('loadSharedPokedex', () => {
	beforeEach(() => {
		findAllCombinedData.mockReset();
	});

	it('rejects malformed tokens without querying', async () => {
		const { supabase, rpc } = supabaseWithRpc({ data: null, error: null });
		expect(await loadSharedPokedex(supabase, 'not-a-token')).toBeNull();
		expect(rpc).not.toHaveBeenCalled();
	});

	it('returns null when the token matches nothing or the RPC fails', async () => {
		expect(
			await loadSharedPokedex(supabaseWithRpc({ data: null, error: null }).supabase, TOKEN)
		).toBeNull();
		expect(
			await loadSharedPokedex(
				supabaseWithRpc({ data: null, error: { message: 'boom' } }).supabase,
				TOKEN
			)
		).toBeNull();
		expect(findAllCombinedData).not.toHaveBeenCalled();
	});

	it('maps shared catch statuses onto the scoped dex entries', async () => {
		const rpcData: SharedPokedexRpcData = {
			name: 'Kanto',
			description: 'Gen 1',
			isLivingDex: true,
			isShinyDex: false,
			isOriginDex: false,
			isFormDex: true,
			gameScope: null,
			dexScopes: ['kanto'],
			catchStatuses: [
				{ pokemonId: '1', caught: true, haveToEvolve: false, inHome: true, hasGigantamaxed: false },
				{
					pokemonId: '99',
					caught: true,
					haveToEvolve: false,
					inHome: false,
					hasGigantamaxed: false
				}
			]
		};
		const entries = ['1', '2', '3', '4'].map((id) => ({
			pokedexEntry: { _id: id } as PokedexEntry,
			catchRecord: null
		}));
		findAllCombinedData.mockResolvedValue(entries);
		const { supabase, rpc } = supabaseWithRpc({ data: rpcData, error: null });

		const shared = await loadSharedPokedex(supabase, TOKEN);

		expect(rpc).toHaveBeenCalledWith('get_shared_pokedex', { p_share_token: TOKEN });
		expect(findAllCombinedData).toHaveBeenCalledWith('', true, '', '', ['kanto']);
		expect(shared?.combinedData.map((entry) => entry.catchRecord?.pokemonId ?? null)).toEqual([
			'1',
			null,
			null,
			null
		]);
		// Statuses for Pokémon outside the dex scope must not inflate progress.
		expect(shared).toMatchObject({
			name: 'Kanto',
			total: 4,
			caught: 1,
			completionPercentage: 25
		});
	});
});
