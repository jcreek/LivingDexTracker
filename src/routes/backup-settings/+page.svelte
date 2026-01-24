<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type ExportIntegrationSummary = {
		id: string;
		provider: 'google_drive' | 'dropbox';
		enabled: boolean;
		fileName: string | null;
		folderId: string | null;
		path: string | null;
		metadata?: Record<string, unknown> | null;
		lastExportedAt: string | null;
		lastError: string | null;
	};

	let exportIntegrations: ExportIntegrationSummary[] = [];
	let exportLoading = false;
	let exportError: string | null = null;
	let googleIntegration: ExportIntegrationSummary | undefined;
	let dropboxIntegration: ExportIntegrationSummary | undefined;

	function formatTimestamp(value: string | null) {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleString();
	}

	async function loadExportIntegrations() {
		exportLoading = true;
		exportError = null;
		try {
			const response = await fetch('/api/export-integrations', {
				credentials: 'include'
			});
			if (!response.ok) {
				throw new Error(await response.text());
			}
			exportIntegrations = (await response.json()) as ExportIntegrationSummary[];
			googleIntegration = exportIntegrations.find((i) => i.provider === 'google_drive');
			dropboxIntegration = exportIntegrations.find((i) => i.provider === 'dropbox');
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			exportError = message || 'Failed to load export settings';
		} finally {
			exportLoading = false;
		}
	}

	function getGoogleFolderUrl(folderId: string): string {
		return `https://drive.google.com/drive/folders/${folderId}`;
	}

	function getDropboxFolderUrl(path?: string | null): string {
		const fallback = '/Apps/Living Dex Tracker';
		const trimmed = (path ?? '').trim() || fallback;
		const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
		return `https://www.dropbox.com/home${normalized}`;
	}

	function connectGoogleDrive() {
		const params = new URLSearchParams({
			returnTo: '/backup-settings'
		});
		window.location.href = `/api/integrations/google-drive/connect?${params.toString()}`;
	}

	function connectDropbox() {
		const params = new URLSearchParams({
			returnTo: '/backup-settings'
		});
		window.location.href = `/api/integrations/dropbox/connect?${params.toString()}`;
	}

	onMount(() => {
		if (!browser) return;
		void loadExportIntegrations();
	});
</script>

<svelte:head>
	<title>Backup Settings - Living Dex Tracker</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-screen-lg">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Backup Settings</h1>
		<a href="/my-pokedexes" class="btn btn-outline btn-sm">Back to My Pokédexes</a>
	</div>

	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<p class="text-sm text-base-content/70">
				Backups automatically export every time you update a pokédex. Each export is named after the
				pokédex, so you only need to connect once.
			</p>

			{#if exportLoading}
				<p class="text-sm text-base-content/70 mt-4">Loading export settings…</p>
			{:else if exportError}
				<p class="text-sm text-error mt-4">{exportError}</p>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
				<div class="border border-base-300 rounded-lg p-4 bg-base-100">
					<div class="flex items-center justify-between">
						<h2 class="font-semibold">Google Drive</h2>
						<span class={`badge ${googleIntegration ? 'badge-success' : 'badge-ghost'}`}>
							{googleIntegration ? 'Connected' : 'Not Connected'}
						</span>
					</div>
					<div class="mt-3 space-y-2">
						<div class="flex items-center justify-end gap-2">
							<button class="btn btn-sm btn-outline" on:click={connectGoogleDrive}>
								{googleIntegration ? 'Reconnect' : 'Connect'}
							</button>
						</div>
						{#if googleIntegration?.folderId}
							<div class="text-xs">
								<a
									href={getGoogleFolderUrl(googleIntegration.folderId)}
									target="_blank"
									rel="noopener noreferrer"
									class="link link-primary"
								>
									Open Drive folder
								</a>
							</div>
						{/if}
						{#if googleIntegration?.lastExportedAt}
							<p class="text-xs text-base-content/60">
								Last export: {formatTimestamp(googleIntegration.lastExportedAt)}
							</p>
						{/if}
						{#if googleIntegration?.lastError}
							<p class="text-xs text-error">{googleIntegration.lastError}</p>
						{/if}
					</div>
				</div>

				<div class="border border-base-300 rounded-lg p-4 bg-base-100">
					<div class="flex items-center justify-between">
						<h2 class="font-semibold">Dropbox</h2>
						<span class={`badge ${dropboxIntegration ? 'badge-success' : 'badge-ghost'}`}>
							{dropboxIntegration ? 'Connected' : 'Not Connected'}
						</span>
					</div>
					<div class="mt-3 space-y-2">
						<div class="flex items-center justify-end gap-2">
							<button class="btn btn-sm btn-outline" on:click={connectDropbox}>
								{dropboxIntegration ? 'Reconnect' : 'Connect'}
							</button>
						</div>
						{#if dropboxIntegration}
							<div class="text-xs">
								<a
									href={getDropboxFolderUrl(dropboxIntegration.path)}
									target="_blank"
									rel="noopener noreferrer"
									class="link link-primary"
								>
									Open Dropbox folder
								</a>
							</div>
						{/if}
						{#if dropboxIntegration?.lastExportedAt}
							<p class="text-xs text-base-content/60">
								Last export: {formatTimestamp(dropboxIntegration.lastExportedAt)}
							</p>
						{/if}
						{#if dropboxIntegration?.lastError}
							<p class="text-xs text-error">{dropboxIntegration.lastError}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
