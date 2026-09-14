import { error, redirect } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { loadCombinedDataPage } from '$lib/services/CombinedDataService';
import type { PageServerLoad } from './$types';

// Must match the page's itemsPerPage: the box view needs the whole dex in one page.
const INITIAL_PAGE_SIZE = 9999;

export const load: PageServerLoad = async ({ locals, params }) => {
	const { safeGetSession, supabase } = locals;
	const { session, user } = await safeGetSession();

	// Require authentication
	if (!session || !user) {
		throw redirect(303, '/signin');
	}

	const { id } = params;

	// Fetch pokédex to verify ownership (RLS will also block, but we want a proper 404)
	const repo = new PokedexRepository(supabase, user.id);
	const pokedex = await repo.findById(id);

	if (!pokedex) {
		// Either doesn't exist or user doesn't own it
		throw error(404, 'Pokédex not found');
	}

	// Streamed rather than awaited: the page shell renders straight away and the entries arrive in
	// the same response, instead of the browser requesting them after hydration. A failure resolves
	// to null so the page falls back to fetching (and reporting) through the API.
	const initialCombinedData = loadCombinedDataPage(supabase, user.id, pokedex, {
		page: 1,
		limit: INITIAL_PAGE_SIZE,
		enableForms: pokedex.isFormDex
	})
		.then((result) => result.combinedData)
		.catch((err) => {
			console.error('Unable to preload combined data', err);
			return null;
		});

	return {
		pokedex,
		initialCombinedData
	};
};
