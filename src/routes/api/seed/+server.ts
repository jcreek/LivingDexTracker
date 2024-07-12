import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import PokedexEntryModel from '$lib/models/PokedexEntry';
import PokedexEntryRepository from '$lib/repositories/PokedexEntryRepository';
import PokedexMetadataModel from '$lib/models/PokedexMetadata';
import dex from '$lib/helpers/pokedex.json';

// Function to update the lastModified field in the metadata collection
const updateLastModified = async () => {
	const metadata = await PokedexMetadataModel.findOne();
	if (metadata) {
		metadata.lastModified = new Date();
		await metadata.save();
	} else {
		await PokedexMetadataModel.create({ lastModified: new Date() });
	}
};

// Seed Pokedex data
export const GET = async () => {
	// Immediately return if not in development to prevent seeding extra data
	return;

	await dbConnect()
		.then(async () => {
			const repo = new PokedexEntryRepository();

			dex.forEach(async (pokemon: PokedexEntryModel) => {
				await repo.create(pokemon);
				console.log(`Seeded ${pokemon.pokedexNumber} ${pokemon.pokemon} ${pokemon.form}`);
			});

			// Update the lastModified field after seeding
			await updateLastModified();
		})
		.finally(() => dbDisconnect());

	return json({
		message: 'seeded'
	});
};
