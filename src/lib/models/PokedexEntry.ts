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
	// Regional dex numbers
	kantoDexNumber?: number;
	johtoDexNumber?: number;
	hoennDexNumber?: number;
	sinnohDexNumber?: number;
	unovaBwDexNumber?: number;
	unovaB2w2DexNumber?: number;
	kalosCentralDexNumber?: number;
	kalosCoastalDexNumber?: number;
	kalosMountainDexNumber?: number;
	alolaSmDexNumber?: number;
	alolaUsumDexNumber?: number;
	galarDexNumber?: number;
	galarIsleOfArmorDexNumber?: number;
	galarCrownTundraDexNumber?: number;
	hisuiDexNumber?: number;
	paldeaDexNumber?: number;
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
	// Regional dex numbers - snake_case to match database
	kanto_dex_number: number | null;
	johto_dex_number: number | null;
	hoenn_dex_number: number | null;
	sinnoh_dex_number: number | null;
	unova_bw_dex_number: number | null;
	unova_b2w2_dex_number: number | null;
	kalos_central_dex_number: number | null;
	kalos_coastal_dex_number: number | null;
	kalos_mountain_dex_number: number | null;
	alola_sm_dex_number: number | null;
	alola_usum_dex_number: number | null;
	galar_dex_number: number | null;
	galar_isle_of_armor_dex_number: number | null;
	galar_crown_tundra_dex_number: number | null;
	hisui_dex_number: number | null;
	paldea_dex_number: number | null;
	createdAt: string;
	updatedAt: string;
}
