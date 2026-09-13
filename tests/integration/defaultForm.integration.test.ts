import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import CombinedDataRepository from '../../src/lib/repositories/CombinedDataRepository';
import { readRepoCsv } from '../support/csv';

/**
 * Black-box data and repository regressions. These tests deliberately use only the schema
 * available before the fix: on master they load normally and fail on behavior, while the
 * fix branch makes the same assertions pass without test-only schema knowledge.
 */
const SUPABASE_URL = process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_KEY =
	process.env.TEST_SUPABASE_ANON_KEY ??
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function requireSupabase() {
	try {
		const res = await fetch(`${SUPABASE_URL}/rest/v1/pokedex_entries?select=id&limit=1`, {
			headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
			signal: AbortSignal.timeout(2000)
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
	} catch (error) {
		throw new Error(
			`Local Supabase is required for integration tests at ${SUPABASE_URL}. Run "npm run supabase:start" and "npm run supabase:reset" first. ${String(error)}`
		);
	}
}

type Row = {
	id: number;
	pokedexNumber: number;
	pokemon: string;
	form: string | null;
	spriteKey: string | null;
	isDefaultForm: boolean;
	notes: string | null;
};

describe('pokedex behavior regressions', () => {
	let supabase: SupabaseClient;
	let rows: Row[];

	beforeAll(async () => {
		await requireSupabase();
		supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
		const all: Row[] = [];
		for (let from = 0; ; from += 1000) {
			const { data, error } = await supabase
				.from('pokedex_entries')
				.select('id, pokedexNumber, pokemon, form, spriteKey, isDefaultForm, notes')
				.order('id', { ascending: true })
				.range(from, from + 999);
			if (error) throw new Error(error.message);
			if (!data?.length) break;
			all.push(...(data as Row[]));
			if (data.length < 1000) break;
		}
		rows = all;
	});

	it('returns one canonical representative for species whose forms are all named', async () => {
		const repo = new CombinedDataRepository(supabase, null, null);
		const entries = (await repo.findAllCombinedData('', false)).map((item) => item.pokedexEntry);

		for (const [species, form] of Object.entries({
			Basculin: 'Red-striped',
			Tornadus: 'Incarnate Form',
			Oricorio: 'Baile (Red)',
			Zygarde: '50%',
			Gimmighoul: 'Box Form',
			Rotom: 'Lightbulb'
		})) {
			const found = entries.filter((entry) => entry.pokemon === species);
			expect(found, `${species} should appear exactly once`).toHaveLength(1);
			expect(found[0].form).toBe(form);
		}

		expect(entries.filter((entry) => entry.pokemon === 'Beautifly').map((e) => e.form)).toEqual([
			'male'
		]);
		expect(entries.filter((entry) => entry.pokemon === 'Unown').map((e) => e.form)).toEqual(['A']);
	});

	it('returns every alternate form exactly once when forms are enabled', async () => {
		const repo = new CombinedDataRepository(supabase, null, null);
		const entries = (await repo.findAllCombinedData('', true)).map((item) => item.pokedexEntry);

		expect(
			entries
				.filter((entry) => entry.pokemon === 'Basculin')
				.map((entry) => entry.form)
				.sort()
		).toEqual(['Blue-striped', 'Red-striped', 'White-striped']);
		expect(entries.filter((entry) => entry.pokemon === 'Alcremie')).toHaveLength(63);
		expect(entries.filter((entry) => entry.pokemon === 'Unown')).toHaveLength(28);
		expect(new Set(entries.map((entry) => entry._id)).size).toBe(entries.length);
	});

	it('keeps named default forms in a game-scoped form dex without duplicates', async () => {
		const repo = new CombinedDataRepository(supabase, null, null);
		const rotom = (await repo.findAllCombinedData('', true, '', 'Black', ['black-unova']))
			.map((item) => item.pokedexEntry)
			.filter((entry) => entry.pokemon === 'Rotom');

		expect(rotom.map((entry) => entry.form)).toContain('Lightbulb');
		expect(rotom).toHaveLength(6);
		expect(new Set(rotom.map((entry) => entry._id)).size).toBe(rotom.length);
	});

	it('uses the correct national dex numbers and sprite for corrected rows', () => {
		const wyrdeer = rows.find((row) => row.pokemon === 'Wyrdeer');
		expect(wyrdeer).toMatchObject({ pokedexNumber: 899, spriteKey: '899' });
		expect(rows.find((row) => row.pokemon === 'Gimmighoul')?.pokedexNumber).toBe(999);
		expect(
			rows.find((row) => row.pokemon === 'Ursaluna' && row.form === 'Bloodmoon')?.pokedexNumber
		).toBe(901);
	});

	it('returns every expected entry despite the PostgREST row cap', async () => {
		const { calculateExpectedEntries } = await import(
			'../../src/lib/services/PokedexMappingService'
		);
		const baseDex = {
			id: 'test',
			name: 'test',
			isLivingDex: true,
			isShinyDex: false,
			isOriginDex: false,
			isFormDex: false,
			gameScope: null,
			dexScopes: []
		};

		const baseIds = await calculateExpectedEntries(supabase, baseDex as never);
		const formIds = await calculateExpectedEntries(supabase, {
			...baseDex,
			isFormDex: true
		} as never);

		expect(baseIds).toHaveLength(1025);
		expect(new Set(baseIds).size).toBe(baseIds.length);
		expect(formIds).toHaveLength(rows.length);
		expect(new Set(formIds).size).toBe(formIds.length);
	});

	it('keeps the tracked CSV synchronized with the database', () => {
		const fromCsv = new Map(
			readRepoCsv('data/csvs/pokemon.csv').map((row) => [
				`${row.pokemon}|${row.form}`,
				row.pokedexNumber
			])
		);
		const fromDb = new Map(
			rows.map((row) => [`${row.pokemon}|${row.form ?? ''}`, String(row.pokedexNumber)])
		);

		expect({
			onlyInCsv: [...fromCsv.keys()].filter((key) => !fromDb.has(key)),
			onlyInDb: [...fromDb.keys()].filter((key) => !fromCsv.has(key)),
			differing: [...fromCsv.entries()]
				.filter(([key, value]) => fromDb.has(key) && fromDb.get(key) !== value)
				.map(([key, value]) => `${key}: csv ${value} vs db ${fromDb.get(key)}`)
		}).toEqual({ onlyInCsv: [], onlyInDb: [], differing: [] });
	});

	it('projects exactly one default form per species through the public view', () => {
		const bySpecies = new Map<string, Row[]>();
		for (const row of rows)
			bySpecies.set(row.pokemon, [...(bySpecies.get(row.pokemon) ?? []), row]);
		const invalid = [...bySpecies]
			.filter(([, entries]) => entries.filter((entry) => entry.isDefaultForm).length !== 1)
			.map(([species, entries]) => ({
				species,
				defaults: entries.filter((entry) => entry.isDefaultForm).map((entry) => entry.form)
			}));
		expect(invalid).toEqual([]);
		expect(rows[0]).toHaveProperty('notes');
	});
});
