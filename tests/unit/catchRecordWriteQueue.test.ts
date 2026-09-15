import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCatchRecordWriteQueue } from '$lib/utils/catchRecordWriteQueue';
import type { CatchRecord } from '$lib/models/CatchRecord';

function mkRecord(overrides: Partial<CatchRecord> = {}): CatchRecord {
	return {
		_id: '',
		userId: 'u1',
		pokedexId: 'p1',
		pokemonId: '25',
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

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('merges partial notes/status patches without inventing omitted fields', async () => {
		const fetchFn = vi.fn(async () => new Response('[]'));
		const queue = createCatchRecordWriteQueue({ endpointUrl: '/api/catches', fetchFn });
		const identity = { userId: 'u', pokedexId: 'd', pokemonId: '1' };
		queue.enqueue({ ...identity, personalNotes: 'Keep' }, { flushSoon: false });
		queue.enqueue({ ...identity, inHome: true }, { flushSoon: false });
		expect(queue.getPendingPatch('1')).toEqual({
			...identity,
			personalNotes: 'Keep',
			inHome: true
		});
		await queue.flushNow();
		const payload = JSON.parse(
			String((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body)
		);
		expect(payload).toEqual([{ ...identity, personalNotes: 'Keep', inHome: true }]);
		queue.enqueue({ ...identity, personalNotes: '' }, { flushSoon: false });
		expect(queue.getPendingPatch('1')?.personalNotes).toBe('');
		await queue.flushNow();
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

	it('reports failures, clears errors, and retries after exponential backoff', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const fetchFn = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(new Response('temporarily unavailable', { status: 503 }))
			.mockResolvedValueOnce(new Response('[]', { status: 200 }));
		const queue = createCatchRecordWriteQueue({
			endpointUrl: '/catch-records',
			fetchFn
		});
		let status = null as null | {
			pending: number;
			lastError: string | null;
			lastSuccessfulFlushAt: number | null;
		};
		const unsubscribe = queue.getStatus.subscribe((value) => (status = value));

		queue.enqueue(mkRecord(), { flushSoon: false });
		expect(queue.getPendingCount()).toBe(1);
		await queue.flushNow();
		expect(status?.lastError).toContain('503 temporarily unavailable');
		expect(queue.getPendingCount()).toBe(1);

		queue.clearError();
		expect(status?.lastError).toBeNull();
		await vi.advanceTimersByTimeAsync(250);
		await queue.flushNow();
		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(queue.getPendingCount()).toBe(0);
		expect(status?.lastSuccessfulFlushAt).not.toBeNull();
		unsubscribe();
	});

	it('honours batch limits and keepalive while draining eligible records', async () => {
		const fetchFn = vi.fn<typeof fetch>(async () => new Response('[]', { status: 200 }));
		const queue = createCatchRecordWriteQueue({
			endpointUrl: '/catch-records',
			fetchFn,
			batchSize: 50
		});
		queue.enqueue(mkRecord({ pokemonId: '1' }), { flushSoon: false });
		queue.enqueue(mkRecord({ pokemonId: '2' }), { flushSoon: false });
		queue.enqueue(mkRecord({ pokemonId: '3' }), { flushSoon: false });

		await queue.flushNow({ limit: 2, keepalive: true });

		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(JSON.parse(String(fetchFn.mock.calls[0][1]?.body))).toHaveLength(2);
		expect(JSON.parse(String(fetchFn.mock.calls[1][1]?.body))).toHaveLength(1);
		expect(fetchFn.mock.calls.every(([, init]) => init?.keepalive === true)).toBe(true);
	});

	it('retains work while the browser is offline', async () => {
		vi.stubGlobal('navigator', { onLine: false });
		const fetchFn = vi.fn<typeof fetch>();
		const queue = createCatchRecordWriteQueue({ endpointUrl: '/catch-records', fetchFn });
		queue.enqueue(mkRecord(), { flushSoon: false });

		await queue.flushNow();

		expect(fetchFn).not.toHaveBeenCalled();
		expect(queue.getPendingCount()).toBe(1);
	});

	it('discards queued edits after the owning account changes', async () => {
		const fetchFn = vi.fn<typeof fetch>();
		let current = true;
		const queue = createCatchRecordWriteQueue({
			endpointUrl: '/catch-records',
			fetchFn,
			isCurrentUser: () => current
		});
		queue.enqueue(mkRecord(), { debounceMs: 100, flushSoon: false });
		current = false;
		await queue.flushNow();
		expect(fetchFn).not.toHaveBeenCalled();
		expect(queue.getPendingCount()).toBe(0);
	});

	it('does not discard a newer version enqueued during an in-flight request', async () => {
		let resolveFirst: ((response: Response) => void) | undefined;
		const firstResponse = new Promise<Response>((resolve) => (resolveFirst = resolve));
		const fetchFn = vi
			.fn<typeof fetch>()
			.mockReturnValueOnce(firstResponse)
			.mockResolvedValueOnce(new Response('[]', { status: 200 }));
		const queue = createCatchRecordWriteQueue({ endpointUrl: '/catch-records', fetchFn });
		queue.enqueue(mkRecord({ personalNotes: 'old' }), { flushSoon: false });

		const flushing = queue.flushNow();
		await vi.waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
		queue.enqueue(mkRecord({ personalNotes: 'new' }), { flushSoon: false });
		resolveFirst?.(new Response('[]', { status: 200 }));
		await flushing;

		expect(fetchFn).toHaveBeenCalledTimes(2);
		const latest = JSON.parse(String(fetchFn.mock.calls[1][1]?.body));
		expect(latest[0].personalNotes).toBe('new');
		expect(queue.getPendingCount()).toBe(0);
	});

	it('stores non-Error failures as readable status text', async () => {
		const fetchFn = vi.fn<typeof fetch>(async () => {
			throw 'network down';
		});
		const queue = createCatchRecordWriteQueue({ endpointUrl: '/catch-records', fetchFn });
		let lastError: string | null = null;
		queue.getStatus.subscribe((status) => (lastError = status.lastError));
		queue.enqueue(mkRecord(), { flushSoon: false });
		await queue.flushNow();
		expect(lastError).toBe('network down');
	});
});
