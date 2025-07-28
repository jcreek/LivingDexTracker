// Regional pokedex information interface
export interface RegionalPokedexInfo {
	id: number;
	name: string;
	displayName: string;
	columnName: string;
	region?: string;
	generation?: string;
	games: string[];
	totalPokemon: number;
	pokeapiId: number;
	createdAt: string;
}

// Database record type for Supabase
export interface RegionalPokedexInfoDB {
	id: number;
	name: string;
	display_name: string;
	column_name: string;
	region?: string;
	generation?: string;
	games: string[] | null;
	total_pokemon: number;
	pokeapi_id: number;
	created_at: string;
}

// Helper function to get regional number from a pokemon entry
export function getRegionalNumber(pokemonEntry: any, regionalPokedexName: string): number | null {
	const columnMap: Record<string, string> = {
		national: 'pokedexNumber',
		kanto: 'kantoNumber',
		johto: 'johtoNumber',
		hoenn: 'hoennNumber',
		sinnoh: 'sinnohNumber',
		'sinnoh-extended': 'sinnohExtendedNumber',
		unova: 'unovaNumber',
		'unova-updated': 'unovaUpdatedNumber',
		'kalos-central': 'kalosCentralNumber',
		'kalos-coastal': 'kalosCoastalNumber',
		'kalos-mountain': 'kalosMountainNumber',
		'hoenn-updated': 'hoennUpdatedNumber',
		alola: 'alolaNumber',
		'alola-updated': 'alolaUpdatedNumber',
		melemele: 'melemeleNumber',
		akala: 'akalaNumber',
		ulaula: 'ulaulaNumber',
		poni: 'poniNumber',
		galar: 'galarNumber',
		'isle-armor': 'isleArmorNumber',
		'crown-tundra': 'crownTundraNumber',
		hisui: 'hisuiNumber',
		paldea: 'paldeaNumber',
		kitakami: 'kitakamiNumber',
		blueberry: 'blueberryNumber'
	};
	const columnName = columnMap[regionalPokedexName];
	if (!columnName) return null;
	const value = pokemonEntry[columnName];
	return value === undefined || value === null ? null : value;
}

// Predefined regional pokedexes for UI
export const REGIONAL_POKEDEXES = [
	{ value: 'national', label: 'National Pokédex (All Generations)' },
	{ value: 'kanto', label: 'Kanto Pokédex (Gen 1)' },
	{ value: 'johto', label: 'Johto Pokédex (Gen 2)' },
	{ value: 'hoenn', label: 'Hoenn Pokédex (Gen 3)' },
	{ value: 'sinnoh', label: 'Sinnoh Pokédex (Gen 4)' },
	{ value: 'sinnoh-extended', label: 'Extended Sinnoh Pokédex (Platinum)' },
	{ value: 'unova', label: 'Unova Pokédex (Black/White)' },
	{ value: 'unova-updated', label: 'Updated Unova Pokédex (B2/W2)' },
	{ value: 'kalos-central', label: 'Kalos Central Pokédex' },
	{ value: 'kalos-coastal', label: 'Kalos Coastal Pokédex' },
	{ value: 'kalos-mountain', label: 'Kalos Mountain Pokédex' },
	{ value: 'hoenn-updated', label: 'Updated Hoenn Pokédex (ORAS)' },
	{ value: 'alola', label: 'Alola Pokédex (Sun/Moon)' },
	{ value: 'alola-updated', label: 'Updated Alola Pokédex (USUM)' },
	{ value: 'melemele', label: 'Melemele Island Pokédex' },
	{ value: 'akala', label: 'Akala Island Pokédex' },
	{ value: 'ulaula', label: 'Ulaula Island Pokédex' },
	{ value: 'poni', label: 'Poni Island Pokédex' },
	{ value: 'galar', label: 'Galar Pokédex (Sword/Shield)' },
	{ value: 'isle-armor', label: 'Isle of Armor Pokédex' },
	{ value: 'crown-tundra', label: 'Crown Tundra Pokédex' },
	{ value: 'hisui', label: 'Hisui Pokédex (Legends Arceus)' },
	{ value: 'paldea', label: 'Paldea Pokédex (Scarlet/Violet)' },
	{ value: 'kitakami', label: 'Kitakami Pokédex (Teal Mask)' },
	{ value: 'blueberry', label: 'Blueberry Academy Pokédex (Indigo Disk)' }
] as const;
