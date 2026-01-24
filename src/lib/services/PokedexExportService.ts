import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CombinedData } from '$lib/models/CombinedData';
import type { Pokedex } from '$lib/models/Pokedex';
import type { ExportProvider, PokedexExportIntegration } from '$lib/models/PokedexExportIntegration';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import PokedexExportIntegrationRepository from '$lib/repositories/PokedexExportIntegrationRepository';
import { resolveDexScopes } from '$lib/services/PokedexDexScopeService';
import { getEnv } from '$lib/utils/env';

type ExportFailure = {
	integrationId: string;
	provider: ExportProvider;
	error: string;
};

export type PokedexExportResult = {
	attempted: number;
	succeeded: number;
	failed: ExportFailure[];
};

function csvEscape(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function sanitizeFileName(name: string, fallback: string): string {
	const trimmed = name.trim();
	const safe = trimmed.replace(/[\\/:*?"<>|]+/g, '-');
	if (!safe) return fallback;
	return safe.endsWith('.csv') ? safe : `${safe}.csv`;
}

function buildCsv(pokedex: Pokedex, combinedData: CombinedData[]): string {
	const headers = [
		'pokemonId',
		'pokedexNumber',
		'pokemon',
		'form',
		'caught',
		'haveToEvolve',
		'inHome',
		'personalNotes'
	];

	const lines = [headers.map(csvEscape).join(',')];

	for (const row of combinedData) {
		const entry = row.pokedexEntry;
		const catchRecord = row.catchRecord ?? {
			caught: false,
			haveToEvolve: false,
			inHome: false,
			hasGigantamaxed: false,
			personalNotes: ''
		};

		const values = [
			entry._id,
			entry.pokedexNumber,
			entry.pokemon,
			entry.form || '',
			catchRecord.caught,
			catchRecord.haveToEvolve,
			catchRecord.inHome,
			catchRecord.personalNotes || ''
		];

		lines.push(values.map(csvEscape).join(','));
	}

	return lines.join('\r\n');
}

function shouldRefreshToken(expiresAt: string | null): boolean {
	if (!expiresAt) return false;
	const expiry = new Date(expiresAt).getTime();
	if (!Number.isFinite(expiry)) return false;
	// Refresh if within 60 seconds of expiry.
	return expiry - Date.now() < 60_000;
}

async function refreshGoogleToken(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository
): Promise<PokedexExportIntegration> {
	if (!integration.refreshToken) {
		throw new Error('Missing Google refresh token');
	}

	const env = getEnv();
	const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
	const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('Missing Google OAuth client credentials');
	}

	const params = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: integration.refreshToken,
		grant_type: 'refresh_token'
	});

	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString()
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Google token refresh failed: ${response.status} ${text}`);
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_in?: number;
	};

	const expiresAt = data.expires_in
		? new Date(Date.now() + data.expires_in * 1000).toISOString()
		: null;

	await repo.updateTokens(integration._id, {
		accessToken: data.access_token,
		accessTokenExpiresAt: expiresAt
	});

	return {
		...integration,
		accessToken: data.access_token,
		accessTokenExpiresAt: expiresAt
	};
}

async function refreshDropboxToken(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository
): Promise<PokedexExportIntegration> {
	if (!integration.refreshToken) {
		throw new Error('Missing Dropbox refresh token');
	}

	const env = getEnv();
	const clientId = env.DROPBOX_OAUTH_CLIENT_ID;
	const clientSecret = env.DROPBOX_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('Missing Dropbox OAuth client credentials');
	}

	const params = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: integration.refreshToken,
		grant_type: 'refresh_token'
	});

	const response = await fetch('https://api.dropbox.com/oauth2/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString()
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Dropbox token refresh failed: ${response.status} ${text}`);
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_in?: number;
	};

	const expiresAt = data.expires_in
		? new Date(Date.now() + data.expires_in * 1000).toISOString()
		: null;

	await repo.updateTokens(integration._id, {
		accessToken: data.access_token,
		accessTokenExpiresAt: expiresAt
	});

	return {
		...integration,
		accessToken: data.access_token,
		accessTokenExpiresAt: expiresAt
	};
}

async function ensureAccessToken(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository
): Promise<PokedexExportIntegration> {
	if (!shouldRefreshToken(integration.accessTokenExpiresAt)) {
		return integration;
	}

	if (integration.provider === 'google_drive') {
		return await refreshGoogleToken(integration, repo);
	}

	if (integration.provider === 'dropbox') {
		return await refreshDropboxToken(integration, repo);
	}

	return integration;
}

type GoogleDriveMetadata = {
	files?: Record<string, string>;
};

function getGoogleFileId(metadata: Record<string, unknown> | null, pokedexId: string): string | null {
	const data = metadata as GoogleDriveMetadata | null;
	const fileId = data?.files?.[pokedexId];
	return typeof fileId === 'string' && fileId ? fileId : null;
}

function withGoogleFileId(
	metadata: Record<string, unknown> | null,
	pokedexId: string,
	fileId: string
): Record<string, unknown> {
	const data = (metadata as GoogleDriveMetadata | null) ?? {};
	const files = { ...(data.files ?? {}) };
	files[pokedexId] = fileId;
	return { ...data, files };
}

function withoutGoogleFileId(
	metadata: Record<string, unknown> | null,
	pokedexId: string
): Record<string, unknown> | null {
	const data = (metadata as GoogleDriveMetadata | null) ?? {};
	if (!data.files || !data.files[pokedexId]) return metadata;
	const files = { ...data.files };
	delete files[pokedexId];
	const next = { ...data, files };
	if (Object.keys(files).length === 0) {
		delete (next as GoogleDriveMetadata).files;
	}
	return next;
}

async function uploadToGoogleDrive(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository,
	pokedex: Pokedex,
	csv: string
): Promise<void> {
	const refreshed = await ensureAccessToken(integration, repo);
	const fileName = sanitizeFileName(pokedex.name, 'pokedex.csv');

	let folderId = refreshed.folderId?.trim() ?? '';
	if (!folderId) {
		try {
			const folderResponse = await fetch(
				'https://www.googleapis.com/drive/v3/files?' +
					new URLSearchParams({
						q: "name='Living Dex Tracker' and mimeType='application/vnd.google-apps.folder' and trashed=false",
						fields: 'files(id,name)',
						pageSize: '1'
					}).toString(),
				{
					headers: {
						Authorization: `Bearer ${refreshed.accessToken}`
					}
				}
			);

			if (folderResponse.ok) {
				const folderData = (await folderResponse.json()) as { files?: Array<{ id: string }> };
				folderId = folderData.files?.[0]?.id ?? '';
			}
		} catch (error) {
			console.warn('Failed to lookup Google Drive folder, using root:', error);
		}
	}

	if (!folderId) {
		try {
			const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${refreshed.accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: 'Living Dex Tracker',
					mimeType: 'application/vnd.google-apps.folder'
				})
			});
			if (createResponse.ok) {
				const created = (await createResponse.json()) as { id?: string };
				folderId = created.id ?? '';
			}
		} catch (error) {
			console.warn('Failed to create Google Drive folder, using root:', error);
		}
	}

	const existingFileId = getGoogleFileId(refreshed.metadata, pokedex._id);
	let currentFileId = existingFileId;

	for (let attempt = 0; attempt < 2; attempt++) {
		const metadata: Record<string, unknown> = {
			name: fileName,
			mimeType: 'text/csv'
		};
		if (folderId && !currentFileId) {
			metadata.parents = [folderId];
		}

		const boundary = `boundary_${randomUUID()}`;
		const body = [
			`--${boundary}`,
			'Content-Type: application/json; charset=UTF-8',
			'',
			JSON.stringify(metadata),
			`--${boundary}`,
			'Content-Type: text/csv',
			'',
			csv,
			`--${boundary}--`
		].join('\r\n');

		const url = currentFileId
			? `https://www.googleapis.com/upload/drive/v3/files/${currentFileId}?uploadType=multipart`
			: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
		const method = currentFileId ? 'PATCH' : 'POST';
		const uploadUrl = currentFileId && folderId
			? `${url}&addParents=${encodeURIComponent(folderId)}`
			: url;

		const response = await fetch(uploadUrl, {
			method,
			headers: {
				Authorization: `Bearer ${refreshed.accessToken}`,
				'Content-Type': `multipart/related; boundary=${boundary}`
			},
			body
		});

		if (!response.ok) {
			const text = await response.text();
			if (currentFileId && response.status === 404 && attempt === 0) {
				const nextMetadata = withoutGoogleFileId(refreshed.metadata, pokedex._id);
				await repo.updateExportStatus(refreshed._id, { metadata: nextMetadata });
				currentFileId = null;
				continue;
			}
			throw new Error(`Google Drive upload failed: ${response.status} ${text}`);
		}

		const data = (await response.json()) as { id?: string };
		if (data.id && folderId) {
			await repo.updateExportStatus(refreshed._id, {
				folderId
			});
		}

		if (!currentFileId && data.id) {
			const nextMetadata = withGoogleFileId(refreshed.metadata, pokedex._id, data.id);
			await repo.updateExportStatus(refreshed._id, { metadata: nextMetadata });
		}
		return;
	}
}

async function uploadToDropbox(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository,
	pokedex: Pokedex,
	csv: string
): Promise<void> {
	const refreshed = await ensureAccessToken(integration, repo);
	const fileName = sanitizeFileName(pokedex.name, 'pokedex.csv');
	const trimmedPath = refreshed.path?.trim() ?? '';
	let targetPath = trimmedPath;
	if (!targetPath) {
		targetPath = `/${fileName}`;
	} else if (targetPath.endsWith('/')) {
		targetPath = `${targetPath}${fileName}`;
	} else if (!targetPath.toLowerCase().endsWith('.csv')) {
		targetPath = `${targetPath}/${fileName}`;
	}

	const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${refreshed.accessToken}`,
			'Content-Type': 'application/octet-stream',
			'Dropbox-API-Arg': JSON.stringify({
				path: targetPath,
				mode: 'overwrite',
				mute: true
			})
		},
		body: csv
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Dropbox upload failed: ${response.status} ${text}`);
	}
}

async function exportToIntegration(
	integration: PokedexExportIntegration,
	repo: PokedexExportIntegrationRepository,
	pokedex: Pokedex,
	csv: string
): Promise<void> {
	if (integration.provider === 'google_drive') {
		await uploadToGoogleDrive(integration, repo, pokedex, csv);
		return;
	}
	if (integration.provider === 'dropbox') {
		await uploadToDropbox(integration, repo, pokedex, csv);
	}
}

export async function exportPokedexIfConfigured(
	supabase: SupabaseClient,
	userId: string,
	pokedexId: string
): Promise<PokedexExportResult> {
	const pokedexRepo = new PokedexRepository(supabase, userId);
	const pokedex = await pokedexRepo.findById(pokedexId);
	if (!pokedex) {
		return { attempted: 0, succeeded: 0, failed: [] };
	}

	const integrationRepo = new PokedexExportIntegrationRepository(supabase, userId, pokedexId);
	const integrations = await integrationRepo.listEnabledForPokedexOrUser();
	if (integrations.length === 0) {
		return { attempted: 0, succeeded: 0, failed: [] };
	}

	const dexScopes = await resolveDexScopes(supabase, pokedex);
	const combinedRepo = new CombinedDataRepository(supabase, userId, pokedexId);
	const combinedData = await combinedRepo.findAllCombinedData(
		userId,
		!!pokedex.isFormDex,
		'',
		pokedex.gameScope || '',
		dexScopes
	);
	const csv = buildCsv(pokedex, combinedData);

	const failures: ExportFailure[] = [];
	let successes = 0;

	for (const integration of integrations) {
		const scopedRepo = new PokedexExportIntegrationRepository(
			supabase,
			userId,
			integration.pokedexId ?? null
		);
		try {
			await exportToIntegration(integration, scopedRepo, pokedex, csv);
			await scopedRepo.updateExportStatus(integration._id, {
				lastExportedAt: new Date().toISOString(),
				lastError: null
			});
			successes++;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			failures.push({
				integrationId: integration._id,
				provider: integration.provider,
				error: message
			});
			await scopedRepo.updateExportStatus(integration._id, {
				lastError: message
			});
			console.error('Failed to export pokedex:', integration.provider, message);
		}
	}

	return {
		attempted: integrations.length,
		succeeded: successes,
		failed: failures
	};
}
