import type { PokedexEntry } from './PokedexEntry';

export interface SharedCatchStatus {
	pokemonId: string;
	caught: boolean;
	haveToEvolve: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
}

export interface SharedPokedexMetadata {
	name: string;
	description: string;
	isLivingDex: boolean;
	isShinyDex: boolean;
	isOriginDex: boolean;
	isFormDex: boolean;
	gameScope: string | null;
	dexScopes: string[];
}

export interface SharedPokedexRpcData extends SharedPokedexMetadata {
	catchStatuses: SharedCatchStatus[];
}

export interface SharedCombinedData {
	pokedexEntry: PokedexEntry;
	catchRecord: SharedCatchStatus | null;
}

export interface SharedPokedexData extends SharedPokedexMetadata {
	combinedData: SharedCombinedData[];
	total: number;
	caught: number;
	completionPercentage: number;
}
