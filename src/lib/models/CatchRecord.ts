// Enhanced catch status enum
export type CatchStatus = 'not_caught' | 'caught' | 'ready_to_evolve';

// Location status enum (mutually exclusive)
export type LocationStatus = 'none' | 'in_game' | 'in_home';

// Supabase-based CatchRecord interface
export interface CatchRecord {
	_id: string; // Maps to Supabase 'id' field for frontend compatibility
	userId: string;
	pokedexEntryId: string; // String representation of the foreign key
	pokedexId?: string; // Links to user pokédx (optional, API will set default)
	// Legacy fields (keep for backward compatibility)
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	// Enhanced fields
	catchStatus?: CatchStatus; // Enhanced catch status
	locationStatus?: LocationStatus; // Enhanced location tracking
	personalNotes: string;
}

// Database record type for Supabase
export interface CatchRecordDB {
	id: string;
	userId: string;
	pokedexEntryId: number; // Numeric foreign key in database
	pokedex_id: string; // Links to user pokédex (snake_case for DB)
	// Legacy fields (keep for backward compatibility)
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	// Enhanced fields
	catch_status?: string; // Enhanced catch status (snake_case for DB)
	location_status?: string; // Enhanced location tracking (snake_case for DB)
	personalNotes: string;
	createdAt: string;
	updatedAt: string;
}
