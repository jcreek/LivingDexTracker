// Supabase-based PokedexEntry interface
export interface PokedexEntry {
	_id: string; // Maps to Supabase 'id' field for frontend compatibility
	pokedexNumber: number;
	boxPlacement: { box: number; row: number; column: number };
	boxPlacementForms: { box: number; row: number; column: number };
	pokemon: string;
	form: string;
	canGigantamax: boolean;
	regionToCatchIn: string;
	gamesToCatchIn: string[];
	regionToEvolveIn: string;
	evolutionInformation: string;
	catchInformation: string[];
}

// Database record type for Supabase
export interface PokedexEntryDB {
	id: number;
	pokedexNumber: number;
	pokemon: string;
	form: string | null;
	canGigantamax: boolean;
	regionToCatchIn: string | null;
	gamesToCatchIn: string[] | null;
	regionToEvolveIn: string | null;
	evolutionInformation: string | null;
	catchInformation: string[] | null;
	boxPlacementFormsBox: number | null;
	boxPlacementFormsRow: number | null;
	boxPlacementFormsColumn: number | null;
	boxPlacementBox: number | null;
	boxPlacementRow: number | null;
	boxPlacementColumn: number | null;
	createdAt: string;
	updatedAt: string;
}
