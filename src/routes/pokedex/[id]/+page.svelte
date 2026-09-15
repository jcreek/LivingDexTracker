<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CombinedData } from '$lib/models/CombinedData';
	import { browser } from '$app/environment';
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import { calculateBoxNumbers, calculateBoxPlacement } from '$lib/utils/boxPlacement';
	import {
		createCatchRecordWriteQueue,
		type CatchRecordWriteQueueStatus
	} from '$lib/utils/catchRecordWriteQueue';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';
	import PokedexModal from '$lib/components/pokedex/PokedexModal.svelte';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';
	import type { Pokedex } from '$lib/models/Pokedex';
	import type { PageData } from './$types';
	import { readOfflineEntry, requestOfflineSync } from '$lib/stores/offlineSync';
	import { get } from 'svelte/store';
	import {
		PROVIDER_LABELS,
		backupsNeedingReconnect,
		markReconnectNeeded,
		refreshBackupStatus
	} from '$lib/stores/backupStatus';
	import type { ExportProvider } from '$lib/models/PokedexExportIntegration';
	import {
		unpackGrid,
		type PokedexGridRow,
		type CatchRecordPatch
	} from '$lib/models/PokedexGridRow';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';

	export let data: PageData;

	// Get pokédex from server load (guarded for transient undefined during navigation/HMR)
	let pokedex: Pokedex | undefined;
	let pokedexId = '';
	$: pokedex = data?.pokedex;
	$: pokedexId = pokedex?._id ?? '';
	$: if (browser && pokedexId) {
		try {
			localStorage.setItem('activePokedexId', pokedexId);
		} catch {
			// Ignore storage errors (private mode, etc.)
		}
	}

	let combinedData: PokedexGridRow[] | null = null;
	type CatchUpdateEvent = CustomEvent<{
		catchRecord: CatchRecord;
		source: 'toggle' | 'notes' | 'notes-blur';
		changes?: Partial<CatchRecord>;
	}>;
	let creatingRecords = false;
	let totalRecordsCreated = 0;
	let failedToLoad = false;
	let localUser: User | null = data.user ?? null;
	let userStoreReady = false;
	let boxNumbers: number[] = [];
	let showModal = false;
	let selectedPokemon: CombinedData | null = null;
	let showShareModal = false;
	let shareUrl = '';
	let shareFeedback = '';
	let nativeShareSupported = false;
	let online = true;

	let catchWriteQueue: ReturnType<typeof createCatchRecordWriteQueue> | null = null;
	let catchWriteQueueKey: string | null = null;
	let catchWriteQueueUnsubscribe: (() => void) | null = null;
	let catchWriteStatus: CatchRecordWriteQueueStatus = {
		pending: 0,
		inFlight: 0,
		lastError: null,
		lastFlushAttemptAt: null,
		lastSuccessfulFlushAt: null
	};
	let lastOfflineSyncFlush: number | null = null;
	// Backup providers that just refused this page's export because their access was revoked.
	let reconnectToastLabels: string[] = [];
	let exportAfterFlush = false;
	let exportInFlight = false;
	let exportTimer: ReturnType<typeof setTimeout> | null = null;
	let exportGeneration = 0;
	let exportInFlightGeneration = 0;
	let toggleFlushTimer: ReturnType<typeof setTimeout> | null = null;

	function resetExportState() {
		if (exportTimer) {
			clearTimeout(exportTimer);
			exportTimer = null;
		}
		if (toggleFlushTimer) {
			clearTimeout(toggleFlushTimer);
			toggleFlushTimer = null;
		}
		exportAfterFlush = false;
		exportInFlight = false;
		exportGeneration = 0;
		exportInFlightGeneration = 0;
	}

	function scheduleExportIfIdle() {
		if (!browser) return;
		if (!pokedexId) return;
		const isIdle = catchWriteStatus.pending === 0 && catchWriteStatus.inFlight === 0;
		if (!isIdle) return;
		if (!exportAfterFlush || exportInFlight) return;
		if (exportTimer) return;
		exportTimer = setTimeout(async () => {
			exportTimer = null;
			if (!exportAfterFlush || exportInFlight) return;
			exportInFlight = true;
			exportInFlightGeneration = exportGeneration;
			try {
				const response = await fetch(`/api/pokedexes/${pokedexId}/export`, {
					method: 'POST',
					credentials: 'include'
				});
				if (!response.ok) {
					const body = await response.text().catch(() => '');
					console.error('Auto-export failed:', response.status, body);
					return;
				}
				const result = (await response.json().catch(() => null)) as {
					failed?: Array<{ provider: ExportProvider; reconnectRequired?: boolean }>;
				} | null;
				const revoked = (result?.failed ?? []).filter((failure) => failure.reconnectRequired);
				const alreadyPaused = new Set(get(backupsNeedingReconnect));
				if (revoked.length > 0) {
					markReconnectNeeded(revoked.map((failure) => failure.provider));
				} else {
					// Saving a catch record also exports on the server, and that export may already have
					// paused a provider, leaving this export nothing to report. Re-read the status to catch it.
					await refreshBackupStatus();
				}
				const newlyPaused = get(backupsNeedingReconnect).filter(
					(provider) => !alreadyPaused.has(provider)
				);
				if (newlyPaused.length > 0) {
					reconnectToastLabels = newlyPaused.map((provider) => PROVIDER_LABELS[provider]);
				}
				if (exportGeneration === exportInFlightGeneration) {
					exportAfterFlush = false;
				}
			} catch (error) {
				console.error('Failed to auto-export pokedex:', error);
			} finally {
				exportInFlight = false;
				scheduleExportIfIdle();
			}
		}, 400);
	}

	function scheduleToggleFlush() {
		if (!catchWriteQueue) return;
		if (toggleFlushTimer) {
			clearTimeout(toggleFlushTimer);
		}
		toggleFlushTimer = setTimeout(async () => {
			toggleFlushTimer = null;
			try {
				await catchWriteQueue?.flushNow();
			} catch (error) {
				console.error('Failed to flush catch record updates:', error);
			}
		}, 250);
	}

	// Derive from pokedex config
	$: showOrigins = !!pokedex?.isOriginDex;
	$: showShiny = !!pokedex?.isShinyDex;

	const unsubscribe = user.subscribe((value) => {
		if (userStoreReady) localUser = value;
	});
	onDestroy(unsubscribe);
	onDestroy(() => {
		detailRequest++;
		detailAbort?.abort();
	});
	onDestroy(() => {
		catchWriteQueueUnsubscribe?.();
		catchWriteQueueUnsubscribe = null;
	});
	onDestroy(() => {
		resetExportState();
	});

	let selectedSummary: PokedexGridRow | null = null;
	let detailError = '';
	let detailRequest = 0;
	let detailAbort: AbortController | null = null;
	let returnFocus: HTMLElement | null = null;
	const detailCache = new Map<string, CombinedData>();
	let detailOwner = '';
	$: if (localUser?.id !== detailOwner) {
		detailOwner = localUser?.id ?? '';
		detailCache.clear();
		closePokemonModal();
	}

	async function openPokemonModal(pokemon: PokedexGridRow) {
		if (!showModal) returnFocus = document.activeElement as HTMLElement;
		selectedSummary = pokemon;
		selectedPokemon = null;
		detailError = '';
		showModal = true;
		const request = ++detailRequest;
		detailAbort?.abort();
		detailAbort = new AbortController();
		const id = pokedexId;
		const owner = localUser?.id || '';
		const entryId = pokemon.pokedexEntry._id;
		const key = `${owner}:${id}:${entryId}`;
		try {
			let detail = detailCache.get(key);
			if (!detail) {
				if (!navigator.onLine) detail = (await readOfflineEntry(owner, id, entryId)) ?? undefined;
				else {
					const response = await fetch(`/api/pokedexes/${id}/entries/${entryId}`, {
						signal: detailAbort.signal
					});
					if (!response.ok) throw new Error('Unable to load details. Please retry.');
					detail = await response.json();
				}
			}
			if (request !== detailRequest || id !== pokedexId || owner !== localUser?.id) return;
			if (!detail) throw new Error('These details are not saved for offline use.');
			detailCache.set(key, detail);
			// A detail response must not undo status changes made while it was in flight.
			const current = combinedData?.find((row) => row.pokedexEntry._id === entryId)?.catchRecord;
			const pending = catchWriteQueue?.getPendingPatch(entryId);
			selectedPokemon = {
				...detail,
				catchRecord:
					detail.catchRecord || current || pending
						? {
								_id: '',
								userId: owner,
								pokedexId: id,
								pokemonId: entryId,
								caught: false,
								haveToEvolve: false,
								inHome: false,
								hasGigantamaxed: false,
								personalNotes: '',
								...detail.catchRecord,
								...current,
								...pending
							}
						: null
			};
		} catch (error) {
			if (request !== detailRequest || id !== pokedexId || owner !== localUser?.id) return;
			detailError = error instanceof Error ? error.message : 'Unable to load details.';
		}
	}

	function openShareModal() {
		if (!pokedex?.shareToken || !browser) return;
		shareUrl = `${window.location.origin}/shared/${pokedex.shareToken}`;
		shareFeedback = '';
		showShareModal = true;
	}

	function closeShareModal() {
		showShareModal = false;
		shareFeedback = '';
	}

	async function copyShareLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			shareFeedback = 'Link copied';
		} catch {
			shareFeedback = 'Copy failed — select the link above to copy it manually.';
		}
	}

	async function sharePokedex() {
		if (!nativeShareSupported || !pokedex) return;
		try {
			await navigator.share({
				title: pokedex.name,
				text: `See my ${pokedex.name} progress on Living Dex Tracker.`,
				url: shareUrl
			});
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				shareFeedback = 'Sharing failed. You can copy the link instead.';
			}
		}
	}

	function closePokemonModal() {
		detailRequest++;
		detailAbort?.abort();
		showModal = false;
		selectedPokemon = null;
		selectedSummary = null;
		if (browser && returnFocus) {
			const target = returnFocus;
			void tick().then(() => target.isConnected && target.focus());
		}
		returnFocus = null;
	}

	function ensureCatchWriteQueue() {
		if (!browser) return;
		if (!pokedexId) return;
		if (!localUser?.id) return;
		const ownerId = localUser.id;
		const desiredKey = `${ownerId}:${pokedexId}`;
		if (catchWriteQueue && catchWriteQueueKey === desiredKey) return;

		resetExportState();

		// Unsubscribe from the previous queue's status store before replacing the queue.
		catchWriteQueueUnsubscribe?.();
		catchWriteQueueUnsubscribe = null;

		catchWriteQueue = createCatchRecordWriteQueue({
			endpointUrl: `/api/pokedexes/${pokedexId}/catch-records`,
			fetchFn: fetch,
			batchSize: 200,
			concurrency: 1,
			isCurrentUser: () => get(user)?.id === ownerId
		});
		catchWriteQueueKey = desiredKey;

		catchWriteQueueUnsubscribe = catchWriteQueue.getStatus.subscribe((s) => {
			catchWriteStatus = s;
			if (
				s.lastSuccessfulFlushAt &&
				s.lastSuccessfulFlushAt !== lastOfflineSyncFlush &&
				s.pending === 0 &&
				s.inFlight === 0
			) {
				lastOfflineSyncFlush = s.lastSuccessfulFlushAt;
				requestOfflineSync();
			}
			if (s.pending > 0 || s.inFlight > 0) {
				if (exportTimer) {
					clearTimeout(exportTimer);
					exportTimer = null;
				}
				return;
			}

			scheduleExportIfIdle();
		});
	}

	let editGeneration = 0;
	function applyOptimisticCatchRecordUpdate(next: CatchRecordPatch) {
		if (!combinedData) return;
		editGeneration++;
		combinedData = combinedData.map((row) =>
			row.pokedexEntry._id === next.pokemonId
				? {
						...row,
						catchRecord: {
							_id: '',
							caught: false,
							haveToEvolve: false,
							inHome: false,
							hasGigantamaxed: false,
							...row.catchRecord,
							...next
						}
					}
				: row
		);
		const key = `${next.userId}:${next.pokedexId}:${next.pokemonId}`;
		const cached = detailCache.get(key);
		if (cached)
			detailCache.set(key, {
				...cached,
				catchRecord: {
					_id: '',
					caught: false,
					haveToEvolve: false,
					inHome: false,
					hasGigantamaxed: false,
					personalNotes: '',
					...cached.catchRecord,
					...next
				}
			});
		if (selectedPokemon?.pokedexEntry._id === next.pokemonId)
			selectedPokemon = {
				...selectedPokemon,
				catchRecord: {
					_id: '',
					caught: false,
					haveToEvolve: false,
					inHome: false,
					hasGigantamaxed: false,
					personalNotes: '',
					...selectedPokemon.catchRecord,
					...next
				}
			};
	}

	async function handleModalCatchUpdate(event: CatchUpdateEvent) {
		await updateACatch(event);
	}

	let gridRequest = 0;
	async function getData({ setCombinedDataToNull = true } = {}) {
		const id = pokedexId;
		const owner = localUser?.id;
		const request = ++gridRequest;
		const generation = editGeneration;
		if (setCombinedDataToNull) combinedData = null;
		failedToLoad = false;
		try {
			const response = await fetch(`/api/pokedexes/${id}/grid`);
			if (!response.ok) throw new Error('Unable to load grid');
			const result = await response.json();
			if (
				request !== gridRequest ||
				id !== pokedexId ||
				owner !== localUser?.id ||
				generation !== editGeneration
			)
				return;
			combinedData = unpackGrid(result.grid);
			detailCache.clear();
		} catch {
			if (request === gridRequest && id === pokedexId && owner === localUser?.id)
				failedToLoad = true;
		}
	}

	async function updateACatch(event: CatchUpdateEvent) {
		if (!pokedexId) return;
		ensureCatchWriteQueue();
		const { catchRecord, source, changes } = event.detail;
		// Enforce mutual exclusivity (should be impossible to have both true).
		const sanitizedCatchRecord: CatchRecord = { ...catchRecord };
		if (sanitizedCatchRecord.caught) {
			sanitizedCatchRecord.haveToEvolve = false;
		}
		if (sanitizedCatchRecord.haveToEvolve) {
			sanitizedCatchRecord.caught = false;
		}
		if (!localUser?.id) {
			alert('User not signed in');
			return;
		}

		// Optimistic UI: update local state immediately.
		const patch: CatchRecordPatch = {
			userId: localUser.id,
			pokedexId,
			pokemonId: sanitizedCatchRecord.pokemonId,
			...(changes ??
				(source === 'toggle'
					? {
							caught: sanitizedCatchRecord.caught,
							haveToEvolve: sanitizedCatchRecord.haveToEvolve,
							inHome: sanitizedCatchRecord.inHome,
							hasGigantamaxed: sanitizedCatchRecord.hasGigantamaxed
						}
					: { personalNotes: sanitizedCatchRecord.personalNotes }))
		};
		applyOptimisticCatchRecordUpdate(patch);

		// Queue a background write with coalescing.
		const debounceMs = source === 'notes' ? 650 : 0;
		catchWriteQueue?.enqueue(patch, {
			debounceMs,
			flushSoon: true
		});
		exportGeneration++;
		exportAfterFlush = true;
		if (source === 'toggle') {
			scheduleToggleFlush();
		}
		if (source === 'notes-blur') {
			// Force a flush attempt when the user leaves the textarea.
			await catchWriteQueue?.flushNow();
		}
	}

	async function updateCatchRecords(
		boxNumber: number,
		caught: boolean,
		needsToEvolve: boolean,
		inHome: boolean | null = null
	) {
		if (!combinedData) return;
		if (!pokedexId) return;
		ensureCatchWriteQueue();

		const catchRecordsToUpdate: CatchRecordPatch[] = combinedData
			.filter((_, index) => calculateBoxPlacement(index).box === boxNumber)
			.map(({ pokedexEntry }) => ({
				userId: localUser?.id || '',
				pokedexId,
				pokemonId: pokedexEntry._id,
				...(inHome !== null ? { inHome } : { caught, haveToEvolve: needsToEvolve })
			}));

		// Optimistic patch: apply locally first.
		for (const record of catchRecordsToUpdate) {
			// Ensure mutual exclusivity locally.
			if (record.caught) record.haveToEvolve = false;
			if (record.haveToEvolve) record.caught = false;
			applyOptimisticCatchRecordUpdate(record);
			catchWriteQueue?.enqueue(record, { flushSoon: true });
			exportGeneration++;
			exportAfterFlush = true;
		}
		// Kick a flush attempt (batching will occur inside the queue).
		await catchWriteQueue?.flushNow();
	}

	async function markBoxAsNotCaught(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false);
	}

	async function markBoxAsCaught(boxNumber: number) {
		await updateCatchRecords(boxNumber, true, false);
	}

	async function markBoxAsNeedsToEvolve(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, true);
	}

	async function markBoxAsInHome(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false, true);
	}

	async function markBoxAsNotInHome(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false, false);
	}

	async function getPokedexEntries() {
		const response = await fetch('/api/pokedexentries');
		if (!response.ok) {
			throw new Error('Failed to fetch Pokémon data');
		}

		return await response.json();
	}

	async function createCatchRecords() {
		if (!pokedexId) return;
		// this user doesn't have any catch records, so we need to create them
		await getPokedexEntries().then(async (pokedexEntries) => {
			// If there are no catch records, make one for each pokedex entry
			creatingRecords = true;
			const newCatchRecords = pokedexEntries.map((entry: PokedexEntry) => ({
				userId: localUser?.id,
				pokemonId: entry._id,
				pokedexId: pokedexId,
				haveToEvolve: false,
				caught: false,
				inHome: false,
				hasGigantamaxed: false,
				personalNotes: ''
			}));

			if (newCatchRecords.length === 0) {
				alert('No pokedex entries to create catch records for');
				return;
			}

			const batchSize = 500;
			for (let i = 0; i < newCatchRecords.length; i += batchSize) {
				const batch = newCatchRecords.slice(i, i + batchSize);

				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(batch)
				};

				try {
					// Use new pokédex-scoped endpoint
					const response = await fetch(`/api/pokedexes/${pokedexId}/catch-records`, requestOptions);
					if (!response.ok) {
						throw new Error('Failed to create catch records');
					}

					const createdRecords = await response.json();
					totalRecordsCreated += createdRecords.length;
				} catch (error) {
					console.error('Error creating catch records:', error);
				}
			}

			creatingRecords = false;
			failedToLoad = false;
			await getData();
		});
	}

	let shownData: PageData | undefined;
	$: if (data !== shownData) {
		shownData = data;
		localUser = data.user ?? null;
		gridRequest++;
		closePokemonModal();
		detailCache.clear();
		combinedData = data.grid ? unpackGrid(data.grid) : null;
		failedToLoad = data.grid === null;
	}
	$: boxNumbers = calculateBoxNumbers(combinedData?.length ?? 0);

	onMount(() => {
		if (!browser) return;
		userStoreReady = true;
		nativeShareSupported = typeof navigator.share === 'function';

		const flushKeepalive = () => {
			if (!catchWriteQueue) return;
			// Best-effort: keepalive requests have body-size limits; flush a small batch.
			void catchWriteQueue.flushNow({ keepalive: true, limit: 25 });
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === 'hidden') flushKeepalive();
		};

		online = navigator.onLine;
		const onOffline = () => {
			online = false;
		};
		const onOnline = () => {
			online = true;
			void catchWriteQueue?.flushNow();
		};
		window.addEventListener('offline', onOffline);

		window.addEventListener('pagehide', flushKeepalive);
		document.addEventListener('visibilitychange', onVisibilityChange);
		window.addEventListener('online', onOnline);

		// Periodic reconciliation to guard against any missed state (e.g. aborted tab-close flush).
		const reconcileInterval = window.setInterval(() => {
			if (!pokedexId) return;
			if (creatingRecords) return;
			if (catchWriteStatus.pending > 0 || catchWriteStatus.inFlight > 0) return;
			void getData({ setCombinedDataToNull: false });
		}, 60_000);

		return () => {
			window.removeEventListener('pagehide', flushKeepalive);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('online', onOnline);
			window.removeEventListener('offline', onOffline);
			window.clearInterval(reconcileInterval);
		};
	});
</script>

{#if reconnectToastLabels.length > 0}
	<!-- Above DaisyUI's modal (z-index 999) so the alert stays usable over an open Pokémon dialog. -->
	<div class="toast toast-end z-[1000]">
		<div class="alert alert-warning" role="alert" data-testid="backup-reconnect-toast">
			<span>
				Backups to {reconnectToastLabels.join(' and ')} have stopped because access expired or was revoked.
			</span>
			<a class="btn btn-sm" href="/backup-settings">Reconnect</a>
			<button
				type="button"
				class="btn btn-sm btn-ghost"
				aria-label="Dismiss"
				on:click={() => (reconnectToastLabels = [])}>✕</button
			>
		</div>
	</div>
{/if}

<svelte:head>
	<title>{pokedex ? `${pokedex.name} - Living Dex Tracker` : 'Pokédex - Living Dex Tracker'}</title>
</svelte:head>

{#if !localUser}
	<p>Please <a href="/signin" class="underline text-primary hover:text-secondary">sign in</a></p>
{:else if !pokedex}
	<p>Loading...</p>
{:else}
	<div class="container mx-auto p-4 max-w-screen-2xl">
		<!-- Pokédex Header -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<!-- Left side: Title and metadata -->
					<div class="flex-1">
						<h1 class="card-title text-3xl mb-3">{pokedex.name}</h1>

						<div class="flex flex-wrap items-center gap-3">
							<!-- Type badges -->
							{#if pokedex.isLivingDex}
								<div class="badge badge-primary badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
									Living
								</div>
							{/if}
							{#if pokedex.isShinyDex}
								<div class="badge badge-secondary badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
									Shiny
								</div>
							{/if}
							{#if pokedex.isOriginDex}
								<div class="badge badge-accent badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
											clip-rule="evenodd"
										/>
									</svg>
									Origin
								</div>
							{/if}
							{#if pokedex.isFormDex}
								<div class="badge badge-info badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
										/>
									</svg>
									Form
								</div>
							{/if}

							<!-- Game scope -->
							{#if pokedex.gameScope}
								<div class="divider divider-horizontal mx-0"></div>
								<div class="flex items-center gap-2 text-base-content/70">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
										<path
											fill-rule="evenodd"
											d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="font-semibold">{pokedex.gameScope}</span>
									{#if pokedex.dexScopes?.length}
										<span class="text-xs text-base-content/60">
											({pokedex.dexScopes.length} dex{pokedex.dexScopes.length === 1 ? '' : 'es'})
										</span>
									{/if}
								</div>
							{:else}
								<div class="divider divider-horizontal mx-0"></div>
								<div class="flex items-center gap-2 text-base-content/70">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="font-semibold">All Games</span>
								</div>
							{/if}
						</div>

						{#if pokedex.description}
							<p class="text-sm text-base-content/70 mt-3">{pokedex.description}</p>
						{/if}
					</div>

					<!-- Right side: Actions -->
					<div class="flex flex-row lg:flex-col gap-2">
						{#if catchWriteStatus.pending > 0 || catchWriteStatus.inFlight > 0}
							<div class="text-sm text-base-content/70">
								Saving… ({catchWriteStatus.pending} queued)
							</div>
						{:else if catchWriteStatus.lastError}
							<div class="text-sm text-error" title={catchWriteStatus.lastError}>
								Save failed (will retry)
							</div>
						{/if}
						<button type="button" class="btn btn-primary btn-sm" on:click={openShareModal}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M15 8a3 3 0 1 0-2.83-4L7.91 6.13a3 3 0 0 0 0 1.74L12.17 10A3 3 0 1 0 13 8.59L8.83 6.5 13 4.41A3 3 0 0 0 15 8Zm0 10a3 3 0 1 0-2.83-4L7.91 11.87a3 3 0 1 0 0 1.74L12.17 15.7A3 3 0 0 0 15 18Z"
								/>
							</svg>
							Share
						</button>
						<a href="/my-pokedexes" class="btn btn-outline btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
								/>
							</svg>
							My Pokédexes
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Box View -->
		<PokedexViewBoxes
			{showShiny}
			{combinedData}
			bind:boxNumbers
			bind:creatingRecords
			{totalRecordsCreated}
			bind:failedToLoad
			{markBoxAsNotCaught}
			{markBoxAsCaught}
			{markBoxAsNeedsToEvolve}
			{markBoxAsInHome}
			{markBoxAsNotInHome}
			{createCatchRecords}
			retryLoad={() => getData()}
			virtualize={true}
			gridKey={pokedexId}
			initialLayout={data.boxViewLayout}
			onPokemonClick={(row) => {
				const own = combinedData?.find((entry) => entry.pokedexEntry._id === row.pokedexEntry._id);
				if (own) void openPokemonModal(own);
			}}
		/>
	</div>

	{#if showModal && selectedSummary}
		<PokedexModal isOpen={showModal} onClose={closePokemonModal}>
			{#if selectedPokemon}
				<PokedexEntryCatchRecord
					pokedexEntry={selectedPokemon.pokedexEntry}
					bind:catchRecord={selectedPokemon.catchRecord}
					{showOrigins}
					showForms={pokedex.isFormDex}
					{showShiny}
					userId={localUser?.id}
					{pokedexId}
					on:updateCatch={handleModalCatchUpdate}
					readOnly={!online}
					sharedCatchStatus={selectedPokemon.catchRecord}
				/>
				{#if !online && selectedPokemon.catchRecord?.personalNotes}<p class="p-6">
						Notes: {selectedPokemon.catchRecord.personalNotes}
					</p>{/if}
			{:else}
				<div class="p-6" aria-busy={!detailError}>
					<h2 class="text-xl font-bold">{selectedSummary.pokedexEntry.pokemon}</h2>
					<div class="w-64 h-64">
						<PokemonSprite
							pokemonName={selectedSummary.pokedexEntry.pokemon}
							pokedexNumber={selectedSummary.pokedexEntry.pokedexNumber}
							form={selectedSummary.pokedexEntry.form}
							spriteKey={selectedSummary.pokedexEntry.spriteKey}
							shiny={showShiny}
							loadingStrategy="eager"
						/>
					</div>
					{#if detailError}
						<p role="alert">{detailError}</p>
						<button
							class="btn"
							data-offline-action
							on:click={() => selectedSummary && openPokemonModal(selectedSummary)}
							>Retry details</button
						>
					{:else}<p role="status">Loading details…</p>{/if}
				</div>
			{/if}
		</PokedexModal>
	{/if}

	{#if showShareModal}
		<div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="share-title">
			<div class="modal-box">
				<h2 id="share-title" class="font-bold text-xl">Share {pokedex.name}</h2>
				<p class="py-3 text-sm text-base-content/70">
					Anyone with this link can view live progress. Personal notes are never shared.
				</p>
				<label class="label" for="share-url"><span class="label-text">Read-only link</span></label>
				<input
					id="share-url"
					class="input input-bordered w-full"
					value={shareUrl}
					readonly
					on:focus={(event) => event.currentTarget.select()}
				/>
				{#if shareFeedback}
					<p class="text-sm mt-2" role="status">{shareFeedback}</p>
				{/if}
				<div class="modal-action">
					<button type="button" class="btn btn-ghost" on:click={closeShareModal}>Close</button>
					<button type="button" class="btn btn-outline" on:click={copyShareLink}>Copy link</button>
					{#if nativeShareSupported}
						<button type="button" class="btn btn-primary" on:click={sharePokedex}>Share…</button>
					{/if}
				</div>
			</div>
			<button
				class="modal-backdrop"
				type="button"
				aria-label="Close share dialog"
				on:click={closeShareModal}
			></button>
		</div>
	{/if}
{/if}
