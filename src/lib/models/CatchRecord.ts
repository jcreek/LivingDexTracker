// Supabase-based CatchRecord interface
export interface CatchRecord {
	_id: string; // Maps to Supabase 'id' field for frontend compatibility
	userId: string;
	pokedexEntryId: string; // String representation of the foreign key
	pokedexId?: string; // NEW FIELD - Links to user pokédx (optional, API will set default)
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
	pokedexEntryId: number; // Numeric foreign key in database
	pokedex_id: string; // NEW FIELD - Links to user pokédex (snake_case for DB)
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	personalNotes: string;
	createdAt: string;
	updatedAt: string;
}
