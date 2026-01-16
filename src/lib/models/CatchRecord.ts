// Supabase-based CatchRecord interface
export interface CatchRecord {
	_id: string; // Maps to Supabase 'id' field for frontend compatibility
	userId: string;
	pokemonId: string;
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	personalNotes: string;
}

// Database record type for Supabase
export interface CatchRecordDB {
	id: string;
	userId: string;
	/** Numeric foreign key in database (references `pokemon.id`) */
	pokemonId: number;
	pokedexId: string; // NEW: Foreign key to pokedexes table
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	personalNotes: string;
	createdAt: string;
	updatedAt: string;
}
