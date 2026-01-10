import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCatchRecordWriteQueue } from '../src/lib/utils/catchRecordWriteQueue';
import type { CatchRecord } from '../src/lib/models/CatchRecord';

function mkRecord(overrides: Partial<CatchRecord> = {}): CatchRecord {
	return {
		_id: '',
		userId: 'u1',
		pokedexId: 'p1',
		pokedexEntryId: '25',
		haveToEvolve: false,
		caught: false,
		inHome: false,
		hasGigantamaxed: false,
		personalNotes: '',
		...overrides
	};
}

describe('createCatchRecordWriteQueue()', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.restoreAllMocks();
	});

	it('coalesces multiple updates for the same key and flushes only the latest state', async () => {
		const fetchFn = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			return new Response(init?.body as string, { status: 200 });
		});

		const queue = createCatchRecordWriteQueue({
			endpointUrl: '/api/pokedexes/p1/catch-records',
			fetchFn,
			batchSize: 50,
			concurrency: 1
		});

		queue.enqueue(mkRecord({ caught: true }));
		queue.enqueue(mkRecord({ caught: false, haveToEvolve: true }));

		await queue.flushNow();

		expect(fetchFn).toHaveBeenCalledTimes(1);
		const body = JSON.parse(String(fetchFn.mock.calls[0]?.[1]?.body));
		expect(body).toHaveLength(1);
		expect(body[0].haveToEvolve).toBe(true);
		expect(body[0].caught).toBe(false);
	});

	it('debounces notes updates before flushing', async () => {
		const fetchFn = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			return new Response(init?.body as string, { status: 200 });
		});

		const queue = createCatchRecordWriteQueue({
			endpointUrl: '/api/pokedexes/p1/catch-records',
			fetchFn,
			batchSize: 50,
			concurrency: 1
		});

		queue.enqueue(mkRecord({ personalNotes: 'a' }), { debounceMs: 500 });
		await queue.flushNow();
		expect(fetchFn).toHaveBeenCalledTimes(0);

		vi.advanceTimersByTime(499);
		await queue.flushNow();
		expect(fetchFn).toHaveBeenCalledTimes(0);

		vi.advanceTimersByTime(1);
		await queue.flushNow();
		expect(fetchFn).toHaveBeenCalledTimes(1);
	});
});
