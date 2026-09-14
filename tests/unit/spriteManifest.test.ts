import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - plain ESM build script without type declarations
import { buildSpriteManifest } from '../../scripts/sprite-manifest.mjs';
import { resolveSpriteUrl, spriteRoot } from '$lib/utils/spriteUrl';

const spritesDir = path.join(process.cwd(), 'static', 'sprites-small');

describe('sprite manifest', () => {
	const committed = JSON.parse(readFileSync(path.join(spritesDir, 'manifest.json'), 'utf8'));

	it('lists exactly the sprite files on disk, with their sizes', async () => {
		// "Save all artwork" downloads this list, so a stale manifest would miss or 404 sprites.
		expect(committed).toEqual(await buildSpriteManifest(spritesDir));
	});

	it('covers forms, shiny and female variants', () => {
		const files: string[] = committed.files.map(([file]: [string, number]) => file);
		expect(files.some((file) => file.startsWith('shiny/'))).toBe(true);
		expect(files.some((file) => file.startsWith('female/'))).toBe(true);
		expect(files.some((file) => file.startsWith('shiny/female/'))).toBe(true);
		// Forms use either a "<number>-<form>" key or a 10000+ national-style number.
		expect(files.some((file) => /^\d+-[a-z0-9-]+\.webp$/.test(file))).toBe(true);
		expect(files.some((file) => /^10\d{3}\.webp$/.test(file))).toBe(true);
	});

	it('uses the same folder that sprite URLs resolve into', () => {
		for (const useLocal of [true, false]) {
			expect(
				resolveSpriteUrl({ pokedexNumber: 25, form: '', spriteKey: '25' }, true, useLocal)
			).toBe(`${spriteRoot(useLocal)}/shiny/25.webp`);
		}
	});
});
