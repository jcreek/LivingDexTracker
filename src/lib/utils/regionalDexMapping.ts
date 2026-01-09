/**
 * Maps game names to their corresponding regional Pokédex identifier.
 * This mapping is used to determine which regional dex number to use when
 * filtering and ordering Pokémon for a specific game.
 */

type RegionalDexKey =
	| 'kanto'
	| 'johto'
	| 'hoenn'
	| 'sinnoh'
	| 'unova_bw'
	| 'unova_b2w2'
	| 'kalos_central'
	| 'kalos_coastal'
	| 'kalos_mountain'
	| 'alola_sm'
	| 'alola_usum'
	| 'galar'
	| 'galar_isle_of_armor'
	| 'galar_crown_tundra'
	| 'hisui'
	| 'paldea';

const gameToRegionalDexMap: Record<string, RegionalDexKey> = {
	// Kanto region
	'Red': 'kanto',
	'Blue': 'kanto',
	'Yellow': 'kanto',
	'FireRed': 'kanto',
	'LeafGreen': 'kanto',
	'LG: Pikachu': 'kanto',
	'LG: Eevee': 'kanto',

	// Johto region
	'Gold': 'johto',
	'Silver': 'johto',
	'Crystal': 'johto',
	'HeartGold': 'johto',
	'SoulSilver': 'johto',

	// Hoenn region
	'Ruby': 'hoenn',
	'Sapphire': 'hoenn',
	'Emerald': 'hoenn',
	'OmegaRuby': 'hoenn',
	'AlphaSapphire': 'hoenn',

	// Sinnoh region
	'Diamond': 'sinnoh',
	'Pearl': 'sinnoh',
	'Platinum': 'sinnoh',
	'BrilliantDiamond': 'sinnoh',
	'ShiningPearl': 'sinnoh',

	// Unova region
	'Black': 'unova_bw',
	'White': 'unova_bw',
	'Black2': 'unova_b2w2',
	'White2': 'unova_b2w2',

	// Kalos region - Note: All XY use all three sub-dexes
	// We default to Central for simplicity
	'X': 'kalos_central',
	'Y': 'kalos_central',

	// Alola region
	'Sun': 'alola_sm',
	'Moon': 'alola_sm',
	'UltraSun': 'alola_usum',
	'UltraMoon': 'alola_usum',

	// Galar region
	'Sword': 'galar',
	'Shield': 'galar',

	// Hisui region
	'LegendsArceus': 'hisui',

	// Paldea region
	'Scarlet': 'paldea',
	'Violet': 'paldea'
};

/**
 * Gets the regional dex key for a given game name.
 * Returns undefined if the game doesn't have a regional dex mapping.
 */
export function getRegionalDexKey(gameName: string): RegionalDexKey | undefined {
	return gameToRegionalDexMap[gameName];
}

/**
 * Checks if a game has a regional dex mapping.
 */
export function hasRegionalDex(gameName: string): boolean {
	return gameName in gameToRegionalDexMap;
}

/**
 * Gets the database column name for a game's regional dex.
 * Maps game name → database column name (e.g., 'Scarlet' → 'paldea_dex_number').
 * Returns undefined if the game doesn't have a regional dex mapping.
 */
export function getRegionalDexColumnName(gameName: string): string | undefined {
	const regionalKey = getRegionalDexKey(gameName);
	if (!regionalKey) return undefined;
	return `${regionalKey}_dex_number`;
}

/**
 * Gets the frontend field name for a game's regional dex.
 * Maps game name → PokedexEntry field name (e.g., 'Scarlet' → 'paldeaDexNumber').
 * Returns undefined if the game doesn't have a regional dex mapping.
 */
export function getRegionalDexFieldName(gameName: string): string | undefined {
	const regionalKey = getRegionalDexKey(gameName);
	if (!regionalKey) return undefined;

	// Map regional key to actual PokedexEntry field name (camelCase)
	const fieldMap: Record<string, string> = {
		'kanto': 'kantoDexNumber',
		'johto': 'johtoDexNumber',
		'hoenn': 'hoennDexNumber',
		'sinnoh': 'sinnohDexNumber',
		'unova_bw': 'unovaBwDexNumber',
		'unova_b2w2': 'unovaB2w2DexNumber',
		'kalos_central': 'kalosCentralDexNumber',
		'kalos_coastal': 'kalosCoastalDexNumber',
		'kalos_mountain': 'kalosMountainDexNumber',
		'alola_sm': 'alolaSmDexNumber',
		'alola_usum': 'alolaUsumDexNumber',
		'galar': 'galarDexNumber',
		'galar_isle_of_armor': 'galarIsleOfArmorDexNumber',
		'galar_crown_tundra': 'galarCrownTundraDexNumber',
		'hisui': 'hisuiDexNumber',
		'paldea': 'paldeaDexNumber'
	};

	return fieldMap[regionalKey];
}
