import { json } from '@sveltejs/kit';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { getOptionalUserId } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { resolveDexScopes } from '$lib/services/PokedexDexScopeService';

// GET: Get combined data (pokédex entries + catch records) for specific pokédex
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await getOptionalUserId(event);
		const { id: pokedexId } = event.params;

		if (!pokedexId) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		// Parse query parameters
		const url = new URL(event.request.url);
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const enableForms = url.searchParams.get('enableForms') === 'true';
		const region = url.searchParams.get('region') || '';
		const game = url.searchParams.get('game') || '';

		// If authenticated, verify user owns this pokédex and get its gameScope
		let pokedex;
		if (userId) {
			const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
			pokedex = await pokedexRepo.findById(pokedexId);

			if (!pokedex) {
				// User is authenticated but doesn't own this pokédex (or it doesn't exist)
				return json({ error: 'Pokedex not found' }, { status: 404 });
			}
		} else {
			// Anonymous users cannot view pokédexes
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Use pokédex's gameScope as default filter if no manual game filter is set
		const effectiveGame = game || pokedex.gameScope || '';
		const dexScopes = await resolveDexScopes(event.locals.supabase, pokedex);

		const repo = new CombinedDataRepository(event.locals.supabase, userId, pokedexId);

		// Get paginated combined data
		const combinedData = await repo.findCombinedData(
			userId!,
			page,
			limit,
			enableForms,
			region,
			effectiveGame,
			dexScopes
		);

		// Get total count for pagination
		const totalCount = await repo.countCombinedData(enableForms, region, effectiveGame, dexScopes);
		const totalPages = Math.ceil(totalCount / limit);

		return json({
			combinedData,
			totalPages,
			currentPage: page,
			totalCount
		});
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
