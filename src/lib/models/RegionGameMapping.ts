// Supabase-based RegionGameMapping interface
export interface RegionGameMapping {
	id?: number;
	region: string;
	game: string; // Note: Different from MongoDB version which had 'games' array
}

// Database record type for Supabase
export interface RegionGameMappingDB {
	id: number;
	region: string;
	game: string;
}
