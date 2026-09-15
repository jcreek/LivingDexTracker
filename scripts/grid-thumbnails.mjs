import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Bump the URL version whenever dimensions, quality or source artwork changes.
const source = 'static/sprites-small/home';
const destination = 'static/sprites-grid/v1/home';
const files = [];
async function walk(relative = '') {
	for (const entry of await readdir(path.join(source, relative), { withFileTypes: true })) {
		const name = path.join(relative, entry.name);
		if (entry.isDirectory()) await walk(name);
		else if (entry.name.endsWith('.webp')) files.push(name);
	}
}
await walk();
const manifest = [];
for (const relative of files.sort()) {
	const target = path.join(destination, relative);
	await mkdir(path.dirname(target), { recursive: true });
	try {
		await stat(target);
	} catch {
		await sharp(path.join(source, relative))
			.resize(128, 128, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 80 })
			.toFile(target);
	}
	manifest.push({ path: relative.split(path.sep).join('/'), bytes: (await stat(target)).size });
}
await writeFile(
	'static/sprites-grid/v1/manifest.json',
	JSON.stringify({ version: 1, width: 128, quality: 80, files: manifest })
);
console.log(`Prepared ${files.length} versioned grid thumbnails; originals preserved.`);
