import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import { type PokedexEntry } from '$lib/models/PokedexEntry';
import PokedexEntryRepository from '$lib/repositories/PokedexEntryRepository';

export const GET = async () => {
	return json(await fetchPokeDexEntriesFromDatabase());
};

async function fetchPokeDexEntriesFromDatabase() {
	let pokemonData = null as PokedexEntry[] | null;

	try {
		await dbConnect();
		const repo = new PokedexEntryRepository();
		pokemonData = await repo.findAll();
		// order by pokedexNumber property, ascending
		pokemonData = pokemonData.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
	} catch (error) {
		console.error(error);
	} finally {
		dbDisconnect();
	}

	return pokemonData;
}
