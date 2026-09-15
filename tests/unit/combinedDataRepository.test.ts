import { describe, it, expect } from 'vitest';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';

type Call = { method: string; args: unknown[] };
type TableQuery = { table: string; calls: Call[] };

/**
 * Minimal recording stand-in for a Supabase query builder.
 *
 * Every chained call is recorded and returns the builder, and the builder is thenable so
 * `await query` / `await query.range(...)` resolve like a real PostgREST response. Returning
 * an empty data set keeps the repository's paging loops to a single iteration.
 */
function createSupabaseStub(
	resultFor: (table: string) => unknown = () => ({ data: [], error: null, count: 0 })
) {
	const queries: TableQuery[] = [];

	const from = (table: string) => {
		const record: TableQuery = { table, calls: [] };
		queries.push(record);

		const builder: Record<string, unknown> = new Proxy(
			{},
			{
				get(_target, prop: string) {
					if (prop === 'then') {
						return (resolve: (value: unknown) => unknown) => resolve(resultFor(table));
					}
					return (...args: unknown[]) => {
						record.calls.push({ method: prop, args });
						return builder;
					};
				}
			}
		);

		return builder;
	};

	return { supabase: { from } as never, queries };
}

const queryFor = (queries: TableQuery[], table: string) => queries.filter((q) => q.table === table);

const hasCall = (q: TableQuery, method: string, args: unknown[]) =>
	q.calls.some((c) => c.method === method && JSON.stringify(c.args) === JSON.stringify(args));

const mentionsIsDefaultForm = (q: TableQuery) =>
	q.calls.some((c) => JSON.stringify(c.args).includes('isDefaultForm'));

describe('CombinedDataRepository base-form filtering', () => {
	it('filters to default forms only when the form dex toggle is off', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'user-1', null);

		await repo.findAllCombinedData('user-1', false, '', '', []);

		const [entries] = queryFor(queries, 'pokedex_entries');
		expect(entries).toBeDefined();
		expect(hasCall(entries, 'eq', ['isDefaultForm', true])).toBe(true);
	});

	it('applies no form filter at all when the form dex toggle is on', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'user-1', null);

		await repo.findAllCombinedData('user-1', true, '', '', []);

		const [entries] = queryFor(queries, 'pokedex_entries');
		expect(mentionsIsDefaultForm(entries)).toBe(false);
	});

	it('filters dex-scoped queries to default forms when the form dex toggle is off', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'user-1', null);

		await repo.findAllCombinedData('user-1', false, '', '', ['black-unova']);

		const [dexEntries] = queryFor(queries, 'game_pokedex_entry_details');
		expect(dexEntries).toBeDefined();
		expect(hasCall(dexEntries, 'eq', ['isDefaultForm', true])).toBe(true);
	});

	it('counts with the same default-form filter the listing uses', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'user-1', null);

		await repo.countCombinedData(false, '', '', []);

		const [entries] = queryFor(queries, 'pokedex_entries');
		expect(hasCall(entries, 'eq', ['isDefaultForm', true])).toBe(true);
	});

	/**
	 * Regression guard. game_pokedex_entries is seeded from `form IS NULL` rows, so a default
	 * form that has a NAME (e.g. Rotom "Lightbulb", Basculin "Red-striped") is absent from the
	 * game dex tables and can only reach a game-scoped form dex through this supplement query.
	 *
	 * Switching this filter to `isDefaultForm` looks like a tidy-up, but it silently drops
	 * those rows: base Rotom disappeared from the Black form dex while its five appliance
	 * forms remained. Keep it keyed on `form` - excludeIds already dedupes whatever the dex
	 * table does list.
	 */
	it('supplements game forms by form name, never by isDefaultForm', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'user-1', null);

		await repo.findAllCombinedData('user-1', true, '', 'Black', ['black-unova']);

		const supplements = queryFor(queries, 'pokedex_entries');
		expect(supplements.length).toBeGreaterThan(0);

		const supplement = supplements[0];
		expect(hasCall(supplement, 'not', ['form', 'is', null])).toBe(true);
		expect(mentionsIsDefaultForm(supplement)).toBe(false);
	});
});

describe('compact grid reads', () => {
	const entry = {
		id: 1,
		pokedexNumber: 1,
		pokemon: 'Bulbasaur',
		form: null,
		spriteKey: '1',
		canGigantamax: false
	};
	it('joins catch flags by ID and retains entries without catches', async () => {
		const { supabase } = createSupabaseStub((table) => ({
			data:
				table === 'catch_records'
					? [{ id: 'catch', pokemonId: 1, caught: true, personalNotes: 'private' }]
					: [entry, { ...entry, id: 2 }],
			error: null
		}));
		const repo = new CombinedDataRepository(supabase, 'owner', 'dex', true);
		const rows = await repo.joinGridCatches(await repo.findGridEntries(false, '', []));
		expect(rows[0].catchRecord).toMatchObject({ _id: 'catch', caught: true });
		expect(rows[0].catchRecord).not.toHaveProperty('personalNotes');
		expect(rows[1].catchRecord).toBeNull();
	});
	it('deduplicates overlapping scopes without dropping named form supplements', async () => {
		const base = { ...entry, pokemon: 'Rotom', form: 'Lightbulb', dexNumber: 1, dexSortOrder: 1 };
		const { supabase } = createSupabaseStub((table) => ({
			data:
				table === 'game_pokedex_entry_details' ? [base, base] : [{ ...base, id: 2, form: 'Heat' }],
			error: null
		}));
		const repo = new CombinedDataRepository(supabase, 'owner', 'dex', true);
		const rows = await repo.findGridEntries(true, 'Black', ['one', 'two']);
		expect(rows.map((row) => [row.id, row.form])).toEqual([
			[1, 'Lightbulb'],
			[2, 'Heat']
		]);
	});
	it.each([[[]], [['scope']]])(
		'reports entry query failure instead of an empty grid (%j)',
		async (scopes) => {
			const { supabase } = createSupabaseStub(() => ({
				data: null,
				error: { message: 'unavailable' }
			}));
			const repo = new CombinedDataRepository(supabase, 'owner', 'dex', true);
			await expect(repo.findGridEntries(false, '', scopes)).rejects.toThrow('Unable to load');
		}
	);
	it('reports catch failure instead of displaying everything as uncaught', async () => {
		const { supabase } = createSupabaseStub((table) =>
			table === 'catch_records'
				? { data: null, error: { message: 'unavailable' } }
				: { data: [entry], error: null }
		);
		const repo = new CombinedDataRepository(supabase, 'owner', 'dex', true);
		await expect(repo.joinGridCatches(await repo.findGridEntries(false, '', []))).rejects.toThrow(
			'Unable to load catch records'
		);
	});
	it('keeps a failed detail read distinct from a missing entry', async () => {
		const missing = createSupabaseStub(() => ({ data: null, error: null }));
		expect(
			await new CombinedDataRepository(missing.supabase, 'owner', 'dex').findEntryDetail(1)
		).toBeNull();
		const failed = createSupabaseStub(() => ({ data: null, error: { message: 'unavailable' } }));
		await expect(
			new CombinedDataRepository(failed.supabase, 'owner', 'dex').findEntryDetail(1)
		).rejects.toThrow('Unable to load entry details');
	});
	it.each([false, true])(
		'returns full instructions with optional catch notes (caught: %s)',
		async (caught) => {
			const { supabase } = createSupabaseStub((table) => ({
				data:
					table === 'catch_records'
						? caught
							? [
									{
										id: 'catch',
										pokemonId: 1,
										userId: 'owner',
										pokedexId: 'dex',
										personalNotes: 'Saved note'
									}
								]
							: []
						: { ...entry, catchInformation: 'Full instructions' },
				error: null
			}));
			const result = await new CombinedDataRepository(supabase, 'owner', 'dex').findEntryDetail(1);
			expect(result?.pokedexEntry.catchInformation).toBe('Full instructions');
			if (caught) expect(result?.catchRecord?.personalNotes).toBe('Saved note');
			else expect(result?.catchRecord).toBeNull();
		}
	);
	it('shares a scoped read between simultaneous rows and count requests', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'owner', 'dex');
		await Promise.all([
			repo.findCombinedData('owner', 1, 30, true, '', 'Scarlet', ['scarlet-paldea']),
			repo.countCombinedData(true, '', 'Scarlet', ['scarlet-paldea'])
		]);
		expect(queryFor(queries, 'game_pokedex_entry_details')).toHaveLength(1);
		expect(queryFor(queries, 'pokedex_entries')).toHaveLength(1);
	});
	it('selects compact columns and does not count the full grid', async () => {
		const { supabase, queries } = createSupabaseStub();
		const repo = new CombinedDataRepository(supabase, 'owner', 'dex', true);
		await repo.joinGridCatches(await repo.findGridEntries(false, '', []));
		expect(queries).toHaveLength(1);
		const selection = queries[0].calls.find((call) => call.method === 'select');
		expect(selection?.args[0]).not.toContain('*');
		expect(selection?.args[0]).not.toContain('notes');
		expect(selection?.args[0]).not.toContain('Information');
		expect(selection?.args).toHaveLength(1);
	});
});
