import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import PokedexEntryModel from '$lib/models/PokedexEntry';
import PokedexEntryRepository from '$lib/repositories/PokedexEntryRepository';
import dex from '$lib/helpers/dex.json';

// seed pokedex data
export const GET = async () => {
	// Immediately return if not in development to prevent seeding extra data
	return;

	await dbConnect()
		.then(async () => {
			const repo = new PokedexEntryRepository();

			dex.forEach(async (pokemon) => {
				const pokemonModel = new PokedexEntryModel({
					order: pokemon.dexOrder,
					boxPlacement: {
						box: pokemon.boxNumber,
						row: pokemon.rowNumber,
						column: pokemon.columnNumber
					},
					pokedexNumber: pokemon.pokedexNumber,
					pokemon: pokemon.name,
					form: pokemon.form,
					generation: pokemon.generation,
					originGame: pokemon.originGame,
					alternativeOrigin: pokemon.altOriginGame,
					howToObtain: pokemon.notesToObtain
				});

				await repo.create(pokemonModel);
				console.log(`Seeded ${pokemon.dexOrder}`);
			});
		})
		.finally(() => dbDisconnect());

	return json({
		message: 'seeded'
	});
};
