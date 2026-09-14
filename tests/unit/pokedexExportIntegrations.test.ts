import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PokedexExportIntegration } from '$lib/models/PokedexExportIntegration';

const mocks = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	pokedex: null as unknown,
	integrations: [] as PokedexExportIntegration[],
	updateExportStatus: vi.fn(),
	updateTokens: vi.fn()
}));

vi.mock('$lib/utils/env', () => ({ getEnv: () => mocks.env }));
vi.mock('$lib/repositories/PokedexRepository', () => ({
	default: vi.fn().mockImplementation(() => ({ findById: vi.fn(async () => mocks.pokedex) }))
}));
vi.mock('$lib/repositories/CombinedDataRepository', () => ({
	default: vi.fn().mockImplementation(() => ({
		findAllCombinedData: vi.fn().mockResolvedValue([])
	}))
}));
vi.mock('$lib/services/PokedexDexScopeService', () => ({
	resolveDexScopes: vi.fn().mockResolvedValue([])
}));
vi.mock('$lib/repositories/PokedexExportIntegrationRepository', () => ({
	default: vi.fn().mockImplementation(() => ({
		listEnabledForPokedexOrUser: vi.fn(async () => mocks.integrations),
		updateExportStatus: mocks.updateExportStatus,
		updateTokens: mocks.updateTokens
	}))
}));

import { exportPokedexIfConfigured } from '$lib/services/PokedexExportService';

const supabase = {} as SupabaseClient;
const EXPIRED = () => new Date(Date.now() - 60_000).toISOString();
const FRESH = () => new Date(Date.now() + 3_600_000).toISOString();

function integration(overrides: Partial<PokedexExportIntegration> = {}): PokedexExportIntegration {
	return {
		_id: 'google-1',
		userId: 'user-1',
		pokedexId: null,
		provider: 'google_drive',
		enabled: true,
		fileName: null,
		// A known folder skips the Drive folder lookup, keeping each test to token + upload calls.
		folderId: 'folder-1',
		path: null,
		accessToken: 'old-access',
		refreshToken: 'refresh',
		accessTokenExpiresAt: EXPIRED(),
		metadata: null,
		lastExportedAt: null,
		lastError: null,
		...overrides
	};
}

type Reply = { status: number; body: unknown };
const fetchMock = vi.fn();

/** Answers token requests with `token` and every other provider call with `upload`. */
function stubProvider(token: Reply, upload: Reply = { status: 200, body: { id: 'file-1' } }) {
	fetchMock.mockImplementation(async (input: string) => {
		const reply = input.includes('/token') ? token : upload;
		const body = typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body);
		return new Response(body, { status: reply.status });
	});
}

const REVOKED: Reply = {
	status: 400,
	body: { error: 'invalid_grant', error_description: 'Bad Request' }
};
const REFRESHED: Reply = { status: 200, body: { access_token: 'new-access', expires_in: 3600 } };

function uploadCalls() {
	return fetchMock.mock.calls.filter(([url]) => !String(url).includes('/token'));
}

/** Routes each provider call to a reply; returning a string or Error makes that fetch reject. */
function routeFetch(handler: (url: string, init?: RequestInit) => Reply | Error | string) {
	fetchMock.mockImplementation(async (input: string, init?: RequestInit) => {
		const reply = handler(input, init);
		if (typeof reply === 'string' || reply instanceof Error) throw reply;
		const body = typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body);
		return new Response(body, { status: reply.status });
	});
}

const FULL_ENV = {
	GOOGLE_OAUTH_CLIENT_ID: 'google-id',
	GOOGLE_OAUTH_CLIENT_SECRET: 'google-secret',
	DROPBOX_OAUTH_CLIENT_ID: 'dropbox-id',
	DROPBOX_OAUTH_CLIENT_SECRET: 'dropbox-secret'
};
const DEX = { _id: 'dex-1', name: 'My Dex', isFormDex: false, gameScope: '' };

let consoleError: ReturnType<typeof vi.spyOn>;
let consoleWarn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	mocks.env = { ...FULL_ENV };
	mocks.pokedex = DEX;
	mocks.integrations = [];
	mocks.updateExportStatus.mockReset();
	mocks.updateTokens.mockReset();
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
	vi.unstubAllGlobals();
	// Only undo the spies: vi.restoreAllMocks() would also wipe the repository module mocks above.
	consoleError.mockRestore();
	consoleWarn.mockRestore();
});

describe('exportPokedexIfConfigured when a provider revokes access', () => {
	it.each([
		['google_drive', 'google-1', /Reconnect Google Drive/],
		['dropbox', 'dropbox-1', /Reconnect Dropbox/]
	] as const)('pauses %s when its refresh token is revoked', async (provider, id, message) => {
		mocks.integrations = [integration({ _id: id, provider })];
		stubProvider(REVOKED);

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result).toMatchObject({ attempted: 1, succeeded: 0 });
		expect(result.failed).toEqual([
			{
				integrationId: id,
				provider,
				error: expect.stringMatching(message),
				reconnectRequired: true
			}
		]);
		expect(mocks.updateExportStatus).toHaveBeenCalledWith(id, {
			lastError: expect.stringMatching(message),
			enabled: false
		});
		expect(uploadCalls()).toHaveLength(0);
		expect(mocks.updateTokens).not.toHaveBeenCalled();
	});

	it('pauses an integration that has no refresh token without calling the provider', async () => {
		mocks.integrations = [integration({ refreshToken: null })];

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({ reconnectRequired: true });
		expect(mocks.updateExportStatus).toHaveBeenCalledWith('google-1', {
			lastError: expect.stringMatching(/Reconnect Google Drive/),
			enabled: false
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([
		['a server error', { status: 500, body: 'upstream down' }],
		['a different OAuth error', { status: 400, body: { error: 'invalid_client' } }]
	])('keeps the integration enabled when the refresh fails with %s', async (_label, token) => {
		mocks.integrations = [integration()];
		stubProvider(token);

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({
			reconnectRequired: false,
			error: expect.stringMatching(/^Google token refresh failed: /)
		});
		// Exactly this patch: no `enabled` key, so a transient failure is retried on the next export.
		expect(mocks.updateExportStatus).toHaveBeenCalledWith('google-1', {
			lastError: expect.stringMatching(/^Google token refresh failed: /)
		});
	});

	it('keeps the integration enabled when only the upload fails', async () => {
		mocks.integrations = [integration({ accessTokenExpiresAt: FRESH() })];
		stubProvider(REFRESHED, { status: 503, body: { error: 'mock upload failure' } });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({ reconnectRequired: false });
		expect(mocks.updateExportStatus).toHaveBeenCalledWith('google-1', {
			lastError: expect.stringMatching(/Google Drive upload failed: 503/)
		});
	});

	it('refreshes an expired token, uploads, and clears the previous error', async () => {
		mocks.integrations = [integration({ lastError: 'old failure' })];
		stubProvider(REFRESHED);

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result).toEqual({ attempted: 1, succeeded: 1, failed: [] });
		expect(mocks.updateTokens).toHaveBeenCalledWith('google-1', {
			accessToken: 'new-access',
			accessTokenExpiresAt: expect.any(String)
		});
		expect(uploadCalls()[0][1].headers.Authorization).toBe('Bearer new-access');
		expect(mocks.updateExportStatus).toHaveBeenCalledWith('google-1', {
			lastExportedAt: expect.any(String),
			lastError: null
		});
	});

	it('pauses only the revoked provider when another one still works', async () => {
		mocks.integrations = [
			integration(),
			integration({ _id: 'dropbox-1', provider: 'dropbox', accessTokenExpiresAt: FRESH() })
		];
		fetchMock.mockImplementation(async (input: string) =>
			input.includes('googleapis.com/token')
				? new Response(JSON.stringify(REVOKED.body), { status: 400 })
				: new Response(JSON.stringify({ id: 'file-1' }), { status: 200 })
		);

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result).toMatchObject({ attempted: 2, succeeded: 1 });
		expect(result.failed.map((failure) => failure.provider)).toEqual(['google_drive']);
		const pausedIds = mocks.updateExportStatus.mock.calls
			.filter(([, patch]) => patch.enabled === false)
			.map(([integrationId]) => integrationId);
		expect(pausedIds).toEqual(['google-1']);
	});
});

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

function isDriveUpload(url: string) {
	return url.startsWith(DRIVE_UPLOAD);
}

/** The JSON metadata part of a Drive multipart upload body. */
function driveUploadMetadata(init?: RequestInit) {
	return JSON.parse(String(init?.body).split('\r\n')[3]) as Record<string, unknown>;
}

function statusPatches() {
	return mocks.updateExportStatus.mock.calls.map(([, patch]) => patch as Record<string, unknown>);
}

describe('exportPokedexIfConfigured provider paths', () => {
	it('does nothing when the Pokédex no longer exists', async () => {
		mocks.pokedex = null;
		mocks.integrations = [integration()];

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result).toEqual({ attempted: 0, succeeded: 0, failed: [] });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(mocks.updateExportStatus).not.toHaveBeenCalled();
	});

	it('does nothing when no backup is connected', async () => {
		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result).toEqual({ attempted: 0, succeeded: 0, failed: [] });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([
		['google_drive', 'GOOGLE_OAUTH_CLIENT_SECRET', 'Missing Google OAuth client credentials'],
		['dropbox', 'DROPBOX_OAUTH_CLIENT_ID', 'Missing Dropbox OAuth client credentials']
	] as const)(
		'reports missing %s OAuth credentials without pausing the backup',
		async (provider, envKey, error) => {
			delete mocks.env[envKey];
			mocks.integrations = [integration({ provider })];

			const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

			expect(result.failed[0]).toMatchObject({ error, reconnectRequired: false });
			expect(fetchMock).not.toHaveBeenCalled();
		}
	);

	it('pauses Dropbox when it has no refresh token', async () => {
		mocks.integrations = [integration({ provider: 'dropbox', refreshToken: null })];

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({
			error: expect.stringMatching(/Reconnect Dropbox/),
			reconnectRequired: true
		});
	});

	it('keeps Dropbox enabled when its token refresh fails for another reason', async () => {
		mocks.integrations = [integration({ provider: 'dropbox' })];
		stubProvider({ status: 500, body: 'upstream down' });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({
			error: 'Dropbox token refresh failed: 500 upstream down',
			reconnectRequired: false
		});
	});

	it('stores a refreshed token without an expiry when the provider omits one', async () => {
		mocks.integrations = [integration({ _id: 'dropbox-1', provider: 'dropbox' })];
		stubProvider({ status: 200, body: { access_token: 'new-access' } });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.succeeded).toBe(1);
		expect(mocks.updateTokens).toHaveBeenCalledWith('dropbox-1', {
			accessToken: 'new-access',
			accessTokenExpiresAt: null
		});
		expect(uploadCalls()[0][1].headers.Authorization).toBe('Bearer new-access');
	});

	it.each([
		[null, '/My Dex.csv'],
		['/Backups/', '/Backups/My Dex.csv'],
		['/Backups', '/Backups/My Dex.csv'],
		['  /Backups/custom.CSV  ', '/Backups/custom.CSV']
	])('uploads to Dropbox path %j as %s', async (path, expected) => {
		mocks.integrations = [
			integration({ provider: 'dropbox', path, accessTokenExpiresAt: FRESH() })
		];
		stubProvider(REFRESHED);

		await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		const headers = uploadCalls()[0][1].headers as Record<string, string>;
		expect(JSON.parse(headers['Dropbox-API-Arg'])).toEqual({
			path: expected,
			mode: 'overwrite',
			mute: true
		});
	});

	it('reports a failed Dropbox upload', async () => {
		mocks.integrations = [integration({ provider: 'dropbox', accessTokenExpiresAt: FRESH() })];
		stubProvider(REFRESHED, { status: 500, body: 'boom' });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({
			error: 'Dropbox upload failed: 500 boom',
			reconnectRequired: false
		});
	});

	it('finds the existing Living Dex Tracker folder in Drive', async () => {
		mocks.integrations = [integration({ folderId: null, accessTokenExpiresAt: FRESH() })];
		routeFetch((url) => {
			if (url.startsWith(`${DRIVE_API}/files?`))
				return { status: 200, body: { files: [{ id: 'found' }] } };
			if (isDriveUpload(url)) return { status: 200, body: { id: 'file-1' } };
			return { status: 500, body: `unexpected ${url}` };
		});

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.succeeded).toBe(1);
		const [, init] = uploadCalls().find(([url]) => isDriveUpload(String(url)))!;
		expect(driveUploadMetadata(init).parents).toEqual(['found']);
		expect(statusPatches()).toContainEqual({ folderId: 'found' });
		expect(fetchMock.mock.calls.some(([url]) => url === `${DRIVE_API}/files`)).toBe(false);
	});

	it('creates the Living Dex Tracker folder when Drive has none', async () => {
		mocks.integrations = [integration({ folderId: null, accessTokenExpiresAt: FRESH() })];
		routeFetch((url) => {
			if (url.startsWith(`${DRIVE_API}/files?`)) return { status: 200, body: { files: [] } };
			if (url === `${DRIVE_API}/files`) return { status: 200, body: { id: 'created' } };
			return { status: 200, body: { id: 'file-1' } };
		});

		await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		const [, init] = uploadCalls().find(([url]) => isDriveUpload(String(url)))!;
		expect(driveUploadMetadata(init).parents).toEqual(['created']);
	});

	it.each([
		['rejects the requests', { status: 500, body: 'nope' }],
		['cannot be reached', new TypeError('Failed to fetch')]
	])('uploads to the Drive root when the folder API %s', async (_label, folderReply) => {
		mocks.integrations = [integration({ folderId: null, accessTokenExpiresAt: FRESH() })];
		routeFetch((url) =>
			isDriveUpload(url) ? { status: 200, body: { id: 'file-1' } } : folderReply
		);

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.succeeded).toBe(1);
		const [, init] = uploadCalls().find(([url]) => isDriveUpload(String(url)))!;
		expect(driveUploadMetadata(init).parents).toBeUndefined();
		expect(statusPatches().some((patch) => 'folderId' in patch)).toBe(false);
		expect(statusPatches()).toContainEqual({ metadata: { files: { 'dex-1': 'file-1' } } });
	});

	it('updates the existing Drive file in place', async () => {
		mocks.integrations = [
			integration({ accessTokenExpiresAt: FRESH(), metadata: { files: { 'dex-1': 'file-1' } } })
		];
		stubProvider(REFRESHED, { status: 200, body: { id: 'file-1' } });

		await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		const [url, init] = uploadCalls()[0];
		expect(url).toBe(`${DRIVE_UPLOAD}/files/file-1?uploadType=multipart&addParents=folder-1`);
		expect(init.method).toBe('PATCH');
		expect(driveUploadMetadata(init).parents).toBeUndefined();
		expect(statusPatches().some((patch) => 'metadata' in patch)).toBe(false);
	});

	it.each([
		[
			'the only saved file',
			{ scope: 's', files: { 'dex-1': 'stale' } },
			{ scope: 's' },
			{ scope: 's', files: { 'dex-1': 'new-file' } }
		],
		[
			'one of several saved files',
			{ files: { 'dex-1': 'stale', 'dex-2': 'other' } },
			{ files: { 'dex-2': 'other' } },
			{ files: { 'dex-1': 'new-file', 'dex-2': 'other' } }
		]
	])(
		'recreates a Drive file deleted by the user when it was %s',
		async (_label, metadata, cleared, saved) => {
			mocks.integrations = [integration({ accessTokenExpiresAt: FRESH(), metadata })];
			routeFetch((_url, init) =>
				init?.method === 'PATCH'
					? { status: 404, body: 'File not found' }
					: { status: 200, body: { id: 'new-file' } }
			);

			const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

			expect(result.succeeded).toBe(1);
			expect(uploadCalls().map(([, init]) => init.method)).toEqual(['PATCH', 'POST']);
			expect(driveUploadMetadata(uploadCalls()[1][1]).parents).toEqual(['folder-1']);
			const metadataPatches = statusPatches().filter((patch) => 'metadata' in patch);
			expect(metadataPatches).toEqual([{ metadata: cleared }, { metadata: saved }]);
		}
	);

	it('gives up when the recreated Drive file is also missing', async () => {
		mocks.integrations = [
			integration({ accessTokenExpiresAt: FRESH(), metadata: { files: { 'dex-1': 'stale' } } })
		];
		stubProvider(REFRESHED, { status: 404, body: 'File not found' });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(uploadCalls()).toHaveLength(2);
		expect(result.failed[0]).toMatchObject({
			error: 'Google Drive upload failed: 404 File not found',
			reconnectRequired: false
		});
	});

	it('records the export even when Drive returns no file id', async () => {
		mocks.integrations = [integration({ accessTokenExpiresAt: FRESH() })];
		stubProvider(REFRESHED, { status: 200, body: {} });

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.succeeded).toBe(1);
		expect(statusPatches()).toEqual([{ lastExportedAt: expect.any(String), lastError: null }]);
	});

	it('reports a failure that is not an Error as text', async () => {
		mocks.integrations = [integration({ accessTokenExpiresAt: FRESH() })];
		routeFetch(() => 'network down');

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(result.failed[0]).toMatchObject({ error: 'network down', reconnectRequired: false });
	});

	it('does nothing for a provider it does not support', async () => {
		mocks.integrations = [integration({ provider: 'onedrive' as never })];

		const result = await exportPokedexIfConfigured(supabase, 'user-1', 'dex-1');

		expect(fetchMock).not.toHaveBeenCalled();
		expect(result).toMatchObject({ attempted: 1, failed: [] });
	});
});
