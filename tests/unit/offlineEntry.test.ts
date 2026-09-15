import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('$env/static/public', () => ({ PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER: 'true' }));
import { readOfflineEntry } from '$lib/stores/offlineSync';

describe('offline detail snapshots', () => {
	const row = {
		pokedexEntry: { _id: '1', catchInformation: 'Full instructions' },
		catchRecord: { personalNotes: 'Saved note' }
	};
	function snapshot(owner = 'owner', ageMs = 0, includeEntry = true) {
		const meta = {
			userId: owner,
			format: 2,
			dataCache: `livingdex-offline-data-v1-${owner}-copy`,
			generatedAt: new Date(Date.now() - ageMs).toISOString()
		};
		const cache = {
			keys: async () => ['livingdex-offline-meta-v1', meta.dataCache],
			open: async (name: string) => ({
				match: async () =>
					new Response(
						JSON.stringify(
							name === 'livingdex-offline-meta-v1'
								? meta
								: {
										userId: owner,
										version: 1,
										pokedexes: [{ pokedex: { _id: 'dex' }, entries: includeEntry ? [row] : [] }]
									}
						)
					)
			})
		};
		vi.stubGlobal('window', { caches: cache });
		vi.stubGlobal('caches', cache);
	}
	afterEach(() => vi.unstubAllGlobals());
	it.each([0, 60 * 60 * 1000])(
		'uses a matching full snapshot offline even when %i ms old',
		async (age) => {
			snapshot('owner', age);
			expect(await readOfflineEntry('owner', 'dex', '1')).toEqual(row);
		}
	);
	it('never reads another account snapshot', async () => {
		snapshot('other');
		expect(await readOfflineEntry('owner', 'dex', '1')).toBeNull();
	});
	it('reports missing entries and dexes without fabricating details', async () => {
		snapshot('owner', 0, false);
		expect(await readOfflineEntry('owner', 'dex', '1')).toBeNull();
		expect(await readOfflineEntry('owner', 'missing', '1')).toBeNull();
	});
	it('works without Cache Storage', async () => {
		vi.stubGlobal('window', {});
		expect(await readOfflineEntry('owner', 'dex', '1')).toBeNull();
	});
});
