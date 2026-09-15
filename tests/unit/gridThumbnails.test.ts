import { describe, expect, it } from 'vitest';
import { resolveGridSpriteUrl, resolveSpriteUrl } from '$lib/utils/spriteUrl';

describe('versioned grid artwork', () => {
	it('separates grid and detail URLs for shiny, female and named forms', () => {
		for (const form of ['', 'Female', 'Alolan', 'Female Mega']) {
			for (const shiny of [false, true]) {
				const entry = { pokedexNumber: 25, form, spriteKey: '25' };
				const grid = resolveGridSpriteUrl(entry, shiny);
				expect(grid).toBe(
					resolveSpriteUrl(entry, shiny, true).replace(
						'/sprites-small/home/',
						'/sprites-grid/v1/home/'
					)
				);
				expect(resolveSpriteUrl(entry, shiny, true)).not.toContain('sprites-grid');
			}
		}
	});
	// Source-to-output consistency is checked when artifacts are built, not required for a fresh unit-only checkout.
	it('keeps the grid sprite URL version explicit', () => {
		expect(resolveGridSpriteUrl({ pokedexNumber: 1 }, false)).toBe('/sprites-grid/v1/home/1.webp');
	});
});
