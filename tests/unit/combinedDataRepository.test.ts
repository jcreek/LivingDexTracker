import { describe, it, expect } from 'vitest';
import CombinedDataRepository from '../../src/lib/repositories/CombinedDataRepository';

type Call = { method: string; args: unknown[] };
type TableQuery = { table: string; calls: Call[] };

/**
 * Minimal recording stand-in for a Supabase query builder.
 *
 * Every chained call is recorded and returns the builder, and the builder is thenable so
 * `await query` / `await query.range(...)` resolve like a real PostgREST response. Returning
 * an empty data set keeps the repository's paging loops to a single iteration.
 */
function createSupabaseStub() {
	const queries: TableQuery[] = [];

	const from = (table: string) => {
		const record: TableQuery = { table, calls: [] };
		queries.push(record);

		const builder: Record<string, unknown> = new Proxy(
			{},
			{
				get(_target, prop: string) {
					if (prop === 'then') {
						return (resolve: (value: unknown) => unknown) =>
							resolve({ data: [], error: null, count: 0 });
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
