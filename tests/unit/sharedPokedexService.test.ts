import { describe, expect, it } from 'vitest';
import { calculateSharedProgress, isShareToken } from '$lib/services/SharedPokedexService';

describe('shared Pokédex helpers', () => {
	it('accepts UUID capability tokens and rejects malformed route values', () => {
		expect(isShareToken('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
		expect(isShareToken('not-a-token')).toBe(false);
		expect(isShareToken('123e4567-e89b-12d3-a456-426614174000/extra')).toBe(false);
	});

	it('counts caught and needs-to-evolve entries as progress', () => {
		const progress = calculateSharedProgress(
			[
				{
					pokemonId: '1',
					caught: true,
					haveToEvolve: false,
					inHome: false,
					hasGigantamaxed: false
				},
				{
					pokemonId: '2',
					caught: false,
					haveToEvolve: true,
					inHome: false,
					hasGigantamaxed: false
				}
			],
			4
		);
		expect(progress).toEqual({ caught: 2, completionPercentage: 50 });
		expect(calculateSharedProgress([], 0)).toEqual({ caught: 0, completionPercentage: 0 });
	});
});
