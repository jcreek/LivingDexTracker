import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import dex from '$lib/helpers/pokedex.json';
import RegionGameMappingJson from '$lib/helpers/region-game-mapping.json';

export const GET = async () => {
	// Only allow seeding in development
	if (process.env.NODE_ENV === 'production') {
		return json({ message: 'Seeding not allowed in production' }, { status: 403 });
	}

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	try {
		// Seed Pokédex entries
		const { data: existingEntries, error: countError } = await supabase
			.from('pokedex_entries')
			.select('id', { count: 'exact', head: true });

		if (countError) {
			throw new Error(`Failed to check existing entries: ${countError.message}`);
		}

		// Only seed if table is empty
		if (!existingEntries || existingEntries.length === 0) {
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
		const { data: existingMappings, error: mappingCountError } = await supabase
			.from('region_game_mappings')
			.select('id', { count: 'exact', head: true });

		if (!mappingCountError && (!existingMappings || existingMappings.length === 0)) {
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
				pokemonEntries: !existingEntries || existingEntries.length === 0,
				regionGameMappings:
					!mappingCountError && (!existingMappings || existingMappings.length === 0)
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
