#!/usr/bin/env node
// Lists every sprite (all forms, shiny and female variants) with its size, so the offline worker can
// save the complete set on request and tell whether anything is still missing.
import path from 'node:path';
import process from 'node:process';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SPRITE_MANIFEST_NAME = 'manifest.json';

async function walk(dir, files = []) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) await walk(fullPath, files);
		else if (entry.isFile() && entry.name.endsWith('.webp')) files.push(fullPath);
	}
	return files;
}

/** Builds the manifest for `<spritesDir>/home`, with paths relative to that folder. */
export async function buildSpriteManifest(spritesDir) {
	const homeDir = path.join(spritesDir, 'home');
	const files = await walk(homeDir);
	const entries = await Promise.all(
		files.map(async (file) => [
			path.relative(homeDir, file).split(path.sep).join('/'),
			(await stat(file)).size
		])
	);
	entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	return { version: 1, files: entries };
}

export async function writeSpriteManifest(spritesDir) {
	const manifest = await buildSpriteManifest(spritesDir);
	await writeFile(path.join(spritesDir, SPRITE_MANIFEST_NAME), `${JSON.stringify(manifest)}\n`);
	return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const spritesDir =
		process.env.SPRITE_OUTPUT_DIR ?? path.join(process.cwd(), 'static', 'sprites-small');
	const manifest = await writeSpriteManifest(spritesDir);
	const bytes = manifest.files.reduce((total, [, size]) => total + size, 0);
	console.log(
		`Wrote ${manifest.files.length} sprites (${(bytes / 1048576).toFixed(1)} MB) to ${SPRITE_MANIFEST_NAME}`
	);
}
