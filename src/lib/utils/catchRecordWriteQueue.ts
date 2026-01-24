import { writable, type Readable } from 'svelte/store';
import type { CatchRecord } from '$lib/models/CatchRecord';

export type CatchRecordWriteQueueStatus = {
	pending: number;
	inFlight: number;
	lastError: string | null;
	lastFlushAttemptAt: number | null;
	lastSuccessfulFlushAt: number | null;
};

type QueueItem = {
	record: CatchRecord;
	attempts: number;
	notBefore: number; // unix ms
	debounceTimer: ReturnType<typeof setTimeout> | null;
	version: number;
};

export type CreateCatchRecordWriteQueueOptions = {
	/**
	 * URL to the pokédex-scoped catch-records endpoint.
	 * Example: `/api/pokedexes/${pokedexId}/catch-records`
	 */
	endpointUrl: string;
	/**
	 * Fetch implementation to use (usually the `fetch` provided by SvelteKit load).
	 */
	fetchFn: typeof fetch;
	/** Max number of records sent per request. */
	batchSize?: number;
	/** Max number of concurrent in-flight requests. */
	concurrency?: number;
};

export type EnqueueCatchRecordWriteOptions = {
	/** Debounce before the record becomes eligible for flushing (ms). */
	debounceMs?: number;
	/** If true, schedule an immediate flush attempt after enqueue. */
	flushSoon?: boolean;
};

export type FlushOptions = {
	/**
	 * Use `keepalive` to improve best-effort delivery during `pagehide`.
	 * Note: browsers impose body-size limits on keepalive requests.
	 */
	keepalive?: boolean;
	/**
	 * Limit number of items flushed in this attempt.
	 * Useful for keepalive flushes on tab close.
	 */
	limit?: number;
};

function keyFor(record: CatchRecord): string {
	return `${record.userId}:${record.pokedexId}:${record.pokemonId}`;
}

function backoffMs(attempts: number): number {
	// Exponential backoff with jitter: 250ms, 500ms, 1s, 2s, 4s... capped.
	const base = 250 * Math.pow(2, Math.max(0, attempts - 1));
	const capped = Math.min(base, 10_000);
	const jitter = Math.floor(Math.random() * 200);
	return capped + jitter;
}

export function createCatchRecordWriteQueue(options: CreateCatchRecordWriteQueueOptions): {
	enqueue: (record: CatchRecord, opts?: EnqueueCatchRecordWriteOptions) => void;
	flushNow: (opts?: FlushOptions) => Promise<void>;
	getStatus: Readable<CatchRecordWriteQueueStatus>;
	getPendingCount: () => number;
	clearError: () => void;
} {
	const { endpointUrl, fetchFn, batchSize = 100, concurrency = 1 } = options;

	const items = new Map<string, QueueItem>();
	let scheduled: ReturnType<typeof setTimeout> | null = null;
	let inFlight = 0;

	const statusStore = writable<CatchRecordWriteQueueStatus>({
		pending: 0,
		inFlight: 0,
		lastError: null,
		lastFlushAttemptAt: null,
		lastSuccessfulFlushAt: null
	});

	function updateStatus(patch: Partial<CatchRecordWriteQueueStatus>) {
		statusStore.update((s) => ({
			...s,
			pending: items.size,
			inFlight,
			...patch
		}));
	}

	function computeNextWakeup(): number | null {
		let next: number | null = null;
		const now = Date.now();
		for (const [, item] of items) {
			if (item.debounceTimer) continue;
			if (item.notBefore <= now) {
				return now;
			}
			next = next === null ? item.notBefore : Math.min(next, item.notBefore);
		}
		return next;
	}

	function scheduleFlush() {
		if (scheduled) return;
		const next = computeNextWakeup();
		if (next === null) return;
		const delay = Math.max(0, next - Date.now());
		scheduled = setTimeout(async () => {
			scheduled = null;
			await flushNow();
		}, delay);
	}

	async function flushBatch(opts?: FlushOptions): Promise<void> {
		if (typeof navigator !== 'undefined' && navigator.onLine === false) {
			// Stay queued; caller can retry when online.
			return;
		}
		if (inFlight >= concurrency) return;

		const now = Date.now();
		const eligible: Array<[string, QueueItem]> = [];
		for (const entry of items.entries()) {
			const [k, item] = entry;
			if (item.debounceTimer) continue;
			if (item.notBefore > now) continue;
			eligible.push([k, item]);
			if (eligible.length >= (opts?.limit ?? batchSize)) break;
		}
		if (eligible.length === 0) return;

		inFlight++;
		updateStatus({ lastFlushAttemptAt: now });
		try {
			const payload = eligible.map(([, item]) => item.record);
			const response = await fetchFn(endpointUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				// keepalive improves odds during `pagehide`.
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				keepalive: !!opts?.keepalive,
				credentials: 'include'
			});

			if (!response.ok) {
				const text = await response.text();
				throw new Error(`Failed to flush catch records: ${response.status} ${text}`);
			}

			// Success: drop the flushed keys.
			for (const [k, sentItem] of eligible) {
				const current = items.get(k);
				if (!current) {
					items.delete(k);
					continue;
				}
				// Only clear if nothing newer was enqueued after this batch started.
				if (current.version === sentItem.version) {
					items.delete(k);
				}
			}
			updateStatus({ lastError: null, lastSuccessfulFlushAt: Date.now() });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			// Backoff all eligible items and keep them.
			for (const [k, item] of eligible) {
				const current = items.get(k);
				if (!current) continue;
				if (current.version !== item.version) continue;
				const nextAttempts = item.attempts + 1;
				items.set(k, {
					...item,
					attempts: nextAttempts,
					notBefore: Date.now() + backoffMs(nextAttempts)
				});
			}
			updateStatus({ lastError: message });
		} finally {
			inFlight--;
			updateStatus({});
		}
	}

	async function flushNow(opts?: FlushOptions): Promise<void> {
		updateStatus({});
		// Drain in waves while eligible work exists and we have capacity.
		// We intentionally do not block indefinitely; this is a “best-effort background flush”.
		for (let i = 0; i < 10; i++) {
			if (items.size === 0) break;
			await flushBatch(opts);
			// If nothing is eligible yet, schedule the next wakeup and exit.
			const next = computeNextWakeup();
			if (next !== null && next > Date.now()) break;
			if (inFlight >= concurrency) break;
		}
		scheduleFlush();
	}

	function enqueue(record: CatchRecord, opts?: EnqueueCatchRecordWriteOptions) {
		const k = keyFor(record);
		const now = Date.now();
		const existing = items.get(k);
		const debounceMs = opts?.debounceMs ?? 0;
		const nextVersion = (existing?.version ?? 0) + 1;

		// Clear any pending debounce timer: latest state always wins.
		if (existing?.debounceTimer) {
			clearTimeout(existing.debounceTimer);
		}

		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		let notBefore = now;
		if (debounceMs > 0) {
			notBefore = now + debounceMs;
			debounceTimer = setTimeout(() => {
				const item = items.get(k);
				if (!item) return;
				items.set(k, { ...item, debounceTimer: null, notBefore: Date.now() });
				updateStatus({});
				scheduleFlush();
			}, debounceMs);
		}

		items.set(k, {
			record,
			attempts: existing?.attempts ?? 0,
			notBefore,
			debounceTimer,
			version: nextVersion
		});
		updateStatus({});
		if (opts?.flushSoon !== false) scheduleFlush();
	}

	function getPendingCount(): number {
		return items.size;
	}

	function clearError() {
		updateStatus({ lastError: null });
	}

	return {
		enqueue,
		flushNow,
		getStatus: { subscribe: statusStore.subscribe },
		getPendingCount,
		clearError
	};
}
