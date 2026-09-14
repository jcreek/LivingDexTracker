import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizedIdentity, readRepoCsv } from '../support/csv';

const pokemon = readRepoCsv('data/csvs/pokemon.csv');
const games = readRepoCsv('data/csvs/games.csv');
const regions = readRepoCsv('data/csvs/regions.csv');
const dexes = readRepoCsv('data/csvs/game-dexes.csv');

function duplicates(values: string[]) {
	const counts = new Map<string, number>();
	for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
	return [...counts].filter(([, count]) => count > 1);
}

describe('reference-data relationships', () => {
	it('uses unique, valid region and game identities', () => {
		expect(duplicates(regions.map((row) => normalizedIdentity(row.region)))).toEqual([]);
		expect(duplicates(games.map((row) => normalizedIdentity(row.game)))).toEqual([]);
		const knownRegions = new Set(regions.map((row) => row.region));
		expect(games.filter((row) => !knownRegions.has(row.region))).toEqual([]);
		expect(
			games.filter(
				(row) => !Number.isInteger(Number(row.releaseYear)) || Number(row.releaseYear) < 1996
			)
		).toEqual([]);
	});

	it('uses unique dex ids and references known games and tracked files', () => {
		expect(duplicates(dexes.map((row) => normalizedIdentity(row.dexId)))).toEqual([]);
		const knownGames = new Set(games.map((row) => row.game));
		expect(dexes.filter((row) => !knownGames.has(row.gameDisplayName))).toEqual([]);
		expect(dexes.filter((row) => !existsSync(resolve('data/csvs', row.file)))).toEqual([]);
		const knownDexes = new Set(dexes.map((row) => row.dexId));
		expect(dexes.filter((row) => row.parentDexId && !knownDexes.has(row.parentDexId))).toEqual([]);
	});

	it('keeps Pokémon origin references valid', () => {
		const knownRegions = new Set(regions.map((row) => row.region));
		const knownGames = new Set(games.map((row) => row.game));
		expect(pokemon.filter((row) => !knownRegions.has(row.originRegionToCatchIn))).toEqual([]);
		const unknownGames = pokemon.flatMap((row) =>
			row.originGamesToCatchIn
				.split('/')
				.map((game) => game.trim())
				.filter((game) => game && !knownGames.has(game))
				.map((game) => `${row.pokemon}: ${game}`)
		);
		expect(unknownGames).toEqual([]);
	});

	it('resolves every native-dex member to a unique Pokémon identity', () => {
		const identities = new Set(pokemon.map((row) => normalizedIdentity(row.pokemon, row.form)));
		const species = new Set(pokemon.map((row) => normalizedIdentity(row.pokemon)));
		const failures: string[] = [];
		for (const file of new Set(dexes.map((row) => row.file))) {
			const rows = readRepoCsv(`data/csvs/${file}`);
			const memberIdentities = rows.map((row) => normalizedIdentity(row.pokemon, row.form));
			for (const duplicate of duplicates(memberIdentities))
				failures.push(`${file}: duplicate ${duplicate[0]}`);
			for (const row of rows) {
				const resolves = row.form
					? identities.has(normalizedIdentity(row.pokemon, row.form))
					: species.has(normalizedIdentity(row.pokemon));
				if (!resolves) {
					failures.push(`${file}: unknown ${row.pokemon}|${row.form}`);
				}
				if (
					row.dexNumber &&
					(!Number.isInteger(Number(row.dexNumber)) || Number(row.dexNumber) < 0)
				) {
					failures.push(`${file}: invalid dex number ${row.dexNumber}`);
				}
			}
		}
		expect(failures).toEqual([]);
	});

	it('has a tracked normal sprite for every declared sprite key', () => {
		const missing = pokemon
			.filter((row) => {
				const folder = /^female\b/i.test(row.form) ? 'female' : '';
				return !existsSync(resolve('static/sprites-small/home', folder, `${row.spriteKey}.webp`));
			})
			.map((row) => `${row.pokemon}|${row.form} -> ${row.spriteKey}`);
		expect(missing).toEqual([]);
	});
});
