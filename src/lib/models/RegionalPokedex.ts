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

// Multi-regional pokédx configuration for games with multiple regions
export interface MultiRegionalPokedex {
	gameGroup: string;
	displayName: string;
	games: string[];
	regions: Array<{
		name: string;
		displayName: string;
		isDefault?: boolean;
	}>;
}

// Games that have multiple regional pokédxes
export const MULTI_REGIONAL_POKEDEXES: MultiRegionalPokedex[] = [
	{
		gameGroup: 'kalos',
		displayName: 'Kalos (X/Y)',
		games: ['x', 'y'],
		regions: [
			{ name: 'kalos-central', displayName: 'Central', isDefault: true },
			{ name: 'kalos-coastal', displayName: 'Coastal' },
			{ name: 'kalos-mountain', displayName: 'Mountain' }
		]
	},
	{
		gameGroup: 'alola',
		displayName: 'Alola (Sun/Moon/USUM)',
		games: ['sun', 'moon', 'ultra-sun', 'ultra-moon'],
		regions: [
			{ name: 'alola', displayName: 'Alola', isDefault: true },
			{ name: 'melemele', displayName: 'Melemele' },
			{ name: 'akala', displayName: 'Akala' },
			{ name: 'ulaula', displayName: 'Ulaula' },
			{ name: 'poni', displayName: 'Poni' }
		]
	},
	{
		gameGroup: 'galar',
		displayName: 'Galar (Sword/Shield)',
		games: ['sword', 'shield'],
		regions: [
			{ name: 'galar', displayName: 'Galar', isDefault: true },
			{ name: 'isle-armor', displayName: 'Isle of Armor' },
			{ name: 'crown-tundra', displayName: 'Crown Tundra' }
		]
	},
	{
		gameGroup: 'paldea',
		displayName: 'Paldea (Scarlet/Violet)',
		games: ['scarlet', 'violet'],
		regions: [
			{ name: 'paldea', displayName: 'Paldea', isDefault: true },
			{ name: 'kitakami', displayName: 'Kitakami' },
			{ name: 'blueberry', displayName: 'Blueberry Academy' }
		]
	}
];

// Helper function to get multi-regional configuration for a regional pokédx name
export function getMultiRegionalConfig(regionalPokedexName: string): MultiRegionalPokedex | null {
	return (
		MULTI_REGIONAL_POKEDEXES.find((config) =>
			config.regions.some((region) => region.name === regionalPokedexName)
		) || null
	);
}

// Helper function to check if a regional pokédx is part of a multi-regional game
export function isMultiRegional(regionalPokedexName: string): boolean {
	return getMultiRegionalConfig(regionalPokedexName) !== null;
}
