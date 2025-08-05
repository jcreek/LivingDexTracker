export interface PokedexEntry {
	id: number;
	pokedexNumber: number;
	pokemon: string;
	form?: string | null;
	canGigantamax: boolean;
	regionToCatchIn?: string | null;
	gamesToCatchIn?: string[] | null;
	regionToEvolveIn?: string | null;
	evolutionInformation?: string | null;
	catchInformation?: string[] | null;
	
	// Regional pokedex numbers
	kantoNumber?: number | null;
	johtoNumber?: number | null;
	hoennNumber?: number | null;
	sinnohNumber?: number | null;
	sinnohExtendedNumber?: number | null;
	unovaNumber?: number | null;
	unovaUpdatedNumber?: number | null;
	kalosCentralNumber?: number | null;
	kalosCoastalNumber?: number | null;
	kalosMountainNumber?: number | null;
	hoennUpdatedNumber?: number | null;
	alolaNumber?: number | null;
	alolaUpdatedNumber?: number | null;
	melemeleNumber?: number | null;
	akalaNumber?: number | null;
	ulaulaNumber?: number | null;
	poniNumber?: number | null;
	galarNumber?: number | null;
	isleArmorNumber?: number | null;
	crownTundraNumber?: number | null;
	hisuiNumber?: number | null;
	paldeaNumber?: number | null;
	kitakamiNumber?: number | null;
	blueberryNumber?: number | null;
	
	// Box placement
	boxPlacementFormsBox?: number | null;
	boxPlacementFormsRow?: number | null;
	boxPlacementFormsColumn?: number | null;
	boxPlacementBox?: number | null;
	boxPlacementRow?: number | null;
	boxPlacementColumn?: number | null;
	
	createdAt?: string;
	updatedAt?: string;
}

export interface RegionalPokedexInfo {
	id: number;
	name: string;
	displayName: string;
	columnName: string;
	region?: string | null;
	generation?: string | null;
	games?: string[] | null;
	totalPokemon?: number | null;
	pokeapiId?: number | null;
	createdAt?: string;
}

export interface UserPokedex {
	id: string;
	userId: string;
	name: string;
	gameScope: 'all_games' | 'specific_generation';
	regionalPokedexId?: number | null;
	isShiny: boolean;
	requiresOrigin: boolean;
	includeForms: boolean;
	region?: string | null;
	games?: string[] | null;
	generation?: string | null;
	createdAt?: string;
	updatedAt?: string;
	// Virtual field from join
	regionalPokedexInfo?: RegionalPokedexInfo;
}

export interface CatchRecord {
	id: string;
	userPokedexId: string;
	pokedexEntryId: number;
	isCaught: boolean;
	catchStatus: 'not_caught' | 'caught' | 'ready_to_evolve';
	catchLocation: 'none' | 'in_game' | 'in_home';
	originRegion?: string | null;
	gameCaughtIn?: string | null;
	isGigantamax: boolean;
	notes?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface PokemonWithCatchStatus extends PokedexEntry {
	catchRecord?: CatchRecord;
}

export interface BoxViewData {
	boxNumber: number;
	pokemon: (PokemonWithCatchStatus | null)[];
	totalBoxes: number;
}

export interface PokedexStats {
	total: number;
	caught: number;
	readyToEvolve: number;
	percentComplete: number;
}