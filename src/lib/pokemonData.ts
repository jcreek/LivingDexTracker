import { type PokedexEntry } from './db';

export const pokemonData: PokedexEntry[] = [
	{
		order: 1,
		boxPlacement: { box: 1, row: 1, column: 1 },
		pokedexNumber: 1,
		pokemon: 'Bulbasaur',
		haveToEvolve: false,
		caught: false,
		inHome: false,
		form: '',
		generation: 1,
		originGame: 'Red/Blue/Yellow',
		alternativeOrigin: '',
		howToObtain: 'Starter Pokémon from Professor Oak'
	},
	{
		order: 2,
		boxPlacement: { box: 1, row: 1, column: 2 },
		pokedexNumber: 2,
		pokemon: 'Ivysaur',
		haveToEvolve: false,
		caught: false,
		inHome: false,
		form: '',
		generation: 1,
		originGame: 'Red/Blue/Yellow',
		alternativeOrigin: '',
		howToObtain: 'Evolved starter Pokémon from Professor Oak'
	}
];
