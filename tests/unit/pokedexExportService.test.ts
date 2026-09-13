import { describe, expect, it, vi } from 'vitest';
import {
	buildCsv,
	csvEscape,
	sanitizeFileName,
	shouldRefreshToken
} from '$lib/services/PokedexExportFormatting';

describe('Pokédex export formatting', () => {
	it.each([
		[null, ''],
		[undefined, ''],
		['plain', 'plain'],
		['comma,value', '"comma,value"'],
		['a "quote"', '"a ""quote"""'],
		['two\nlines', '"two\nlines"']
	])('escapes CSV value %j', (value, expected) => {
		expect(csvEscape(value)).toBe(expected);
	});

	it('sanitizes provider filenames while preserving a CSV suffix', () => {
		expect(sanitizeFileName(' My: Dex? ', 'fallback')).toBe('My- Dex-.csv');
		expect(sanitizeFileName('already.csv', 'fallback')).toBe('already.csv');
		expect(sanitizeFileName('***', 'fallback')).toBe('-.csv');
		expect(sanitizeFileName('   ', 'fallback')).toBe('fallback');
	});

	it('builds a stable, escaped CSV with defaults for missing catch records', () => {
		const csv = buildCsv([
			{
				pokedexEntry: {
					_id: '25',
					pokedexNumber: 25,
					pokemon: 'Pikachu',
					form: null
				},
				catchRecord: {
					caught: true,
					haveToEvolve: false,
					inHome: true,
					hasGigantamaxed: false,
					personalNotes: 'Comma, and "quote"'
				}
			},
			{
				pokedexEntry: {
					_id: '26',
					pokedexNumber: 26,
					pokemon: 'Raichu',
					form: 'Alolan'
				},
				catchRecord: null
			}
		] as never);
		expect(csv.split('\r\n')).toEqual([
			'pokemonId,pokedexNumber,pokemon,form,caught,haveToEvolve,inHome,personalNotes',
			'25,25,Pikachu,,true,false,true,"Comma, and ""quote"""',
			'26,26,Raichu,Alolan,false,false,false,'
		]);
	});

	it('refreshes only finite expiries within the next minute', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-13T12:00:00Z'));
		expect(shouldRefreshToken(null)).toBe(false);
		expect(shouldRefreshToken('not-a-date')).toBe(false);
		expect(shouldRefreshToken('2026-09-13T12:02:00Z')).toBe(false);
		expect(shouldRefreshToken('2026-09-13T12:00:30Z')).toBe(true);
		expect(shouldRefreshToken('2026-09-13T11:59:00Z')).toBe(true);
		vi.useRealTimers();
	});
});
