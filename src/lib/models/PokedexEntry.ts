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

	// Regional pokedex numbers
	regionalNumber?: number; // From normalized regional_pokedex_entries table
	kantoNumber?: number;
	johtoNumber?: number;
	hoennNumber?: number;
	sinnohNumber?: number;
	sinnohExtendedNumber?: number;
	unovaNumber?: number;
	unovaUpdatedNumber?: number;
	kalosCentralNumber?: number;
	kalosCoastalNumber?: number;
	kalosMountainNumber?: number;
	hoennUpdatedNumber?: number;
	alolaNumber?: number;
	alolaUpdatedNumber?: number;
	melemeleNumber?: number;
	akalaNumber?: number;
	ulaulaNumber?: number;
	poniNumber?: number;
	galarNumber?: number;
	isleArmorNumber?: number;
	crownTundraNumber?: number;
	hisuiNumber?: number;
	paldeaNumber?: number;
	kitakamiNumber?: number;
	blueberryNumber?: number;
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

	// Regional pokedex numbers (snake_case for DB)
	kanto_number: number | null;
	johto_number: number | null;
	hoenn_number: number | null;
	sinnoh_number: number | null;
	sinnoh_extended_number: number | null;
	unova_number: number | null;
	unova_updated_number: number | null;
	kalos_central_number: number | null;
	kalos_coastal_number: number | null;
	kalos_mountain_number: number | null;
	hoenn_updated_number: number | null;
	alola_number: number | null;
	alola_updated_number: number | null;
	melemele_number: number | null;
	akala_number: number | null;
	ulaula_number: number | null;
	poni_number: number | null;
	galar_number: number | null;
	isle_armor_number: number | null;
	crown_tundra_number: number | null;
	hisui_number: number | null;
	paldea_number: number | null;
	kitakami_number: number | null;
	blueberry_number: number | null;

	boxPlacementFormsBox: number | null;
	boxPlacementFormsRow: number | null;
	boxPlacementFormsColumn: number | null;
	boxPlacementBox: number | null;
	boxPlacementRow: number | null;
	boxPlacementColumn: number | null;
	createdAt: string;
	updatedAt: string;
}
