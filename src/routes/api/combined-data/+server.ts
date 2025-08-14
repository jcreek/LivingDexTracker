import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	UserPokedexRepository,
	PokedexEntryRepository,
	CatchRecordRepository
} from '$lib/repositories';
import type { PokemonWithCatchStatus } from '$lib/types';

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const pokedexId = url.searchParams.get('pokedex_id');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const search = url.searchParams.get('search') || '';
	const filter = url.searchParams.get('filter') || 'all';

	if (!pokedexId) {
		return json({ error: 'pokedex_id is required' }, { status: 400 });
	}

	try {
		const userPokedexRepo = new UserPokedexRepository(supabase);
		const pokedexEntryRepo = new PokedexEntryRepository(supabase);
		const catchRecordRepo = new CatchRecordRepository(supabase);

		// Verify ownership
		const pokedex = await userPokedexRepo.getById(pokedexId);
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}

		// Get Pokémon entries based on pokedex configuration
		let pokemonEntries: any[];

		if (pokedex.regionalPokedexName && pokedex.regionalPokedexName !== 'national') {
			// Get regional pokedex entries using the new method
			pokemonEntries = await pokedexEntryRepo.getByRegionalPokedexName(pokedex.regionalPokedexName);
		} else if (pokedex.regionalPokedexInfo) {
			// Fallback to old method for backwards compatibility
			pokemonEntries = await pokedexEntryRepo.getByRegionalPokedex(
				pokedex.regionalPokedexInfo.id,
				pokedex.regionalPokedexInfo.columnName
			);
		} else {
			// Get all entries for national dex
			pokemonEntries = pokedex.includeForms
				? await pokedexEntryRepo.getFormsIncluded()
				: await pokedexEntryRepo.getNoForms();
		}

		// Get catch records for this pokedex
		const catchRecords = await catchRecordRepo.getByUserPokedex(pokedexId);
		const catchRecordMap = new Map(catchRecords.map((record) => [record.pokedexEntryId, record]));

		// Combine data
		let combinedData: PokemonWithCatchStatus[] = pokemonEntries.map((entry) => ({
			...entry,
			catchRecord: catchRecordMap.get(entry.id) || undefined
		}));

		// Apply search filter
		if (search) {
			combinedData = combinedData.filter(
				(pokemon) =>
					pokemon.pokemon.toLowerCase().includes(search.toLowerCase()) ||
					pokemon.pokedexNumber.toString().includes(search)
			);
		}

		// Apply status filter
		if (filter !== 'all') {
			combinedData = combinedData.filter((pokemon) => {
				const record = pokemon.catchRecord;
				switch (filter) {
					case 'caught':
						return record?.isCaught === true;
					case 'not_caught':
						return !record?.isCaught;
					case 'ready_to_evolve':
						return record?.catchStatus === 'ready_to_evolve';
					default:
						return true;
				}
			});
		}

		// Pagination
		const total = combinedData.length;
		const totalPages = Math.ceil(total / limit);
		const offset = (page - 1) * limit;
		const paginatedData = combinedData.slice(offset, offset + limit);

		return json({
			pokemon: paginatedData,
			pagination: {
				page,
				limit,
				total,
				totalPages
			}
		});
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
