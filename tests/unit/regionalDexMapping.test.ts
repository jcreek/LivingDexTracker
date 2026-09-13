import { describe, expect, it } from 'vitest';
import {
	getRegionalDexColumnName,
	getRegionalDexFieldName,
	getRegionalDexKey,
	hasRegionalDex
} from '$lib/utils/regionalDexMapping';

describe('regional dex mapping', () => {
	it.each([
		['Red', 'kanto', 'kanto_dex_number', 'kantoDexNumber'],
		['Black2', 'unova_b2w2', 'unova_b2w2_dex_number', 'unovaB2w2DexNumber'],
		['UltraMoon', 'alola_usum', 'alola_usum_dex_number', 'alolaUsumDexNumber'],
		['Scarlet', 'paldea', 'paldea_dex_number', 'paldeaDexNumber']
	])('maps %s consistently', (game, key, column, field) => {
		expect(hasRegionalDex(game)).toBe(true);
		expect(getRegionalDexKey(game)).toBe(key);
		expect(getRegionalDexColumnName(game)).toBe(column);
		expect(getRegionalDexFieldName(game)).toBe(field);
	});

	it('returns no mapping for unknown games', () => {
		expect(hasRegionalDex('Legends Z-A')).toBe(false);
		expect(getRegionalDexKey('Legends Z-A')).toBeUndefined();
		expect(getRegionalDexColumnName('Legends Z-A')).toBeUndefined();
		expect(getRegionalDexFieldName('Legends Z-A')).toBeUndefined();
	});
});
