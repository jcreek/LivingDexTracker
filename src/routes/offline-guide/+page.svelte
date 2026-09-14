<script lang="ts">
	import { user } from '$lib/stores/user.js';
	import {
		artworkDownloadStatus,
		downloadAllArtwork,
		offlineSyncStatus,
		requestOfflineSync
	} from '$lib/stores/offlineSync';

	function formatMegabytes(bytes: number) {
		const megabytes = bytes / 1048576;
		return megabytes < 1 ? '<1 MB' : `≈${Math.round(megabytes)} MB`;
	}
</script>

<svelte:head>
	<title>Using Offline - Living Dex Tracker</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-screen-lg">
	<h1 class="text-3xl font-bold mb-6">Using Living Dex Tracker offline</h1>

	<div class="card bg-base-100 shadow-xl mb-6">
		<div class="card-body">
			<h2 class="card-title">Your offline copy</h2>
			{#if !$user}
				<p>
					<a href="/signin" class="link link-primary">Sign in</a> to keep a copy of your pokédexes on
					this device.
				</p>
			{:else}
				<div data-testid="offline-copy-status" role="status">
					{#if $offlineSyncStatus.state === 'syncing'}
						<p>Updating your offline copy…</p>
					{:else if $offlineSyncStatus.state === 'error'}
						<div class="alert alert-warning">
							<span>Your offline copy could not be refreshed: {$offlineSyncStatus.message}</span>
							<button class="btn btn-sm" on:click={requestOfflineSync}>Retry</button>
						</div>
					{:else if $offlineSyncStatus.generatedAt}
						<p>
							Offline copy updated {new Date($offlineSyncStatus.generatedAt).toLocaleString()}.
						</p>
					{:else}
						<p>
							No offline copy is saved on this device yet. It saves automatically while you are
							online.
						</p>
					{/if}
				</div>

				<h3 class="font-semibold mt-4">Artwork</h3>
				{#if $artworkDownloadStatus.state === 'downloading'}
					<p role="status">Saving all artwork for offline…</p>
				{:else if $artworkDownloadStatus.state === 'error'}
					<div class="alert alert-warning" role="status">
						<span>Some artwork could not be saved: {$artworkDownloadStatus.message}.</span>
						<button class="btn btn-sm" on:click={downloadAllArtwork}>Retry</button>
					</div>
				{:else if $artworkDownloadStatus.state === 'done'}
					<p>All artwork is saved on this device.</p>
				{:else}
					<p>
						Artwork is saved as you view it. To browse every Pokémon offline, including every form,
						shiny and female variant, save it all now.
					</p>
					{#if $artworkDownloadStatus.state === 'missing'}
						<div>
							<button class="btn btn-primary btn-sm" on:click={downloadAllArtwork}>
								Save all artwork for offline{#if $artworkDownloadStatus.missingBytes}{' '}({formatMegabytes(
										$artworkDownloadStatus.missingBytes
									)}){/if}
							</button>
						</div>
					{/if}
				{/if}
			{/if}
		</div>
	</div>

	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">How it works</h2>
			<ul class="list-disc pl-5 space-y-2">
				<li>
					<strong>Install the app.</strong> Use your browser's "Install app" or "Add to Home Screen"
					option so Living Dex Tracker opens without a connection.
				</li>
				<li>
					<strong>Stay signed in.</strong> Your offline copy updates automatically whenever you are online,
					including after you make changes.
				</li>
				<li>
					<strong>Offline is read-only.</strong> You can browse your pokédexes, but catches and edits
					are disabled until you are back online.
				</li>
				<li>
					<strong>Artwork.</strong> Sprites are saved as you view them. Use "Save all artwork for offline"
					above to download the rest in one go.
				</li>
				<li>
					<strong>Signing out</strong> removes the offline copy from this device.
				</li>
			</ul>
		</div>
	</div>
</div>
