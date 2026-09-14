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

export function setBackupStatus(integrations: IntegrationSummary[]): void {
	backupsNeedingReconnect.set(integrations.filter((i) => !i.enabled).map((i) => i.provider));
}

export async function refreshBackupStatus(): Promise<void> {
	if (typeof window === 'undefined' || !navigator.onLine) return;
	try {
		const response = await fetch('/api/export-integrations', { credentials: 'include' });
		if (!response.ok) return;
		setBackupStatus((await response.json()) as IntegrationSummary[]);
	} catch (error) {
		console.error('Unable to check backup status', error);
	}
}

export function markReconnectNeeded(providers: ExportProvider[]): void {
	backupsNeedingReconnect.update((current) => [...new Set([...current, ...providers])]);
}

export function clearBackupStatus(): void {
	backupsNeedingReconnect.set([]);
}
