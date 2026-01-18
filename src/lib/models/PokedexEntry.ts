// Supabase-based PokedexEntry interface
export type CatchInformationItem = {
	game: string;
	location: string;
	notes: string;
};

export interface PokedexEntry {
	_id: string; // Maps to Supabase 'id' field for frontend compatibility
	pokedexNumber: number;
	pokemon: string;
	form: string;
	spriteKey: string;
	canGigantamax: boolean;
	regionToCatchIn: string;
	gamesToCatchIn: string[];
	regionToEvolveIn: string;
	evolutionInformation: string;
	catchInformation: Array<string | CatchInformationItem>;
	// Note: Regional dex numbers stored in separate regional_dex_numbers table
}

// Database record type for Supabase
export interface PokedexEntryDB {
	id: number;
	pokedexNumber: number;
	pokemon: string;
	form: string | null;
	spriteKey: string | null;
	canGigantamax: boolean;
	regionToCatchIn: string | null;
	gamesToCatchIn: string[] | null;
	regionToEvolveIn: string | null;
	evolutionInformation: string | null;
	catchInformation: string[] | null;
	// Note: Regional dex numbers stored in separate regional_dex_numbers table
	createdAt: string;
	updatedAt: string;
}
