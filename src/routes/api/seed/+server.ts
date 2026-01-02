import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import dex from '$lib/helpers/pokedex.json';
import RegionGameMappingJson from '$lib/helpers/region-game-mapping.json';

export const GET = async () => {
	// Only allow seeding in development
	if (process.env.NODE_ENV === 'production') {
		return json({ message: 'Seeding not allowed in production' }, { status: 403 });
	}

	// Use service role key to bypass RLS for seeding operations
	const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	try {
		// Seed Pokédex entries
		const { count: entriesCount, error: countError } = await supabase
			.from('pokedex_entries')
			.select('*', { count: 'exact', head: true });

		if (countError) {
			throw new Error(`Failed to check existing entries: ${countError.message}`);
		}

		// Only seed if table is empty
		if (!entriesCount || entriesCount === 0) {
			console.log('Seeding Pokédex entries...');

			// Transform data to match database schema
			const pokemonData = dex.map((pokemon: any) => ({
				pokedexNumber: pokemon.pokedexNumber,
				pokemon: pokemon.pokemon,
				form: pokemon.form || null,
				canGigantamax: pokemon.canGigantamax || false,
				regionToCatchIn: pokemon.regionToCatchIn || null,
				gamesToCatchIn: pokemon.gamesToCatchIn || null,
				regionToEvolveIn: pokemon.regionToEvolveIn || null,
				evolutionInformation: pokemon.evolutionInformation || null,
				catchInformation: pokemon.catchInformation || null,
				boxPlacementFormsBox: pokemon.boxPlacementForms?.box || null,
				boxPlacementFormsRow: pokemon.boxPlacementForms?.row || null,
				boxPlacementFormsColumn: pokemon.boxPlacementForms?.column || null,
				boxPlacementBox: pokemon.boxPlacement?.box || null,
				boxPlacementRow: pokemon.boxPlacement?.row || null,
				boxPlacementColumn: pokemon.boxPlacement?.column || null
			}));

			const { error: insertError } = await supabase.from('pokedex_entries').insert(pokemonData);

			if (insertError) {
				throw new Error(`Failed to seed Pokédex entries: ${insertError.message}`);
			}

			console.log(`Seeded ${pokemonData.length} Pokédex entries`);
		} else {
			console.log('Pokédex entries already exist, skipping seeding');
		}

		// Seed region-game mappings (check if table exists first)
		const { count: mappingsCount, error: mappingCountError } = await supabase
			.from('region_game_mappings')
			.select('*', { count: 'exact', head: true });

		if (!mappingCountError && (!mappingsCount || mappingsCount === 0)) {
			console.log('Seeding region-game mappings...');

			const { error: mappingInsertError } = await supabase
				.from('region_game_mappings')
				.insert(RegionGameMappingJson);

			if (mappingInsertError) {
				throw new Error(`Failed to seed region-game mappings: ${mappingInsertError.message}`);
			}

			console.log(`Seeded ${RegionGameMappingJson.length} region-game mappings`);
		} else if (!mappingCountError) {
			console.log('Region-game mappings already exist, skipping seeding');
		}

		return json({
			message: 'Seeding completed successfully',
			seeded: {
				pokemonEntries: !entriesCount || entriesCount === 0,
				regionGameMappings: !mappingCountError && (!mappingsCount || mappingsCount === 0)
			}
		});
	} catch (error) {
		console.error('Seeding failed:', error);
		return json(
			{
				message: 'Seeding failed',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
