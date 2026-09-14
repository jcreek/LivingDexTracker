import type { CombinedData } from './CombinedData';
import type { Pokedex } from './Pokedex';

export const OFFLINE_SNAPSHOT_VERSION = 1;

export type OfflinePokedexSnapshot = {
	pokedex: Pokedex;
	entries: CombinedData[];
};

export type OfflineSnapshot = {
	version: typeof OFFLINE_SNAPSHOT_VERSION;
	generatedAt: string;
	userId: string;
	pokedexes: OfflinePokedexSnapshot[];
};
