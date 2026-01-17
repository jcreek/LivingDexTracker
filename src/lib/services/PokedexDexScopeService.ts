import type { SupabaseClient } from '@supabase/supabase-js';
import type { Pokedex } from '$lib/models/Pokedex';

type GameDexRow = {
	id: string;
	displayName: string;
	sortOrder: number;
	isDlc: boolean;
	parentDexId: string | null;
};

type GameSummary = {
	displayName: string;
	releaseYear: number;
};

type GameDexRowWithGame = GameDexRow & {
	games: GameSummary | GameSummary[] | null;
};

async function getGameIdForScope(
	supabase: SupabaseClient,
	gameScope: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('games')
		.select('id')
		.eq('displayName', gameScope)
		.maybeSingle();

	if (error || !data) return null;
	return data.id;
}

export async function resolveDexScopes(
	supabase: SupabaseClient,
	pokedex: Pokedex
): Promise<string[]> {
	if (!pokedex.gameScope) return [];
	if (pokedex.dexScopes && pokedex.dexScopes.length > 0) {
		return pokedex.dexScopes;
	}

	const gameId = await getGameIdForScope(supabase, pokedex.gameScope);
	if (!gameId) return [];

	const { data, error } = await supabase
		.from('game_dexes')
		.select('id')
		.eq('gameId', gameId)
		.order('sortOrder', { ascending: true })
		.order('displayName', { ascending: true });

	if (error || !data) return [];
	return data.map((row) => row.id);
}

export async function setPokedexDexScopes(
	supabase: SupabaseClient,
	pokedexId: string,
	dexIds: string[]
): Promise<void> {
	const uniqueDexIds = Array.from(new Set(dexIds));

	const { error: deleteError } = await supabase
		.from('pokedex_dex_scopes')
		.delete()
		.eq('pokedexId', pokedexId);

	if (deleteError) {
		throw new Error(`Failed to clear dex scopes: ${deleteError.message}`);
	}

	if (uniqueDexIds.length === 0) return;

	const rows = uniqueDexIds.map((dexId) => ({
		pokedexId,
		dexId
	}));

	const { error: insertError } = await supabase.from('pokedex_dex_scopes').insert(rows);
	if (insertError) {
		throw new Error(`Failed to save dex scopes: ${insertError.message}`);
	}
}

export async function listGameDexes(
	supabase: SupabaseClient
): Promise<{
	gameDexes: Record<string, GameDexRow[]>;
	gameOrder: string[];
	games: { displayName: string; releaseYear: number }[];
}> {
	const { data, error } = await supabase
		.from('game_dexes')
		.select('id, displayName, sortOrder, isDlc, parentDexId, games!inner(displayName, releaseYear)')
		.order('sortOrder', { ascending: true })
		.order('displayName', { ascending: true });

	if (error || !data) return { gameDexes: {}, gameOrder: [], games: [] };

	const grouped: Record<string, GameDexRow[]> = {};
	const releaseYears: Record<string, number> = {};
	const rows = data as GameDexRowWithGame[];
	for (const row of rows) {
		const game = Array.isArray(row.games) ? row.games[0] : row.games;
		if (!game) continue;
		const gameName = game.displayName;
		if (!grouped[gameName]) grouped[gameName] = [];
		if (releaseYears[gameName] == null) {
			releaseYears[gameName] = game.releaseYear;
		}
		grouped[gameName].push({
			id: row.id,
			displayName: row.displayName,
			sortOrder: row.sortOrder,
			isDlc: row.isDlc,
			parentDexId: row.parentDexId
		});
	}

	const games = Object.keys(grouped)
		.map((name) => ({
			displayName: name,
			releaseYear: releaseYears[name] ?? 0
		}))
		.sort((a, b) => {
			if (a.releaseYear !== b.releaseYear) return b.releaseYear - a.releaseYear;
			return a.displayName.localeCompare(b.displayName);
		});

	const gameOrder = games.map((game) => game.displayName);

	return { gameDexes: grouped, gameOrder, games };
}
