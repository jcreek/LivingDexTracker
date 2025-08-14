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

		// Combine data - for box view we need ALL pokemon with proper positioning
		const combinedData: (PokemonWithCatchStatus | null)[] = [];

		// Check if this is a regional pokédex (entries are already ordered by regional number)
		const isRegionalPokedex = pokedex.regionalPokedexName && pokedex.regionalPokedexName !== 'national';
		
		if (isRegionalPokedex) {
			// For regional pokédexes, use sequential placement based on regional order
			const totalPokemon = pokemonEntries.length;
			const totalBoxes = Math.ceil(totalPokemon / 30);
			const maxPosition = totalBoxes * 30;

			// Initialize array with nulls
			for (let i = 0; i < maxPosition; i++) {
				combinedData[i] = null;
			}

			// Place pokemon sequentially (0-based indexing)
			pokemonEntries.forEach((entry, index) => {
				combinedData[index] = {
					...entry,
					catchRecord: catchRecordMap.get(entry.id) || undefined
				};
			});
		} else if (pokedex.includeForms) {
			// Use forms box placement for National Pokédex with forms
			const maxBox = Math.max(...pokemonEntries.map((p) => p.boxPlacementFormsBox || 1));
			const maxPosition = maxBox * 30; // 30 slots per box

			// Initialize array with nulls
			for (let i = 0; i < maxPosition; i++) {
				combinedData[i] = null;
			}

			// Place pokemon in correct positions
			for (const entry of pokemonEntries) {
				if (
					entry.boxPlacementFormsBox &&
					entry.boxPlacementFormsRow &&
					entry.boxPlacementFormsColumn
				) {
					const position =
						(entry.boxPlacementFormsBox - 1) * 30 +
						(entry.boxPlacementFormsRow - 1) * 6 +
						(entry.boxPlacementFormsColumn - 1);

					combinedData[position] = {
						...entry,
						catchRecord: catchRecordMap.get(entry.id) || undefined
					};
				} else {
					// Fallback: place sequentially if no placement data
					const index = pokemonEntries.indexOf(entry);
					if (index < maxPosition) {
						combinedData[index] = {
							...entry,
							catchRecord: catchRecordMap.get(entry.id) || undefined
						};
					}
				}
			}
		} else {
			// Use regular box placement for National Pokédex
			const maxBox = Math.max(...pokemonEntries.map((p) => p.boxPlacementBox || 1));
			const maxPosition = maxBox * 30; // 30 slots per box

			// Initialize array with nulls
			for (let i = 0; i < maxPosition; i++) {
				combinedData[i] = null;
			}

			// Place pokemon in correct positions
			for (const entry of pokemonEntries) {
				if (entry.boxPlacementBox && entry.boxPlacementRow && entry.boxPlacementColumn) {
					const position =
						(entry.boxPlacementBox - 1) * 30 +
						(entry.boxPlacementRow - 1) * 6 +
						(entry.boxPlacementColumn - 1);

					combinedData[position] = {
						...entry,
						catchRecord: catchRecordMap.get(entry.id) || undefined
					};
				} else {
					// Fallback: place sequentially if no placement data
					const index = pokemonEntries.indexOf(entry);
					if (index < maxPosition) {
						combinedData[index] = {
							...entry,
							catchRecord: catchRecordMap.get(entry.id) || undefined
						};
					}
				}
			}
		}

		// Calculate total boxes
		const totalPokemon = combinedData.filter((p) => p !== null).length;
		const totalBoxes = Math.ceil(totalPokemon / 30);

		return json({
			pokemon: combinedData,
			totalBoxes,
			totalPokemon
		});
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
