import { afterEach, describe, expect, it, vi } from 'vitest';
import { PokedexPerformance } from '$lib/server/pokedexPerformance';

afterEach(() => vi.unstubAllEnvs());
describe('opt-in stage timing', () => {
	it('emits no timing header without explicit opt-in', async () => {
		vi.stubEnv('POKEDEX_PERFORMANCE', 'false');
		const timing = new PokedexPerformance();
		expect(await timing.measure('entries', async () => 'result')).toBe('result');
		expect(timing.prepare(() => 3)).toBe(3);
		timing.recordAuth(10);
		expect(timing.finish()).toBeUndefined();
	});
	it('records failed stages without exposing exception content', async () => {
		vi.stubEnv('POKEDEX_PERFORMANCE', 'true');
		const timing = new PokedexPerformance();
		await expect(
			timing.measure('catches', async () => {
				throw new Error('private note');
			})
		).rejects.toThrow('private note');
		expect(() =>
			timing.prepare(() => {
				throw new Error('private ID');
			})
		).toThrow('private ID');
		timing.recordAuth(undefined);
		timing.recordAuth(12.34);
		const header = timing.finish()!;
		expect(header).toContain('auth;dur=12.3');
		expect(header).toMatch(/catches;dur=\d+\.\d/);
		expect(header).toMatch(/prepare;dur=\d+\.\d/);
		expect(header).toMatch(/total;dur=\d+\.\d/);
		expect(header).not.toContain('private');
	});
});
