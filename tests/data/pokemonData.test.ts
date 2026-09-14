import { describe, it, expect } from 'vitest';
import { normalizedIdentity, readRepoCsv } from '../support/csv';

/**
 * Correctness checks for the Pokemon reference data itself - not the code that queries it.
 *
 * Everything here is offline and unconditional: it cross-checks `data/csvs/pokemon.csv`
 * against `static/sprites/pokeapi-pokemon.csv`, a tracked export of PokeAPI's `pokemon`
 * table (`id` matches this project's spriteKey convention, `species_id` is the national dex
 * number, `is_default` is PokeAPI's canonical default-variety flag).
 *
 * `defaultForm.integration.test.ts` asserts the CSV still mirrors the database, so these
 * checks cannot quietly drift away from what the app actually serves. The canonical named
 * forms are test input rather than being parsed from the fix migration, which lets this
 * suite load on the pre-fix commit and fail only on observable data differences.
 */
type ApiRow = { id: string; identifier: string; species_id: string; is_default: string };

const EXPECTED_NATIONAL_DEX_MAX = 1025;
const pokemon = readRepoCsv('data/csvs/pokemon.csv');
const apiRows = readRepoCsv('static/sprites/pokeapi-pokemon.csv') as unknown as ApiRow[];
const api = new Map(apiRows.map((r) => [r.id, r]));

const canonicalNamedDefaults = {
	Alcremie: 'Vanilla Strawberry',
	Basculin: 'Red-striped',
	Beautifly: 'male',
	Burmy: 'Leaf Cloak',
	Deerling: 'Spring',
	Dudunsparce: '2-Segment',
	Enamorus: 'Incarnate Form',
	Flabébé: 'Red',
	Floette: 'Red',
	Florges: 'Red',
	Gastrodon: 'West Sea',
	Gimmighoul: 'Box Form',
	Gourgeist: 'Medium',
	Gulpin: 'male',
	Hoopa: 'Confined',
	Landorus: 'Incarnate Form',
	Lycanroc: 'Midday',
	Maushold: 'Family of 4',
	Minior: 'Red',
	Oricorio: 'Baile (Red)',
	Poltchageist: 'Phony',
	Polteageist: 'Phony',
	Pumpkaboo: 'Medium',
	Sawsbuck: 'Spring',
	Shaymin: 'Normal Form',
	Shellos: 'West Sea',
	Sinistcha: 'Phony',
	Sinistea: 'Phony',
	Squawkabilly: 'Green',
	Swalot: 'male',
	Tatsugiri: 'Curly',
	Thundurus: 'Incarnate Form',
	Tornadus: 'Incarnate Form',
	Toxtricity: 'Amped',
	Unown: 'A',
	Urshifu: 'Single',
	Vivillon: 'Meadow (France-Alsace) [Not Ultra Sun compatible]',
	Wormadam: 'Leaf Cloak',
	Zygarde: '50%',
	Rotom: 'Lightbulb'
} as const;

const declaredDefaults = Object.entries(canonicalNamedDefaults).map(([pokemon, form]) => ({
	pokemon,
	form
}));

/**
 * PokeAPI's default variety for Minior is `minior-red-meteor` (the shielded Meteor Form),
 * which this dataset doesn't track because it isn't separately catchable - a caught Minior
 * always resolves to a core colour. Red is the conventional stand-in.
 */
const DEFAULT_FORM_EXCEPTIONS = new Set(['Minior']);

describe('pokemon.csv structure', () => {
	it('covers every national dex number from 1 through the declared maximum', () => {
		const numbers = [...new Set(pokemon.map((row) => Number(row.pokedexNumber)))].sort(
			(a, b) => a - b
		);
		expect(numbers).toEqual(
			Array.from({ length: EXPECTED_NATIONAL_DEX_MAX }, (_, index) => index + 1)
		);
	});

	it('maps each number to one species and each species to one number', () => {
		const speciesByNumber = new Map<number, Set<string>>();
		const numbersBySpecies = new Map<string, Set<number>>();
		for (const row of pokemon) {
			const number = Number(row.pokedexNumber);
			if (!speciesByNumber.has(number)) speciesByNumber.set(number, new Set());
			if (!numbersBySpecies.has(row.pokemon)) numbersBySpecies.set(row.pokemon, new Set());
			speciesByNumber.get(number)?.add(row.pokemon);
			numbersBySpecies.get(row.pokemon)?.add(number);
		}

		expect([...speciesByNumber].filter(([, species]) => species.size !== 1)).toEqual([]);
		expect([...numbersBySpecies].filter(([, numbers]) => numbers.size !== 1)).toEqual([]);
	});

	it('has no duplicate species/form rows', () => {
		const seen = new Map<string, number>();
		for (const r of pokemon) {
			const key = normalizedIdentity(r.pokemon, r.form);
			seen.set(key, (seen.get(key) ?? 0) + 1);
		}
		expect([...seen.entries()].filter(([, n]) => n > 1)).toEqual([]);
	});

	it('has no duplicate national-number/form rows', () => {
		const seen = new Map<string, number>();
		for (const row of pokemon) {
			const key = normalizedIdentity(row.pokedexNumber, row.form);
			seen.set(key, (seen.get(key) ?? 0) + 1);
		}
		expect([...seen.entries()].filter(([, count]) => count > 1)).toEqual([]);
	});

	it('has valid required fields on every row', () => {
		const invalid = pokemon.filter(
			(row) =>
				!Number.isInteger(Number(row.pokedexNumber)) ||
				Number(row.pokedexNumber) <= 0 ||
				!row.pokemon ||
				!row.originRegionToCatchIn ||
				!row.originGamesToCatchIn
		);
		expect(invalid).toEqual([]);
	});

	it('gives every row a sprite key', () => {
		expect(pokemon.filter((r) => !r.spriteKey)).toEqual([]);
	});
});

describe('pokemon.csv agrees with the PokeAPI reference export', () => {
	it('matches PokeAPI on the national dex number behind every numeric sprite key', () => {
		// Wyrdeer was seeded at 999 with sprite 999 - Gimmighoul's - so it sorted into the
		// wrong dex slot and rendered the wrong artwork. This is the check that catches that.
		const mismatches = pokemon
			.filter((r) => /^\d+$/.test(r.spriteKey) && api.has(r.spriteKey))
			.filter((r) => api.get(r.spriteKey)!.species_id !== r.pokedexNumber)
			.map((r) => `${r.pokemon} ${r.form} sprite=${r.spriteKey} dex=${r.pokedexNumber}`);

		expect(mismatches).toEqual([]);
	});

	it('resolves every numeric sprite key to a real PokeAPI entry', () => {
		const unresolved = pokemon
			.filter((r) => /^\d+$/.test(r.spriteKey) && !api.has(r.spriteKey))
			.map((r) => `${r.pokemon} ${r.form} -> ${r.spriteKey}`);

		expect(unresolved).toEqual([]);
	});
});

describe('declared default forms', () => {
	const bySpeciesForm = new Map(pokemon.map((r) => [`${r.pokemon}|${r.form}`, r]));

	it('names a row that actually exists', () => {
		// Mirrors the migration's own assertion, but fails in CI rather than only on deploy.
		const missing = declaredDefaults
			.filter((d) => !bySpeciesForm.has(`${d.pokemon}|${d.form}`))
			.map((d) => `${d.pokemon} '${d.form}'`);

		expect(missing).toEqual([]);
	});

	it('picks the form PokeAPI marks as the default variety', () => {
		// Independently validates the judgement calls - Zygarde 50% over 10%, Basculin
		// Red-striped, Toxtricity Amped, Urshifu Single Strike and the rest.
		const disagreements = declaredDefaults
			.filter((d) => !DEFAULT_FORM_EXCEPTIONS.has(d.pokemon))
			.map((d) => ({ d, row: bySpeciesForm.get(`${d.pokemon}|${d.form}`) }))
			.filter(({ row }) => row && /^\d+$/.test(row.spriteKey) && api.has(row.spriteKey))
			.filter(({ row }) => api.get(row!.spriteKey)!.is_default !== '1')
			.map(
				({ d, row }) =>
					`${d.pokemon} '${d.form}' -> ${api.get(row!.spriteKey)!.identifier} (is_default=0)`
			);

		expect(disagreements).toEqual([]);
	});

	it('checks a meaningful number of picks rather than silently resolving none', () => {
		// Guards the test above: form-suffixed sprite keys (666-meadow, 201-a, ...) have no
		// PokeAPI equivalent, so if the join broke entirely this would still pass vacuously.
		const verifiable = declaredDefaults
			.filter((d) => !DEFAULT_FORM_EXCEPTIONS.has(d.pokemon))
			.map((d) => bySpeciesForm.get(`${d.pokemon}|${d.form}`))
			.filter((row) => row && /^\d+$/.test(row.spriteKey) && api.has(row.spriteKey));

		expect(verifiable.length).toBeGreaterThanOrEqual(28);
	});
});

describe('default-form coverage', () => {
	it('declares a default for every species whose forms are all named', () => {
		// The original bug: Basculin's forms are all named, so nothing matched `form IS NULL`
		// and it disappeared from every non-form dex. Any future species added the same way
		// must be given an explicit default here.
		const bySpecies = new Map<string, Record<string, string>[]>();
		for (const r of pokemon) {
			bySpecies.set(r.pokemon, [...(bySpecies.get(r.pokemon) ?? []), r]);
		}
		const declared = new Set(declaredDefaults.map((d) => d.pokemon));

		const undeclared = [...bySpecies.entries()]
			.filter(([species, rows]) => rows.every((r) => r.form !== '') && !declared.has(species))
			.map(([species, rows]) => `${species} (forms: ${rows.map((r) => r.form).join(', ')})`);

		expect(undeclared).toEqual([]);
	});

	it('declares at most one default per species', () => {
		const counts = new Map<string, number>();
		for (const d of declaredDefaults) counts.set(d.pokemon, (counts.get(d.pokemon) ?? 0) + 1);
		expect([...counts.entries()].filter(([, n]) => n > 1)).toEqual([]);
	});
});
