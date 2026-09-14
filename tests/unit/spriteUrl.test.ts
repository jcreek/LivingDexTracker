import { describe, expect, it } from 'vitest';
import { resolveSpriteUrl } from '$lib/utils/spriteUrl';

describe('resolveSpriteUrl', () => {
	it('uses a supplied sprite key and local shiny path', () => {
		expect(
			resolveSpriteUrl({ pokedexNumber: 25, form: '', spriteKey: '25-partner-cap' }, true, true)
		).toBe('/sprites-small/home/shiny/25-partner-cap.webp');
	});

	it('places female forms in the female folder', () => {
		expect(
			resolveSpriteUrl({ pokedexNumber: 592, form: 'female', spriteKey: '592' }, false, true)
		).toBe('/sprites-small/home/female/592.webp');
	});

	it('derives the established fallback key for regional forms', () => {
		expect(resolveSpriteUrl({ pokedexNumber: 83, form: 'Galarian' }, false, false)).toBe(
			'https://raw.githubusercontent.com/jcreek/LivingDexTracker/master/static/sprites-small/home/83-galar.webp'
		);
	});

	it('uses the Pokédex number for the default male form', () => {
		expect(resolveSpriteUrl({ pokedexNumber: 25, form: 'Male' }, false, true)).toBe(
			'/sprites-small/home/25.webp'
		);
	});

	it('normalizes decorated form names and an all-zero number', () => {
		expect(
			resolveSpriteUrl({ pokedexNumber: 0, form: 'Form 2 [event] (legacy)' }, false, true)
		).toBe('/sprites-small/home/0-form-two.webp');
	});
});
