import { error, json } from '@sveltejs/kit';
import { requireAuth } from '$lib/utils/auth';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { loadPokedexEntryDetail } from '$lib/services/PokedexGridService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const userId = await requireAuth(event);
	const entryId = Number(event.params.entryId);
	if (!Number.isSafeInteger(entryId) || entryId < 1) throw error(400, 'Invalid entry');
	const pokedex = await new PokedexRepository(event.locals.supabase, userId).findById(
		event.params.id
	);
	if (!pokedex) throw error(404, 'Pokédex not found');
	const detail = await loadPokedexEntryDetail(event.locals.supabase, userId, pokedex, entryId);
	if (!detail) throw error(404, 'Entry not found');
	return json(detail, { headers: { 'cache-control': 'private, no-store' } });
};
