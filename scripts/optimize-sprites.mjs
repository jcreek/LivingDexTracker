#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { mkdir, readdir, rename } from 'node:fs/promises';
import sharp from 'sharp';

const inputDir = process.env.SPRITE_INPUT_DIR ?? path.join(process.cwd(), 'static', 'sprites');
const outputDir =
	process.env.SPRITE_OUTPUT_DIR ?? path.join(process.cwd(), 'static', 'sprites-small');
const format = (process.env.SPRITE_FORMAT ?? 'webp').toLowerCase();
const quality = Number(process.env.SPRITE_QUALITY ?? 80);
const maxSize = Number(process.env.SPRITE_MAX_SIZE ?? 0);

if (!['png', 'webp'].includes(format)) {
	console.error(`Unsupported SPRITE_FORMAT "${format}". Use "png" or "webp".`);
	process.exit(1);
}

async function walk(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await walk(fullPath, files);
			continue;
		}
		if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
			files.push(fullPath);
		}
	}
	return files;
}

const files = await walk(inputDir);
console.log(`Optimizing ${files.length} sprite images from ${inputDir}`);

for (const [index, file] of files.entries()) {
	const relative = path.relative(inputDir, file);
	const baseName = path.basename(file, path.extname(file));
	const targetDir = path.join(outputDir, path.dirname(relative));
	await mkdir(targetDir, { recursive: true });

	const targetExt = format === 'png' ? '.png' : '.webp';
	const targetPath = path.join(targetDir, `${baseName}${targetExt}`);
	const tempPath = format === 'png' && outputDir === inputDir ? `${targetPath}.tmp` : targetPath;

	const pipeline = sharp(file);
	if (maxSize > 0) {
		pipeline.resize({
			width: maxSize,
			height: maxSize,
			fit: 'inside',
			withoutEnlargement: true
		});
	}

	if (format === 'png') {
		await pipeline.png({ compressionLevel: 9, palette: true, quality }).toFile(tempPath);
	} else {
		await pipeline.webp({ quality }).toFile(tempPath);
	}

	if (tempPath !== targetPath) {
		await rename(tempPath, targetPath);
	}

	if ((index + 1) % 250 === 0) {
		console.log(`Processed ${index + 1}/${files.length}`);
	}
}

console.log('Sprite optimization complete.');
