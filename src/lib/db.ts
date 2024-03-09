import Dexie from 'dexie';

export interface PokedexEntry {
	order: number;
	boxPlacement: { box: number; row: number; column: number };
	pokedexNumber: number;
	pokemon: string;
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	form: string;
	generation: number;
	originGame: string;
	alternativeOrigin: string;
	howToObtain: string;
}

class PokemonDB extends Dexie {
	pokedex: Dexie.Table<PokedexEntry, number>;

	constructor() {
		super('LivingDexDB');
		this.version(1).stores({
			pokedex:
				'pokedexNumber, order, boxPlacement, pokemon, haveToEvolve, caught, inHome, form, generation, originGame, alternativeOrigin, howToObtain'
		});
		this.pokedex = this.table('pokedex');
	}
}

export const db = new PokemonDB();
