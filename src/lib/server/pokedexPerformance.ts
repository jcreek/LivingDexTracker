import { env } from '$env/dynamic/private';

/** Opt-in, fixed labels only: never log IDs, query strings, cookies or entry content. */
export class PokedexPerformance {
	private started = performance.now();
	private durations: Record<string, number> = {};
	readonly enabled = env.POKEDEX_PERFORMANCE === 'true';
	async measure<T>(
		stage: 'auth' | 'ownership' | 'scopes' | 'entries' | 'catches',
		run: () => Promise<T>
	): Promise<T> {
		const start = performance.now();
		try {
			return await run();
		} finally {
			if (this.enabled) this.durations[stage] = performance.now() - start;
		}
	}
	recordAuth(duration: number | undefined) {
		if (this.enabled && duration !== undefined) this.durations.auth = duration;
	}
	prepare<T>(run: () => T): T {
		const start = performance.now();
		try {
			return run();
		} finally {
			if (this.enabled) this.durations.prepare = performance.now() - start;
		}
	}
	finish(): string | undefined {
		if (!this.enabled) return undefined;
		this.durations.total = performance.now() - this.started;
		return Object.entries(this.durations)
			.map(([name, duration]) => `${name};dur=${duration.toFixed(1)}`)
			.join(', ');
	}
}
