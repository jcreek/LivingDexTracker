import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import {
	backupsNeedingReconnect,
	clearBackupStatus,
	markReconnectNeeded,
	refreshBackupStatus,
	setBackupStatus
} from '$lib/stores/backupStatus';

describe('backup reconnect status', () => {
	beforeEach(() => clearBackupStatus());

	it('lists only the providers that exports switched off', () => {
		setBackupStatus([
			{ provider: 'google_drive', enabled: false },
			{ provider: 'dropbox', enabled: true }
		]);
		expect(get(backupsNeedingReconnect)).toEqual(['google_drive']);
	});

	it('adds newly revoked providers without duplicating known ones', () => {
		markReconnectNeeded(['google_drive']);
		markReconnectNeeded(['google_drive', 'dropbox']);
		expect(get(backupsNeedingReconnect)).toEqual(['google_drive', 'dropbox']);
	});

	it('clears everything, e.g. on sign-out', () => {
		markReconnectNeeded(['dropbox']);
		clearBackupStatus();
		expect(get(backupsNeedingReconnect)).toEqual([]);
	});
});

describe('refreshBackupStatus', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		clearBackupStatus();
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', { onLine: true });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('loads the paused providers from the integrations API', async () => {
		fetchMock.mockResolvedValue(
			new Response(
				JSON.stringify([
					{ provider: 'google_drive', enabled: true },
					{ provider: 'dropbox', enabled: false }
				])
			)
		);

		await refreshBackupStatus();

		expect(fetchMock).toHaveBeenCalledWith('/api/export-integrations', {
			credentials: 'include'
		});
		expect(get(backupsNeedingReconnect)).toEqual(['dropbox']);
	});

	it('clears a stale warning once the provider has been reconnected', async () => {
		markReconnectNeeded(['google_drive']);
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify([{ provider: 'google_drive', enabled: true }]))
		);

		await refreshBackupStatus();

		expect(get(backupsNeedingReconnect)).toEqual([]);
	});

	it('does nothing while offline', async () => {
		vi.stubGlobal('navigator', { onLine: false });
		markReconnectNeeded(['google_drive']);

		await refreshBackupStatus();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(get(backupsNeedingReconnect)).toEqual(['google_drive']);
	});

	it('does nothing during server rendering', async () => {
		vi.stubGlobal('window', undefined);

		await refreshBackupStatus();

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('keeps the last known status when the API rejects the request', async () => {
		markReconnectNeeded(['google_drive']);
		fetchMock.mockResolvedValue(new Response('Unauthorized', { status: 401 }));

		await refreshBackupStatus();

		expect(get(backupsNeedingReconnect)).toEqual(['google_drive']);
	});

	function deferredResponse() {
		let resolve!: (response: Response) => void;
		const promise = new Promise<Response>((r) => (resolve = r));
		return { promise, resolve };
	}

	const json = (body: unknown) => new Response(JSON.stringify(body));

	it('ignores a response overtaken by a newer refresh', async () => {
		const slow = deferredResponse();
		fetchMock
			.mockReturnValueOnce(slow.promise)
			.mockResolvedValueOnce(json([{ provider: 'google_drive', enabled: true }]));

		const first = refreshBackupStatus();
		await refreshBackupStatus();
		slow.resolve(json([{ provider: 'google_drive', enabled: false }]));
		await first;

		expect(get(backupsNeedingReconnect)).toEqual([]);
	});

	it('ignores a response that arrives after the status was flagged directly', async () => {
		const slow = deferredResponse();
		fetchMock.mockReturnValueOnce(slow.promise);

		const pending = refreshBackupStatus();
		markReconnectNeeded(['dropbox']);
		slow.resolve(json([{ provider: 'dropbox', enabled: true }]));
		await pending;

		expect(get(backupsNeedingReconnect)).toEqual(['dropbox']);
	});

	it('ignores a response that arrives after the status was cleared', async () => {
		const slow = deferredResponse();
		fetchMock.mockReturnValueOnce(slow.promise);

		const pending = refreshBackupStatus();
		clearBackupStatus();
		slow.resolve(json([{ provider: 'google_drive', enabled: false }]));
		await pending;

		expect(get(backupsNeedingReconnect)).toEqual([]);
	});

	it('ignores a response that arrives after the status was set from another source', async () => {
		const slow = deferredResponse();
		fetchMock.mockReturnValueOnce(slow.promise);

		const pending = refreshBackupStatus();
		setBackupStatus([{ provider: 'google_drive', enabled: true }]);
		slow.resolve(json([{ provider: 'google_drive', enabled: false }]));
		await pending;

		expect(get(backupsNeedingReconnect)).toEqual([]);
	});

	it('keeps the last known status when the request fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		markReconnectNeeded(['dropbox']);
		fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

		await refreshBackupStatus();

		expect(get(backupsNeedingReconnect)).toEqual(['dropbox']);
		expect(consoleError).toHaveBeenCalled();
	});
});
