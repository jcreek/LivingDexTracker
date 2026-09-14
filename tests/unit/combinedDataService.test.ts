import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pokedex } from '$lib/models/Pokedex';

const findCombinedData = vi.fn();
const countCombinedData = vi.fn();
const constructed: unknown[][] = [];

vi.mock('$lib/repositories/CombinedDataRepository', () => ({
	default: class {
		constructor(...args: unknown[]) {
			constructed.push(args);
		}
		findCombinedData = findCombinedData;
		countCombinedData = countCombinedData;
	}
}));
vi.mock('$lib/services/PokedexDexScopeService', () => ({
	resolveDexScopes: vi.fn(async () => ['national'])
}));

const { loadCombinedDataPage } = await import('$lib/services/CombinedDataService');

const supabase = {} as never;
const pokedex = { _id: 'dex-1', gameScope: 'Black' } as unknown as Pokedex;

describe('loadCombinedDataPage', () => {
	beforeEach(() => {
		constructed.length = 0;
		findCombinedData.mockReset().mockResolvedValue([{ id: 'row' }]);
		countCombinedData.mockReset().mockResolvedValue(45);
	});

	it("defaults to the Pokédex's game scope and reports pagination", async () => {
		const result = await loadCombinedDataPage(supabase, 'user-1', pokedex, {
			page: 2,
			limit: 20,
			enableForms: true
		});

		expect(constructed).toEqual([[supabase, 'user-1', 'dex-1']]);
		expect(findCombinedData).toHaveBeenCalledWith('user-1', 2, 20, true, '', 'Black', ['national']);
		expect(countCombinedData).toHaveBeenCalledWith(true, '', 'Black', ['national']);
		expect(result).toEqual({
			combinedData: [{ id: 'row' }],
			totalPages: 3,
			currentPage: 2,
			totalCount: 45
		});
	});

	it('prefers an explicit game and region filter', async () => {
		await loadCombinedDataPage(supabase, 'user-1', pokedex, {
			page: 1,
			limit: 9999,
			enableForms: false,
			region: 'unova',
			game: 'White'
		});

		expect(countCombinedData).toHaveBeenCalledWith(false, 'unova', 'White', ['national']);
	});

	it('runs the rows and count queries at the same time', async () => {
		let releaseRows: (rows: unknown[]) => void = () => {};
		findCombinedData.mockReturnValue(new Promise((resolve) => (releaseRows = resolve)));
		const pending = loadCombinedDataPage(supabase, 'user-1', pokedex, {
			page: 1,
			limit: 10,
			enableForms: false
		});

		// The count starts before the rows query has finished.
		await vi.waitFor(() => expect(countCombinedData).toHaveBeenCalled());
		releaseRows([]);
		await expect(pending).resolves.toMatchObject({ totalCount: 45, totalPages: 5 });
	});
});
