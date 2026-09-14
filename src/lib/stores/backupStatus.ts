import { writable } from 'svelte/store';
import type { ExportProvider } from '$lib/models/PokedexExportIntegration';

export const PROVIDER_LABELS: Record<ExportProvider, string> = {
	google_drive: 'Google Drive',
	dropbox: 'Dropbox'
};

/**
 * Backup providers whose access has lapsed. Exports switch an integration off when the provider
 * revokes its grant, so these stay paused until the user reconnects.
 */
export const backupsNeedingReconnect = writable<ExportProvider[]>([]);

type IntegrationSummary = { provider: ExportProvider; enabled: boolean };

// A response is only applied if no newer refresh has started and nothing has changed the status
// since it was requested, so a slow response can't overwrite newer or cleared state.
let refreshSequence = 0;
let mutationGeneration = 0;

export function setBackupStatus(integrations: IntegrationSummary[]): void {
	mutationGeneration++;
	backupsNeedingReconnect.set(integrations.filter((i) => !i.enabled).map((i) => i.provider));
}

export async function refreshBackupStatus(): Promise<void> {
	if (typeof window === 'undefined' || !navigator.onLine) return;
	const sequence = ++refreshSequence;
	const generation = mutationGeneration;
	try {
		const response = await fetch('/api/export-integrations', { credentials: 'include' });
		if (!response.ok) return;
		const integrations = (await response.json()) as IntegrationSummary[];
		if (sequence !== refreshSequence || generation !== mutationGeneration) return;
		setBackupStatus(integrations);
	} catch (error) {
		console.error('Unable to check backup status', error);
	}
}

export function markReconnectNeeded(providers: ExportProvider[]): void {
	mutationGeneration++;
	backupsNeedingReconnect.update((current) => [...new Set([...current, ...providers])]);
}

export function clearBackupStatus(): void {
	mutationGeneration++;
	backupsNeedingReconnect.set([]);
}
