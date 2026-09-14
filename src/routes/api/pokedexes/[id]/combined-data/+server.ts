import { json } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { getOptionalUserId } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { loadCombinedDataPage } from '$lib/services/CombinedDataService';

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

		if (!userId) {
			// Anonymous users cannot view pokédexes
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Verify the user owns this pokédex and get its gameScope
		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);

		if (!pokedex) {
			// User is authenticated but doesn't own this pokédex (or it doesn't exist)
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		return json(
			await loadCombinedDataPage(event.locals.supabase, userId, pokedex, {
				page,
				limit,
				enableForms,
				region,
				game
			})
		);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
