import { afterCriticalPageWork } from '$lib/utils/criticalPageWork';
import { writable } from 'svelte/store';
import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';
import type { OfflineSnapshot } from '$lib/models/OfflineSnapshot';
import { resolveSpriteUrl, spriteRoot } from '$lib/utils/spriteUrl';

export type OfflineSyncStatus = {
	state: 'idle' | 'syncing' | 'ready' | 'error';
	generatedAt: string | null;
	message: string | null;
};

export type ArtworkDownloadStatus = {
	// unknown: not checked yet; missing: some sprites aren't saved; done: every sprite is saved.
	state: 'unknown' | 'missing' | 'downloading' | 'done' | 'error';
	missingBytes: number | null;
	message: string | null;
};

export const offlineSyncStatus = writable<OfflineSyncStatus>({
	state: 'idle',
	generatedAt: null,
	message: null
});

export const artworkDownloadStatus = writable<ArtworkDownloadStatus>({
	state: 'unknown',
	missingBytes: null,
	message: null
});

const SYNC_EVENT = 'livingdex:offline-sync';
const OFFLINE_CACHE_PREFIX = 'livingdex-offline-';
const OFFLINE_META_CACHE = `${OFFLINE_CACHE_PREFIX}meta-v1`;
const OFFLINE_META_URL = '/__offline/current';
// Must match OFFLINE_META_FORMAT in static/offline-worker.js. Older copies are always re-synced so
// the worker can migrate them (e.g. drop the full-size artwork cache).
const OFFLINE_META_FORMAT = 2;
// A page load reuses an offline copy this recent instead of downloading the whole collection again.
// Changes made in the app request a sync explicitly, so this only delays picking up edits made on
// another device.
const SNAPSHOT_FRESH_MS = 15 * 60 * 1000;

type OfflineMeta = { userId: string; generatedAt?: string; format?: number };

async function workerMessage(
	message: unknown,
	timeoutMs = 120_000,
	waitForReady = true
): Promise<Record<string, unknown>> {
	if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable');
	const registration = waitForReady
		? await navigator.serviceWorker.ready
		: await navigator.serviceWorker.getRegistration();
	if (!registration?.active) throw new Error('Offline worker is not active');
	return new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		const timeout = window.setTimeout(
			() => reject(new Error('Offline worker timed out')),
			timeoutMs
		);
		channel.port1.onmessage = (event) => {
			window.clearTimeout(timeout);
			const result = event.data as Record<string, unknown>;
			if (result?.ok) resolve(result);
			else reject(new Error(String(result?.error ?? 'Offline worker failed')));
		};
		registration.active?.postMessage(message, [channel.port2]);
	});
}

export function requestOfflineSync(): void {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(SYNC_EVENT));
}

async function readOfflineMeta(): Promise<OfflineMeta | null> {
	if (!('caches' in window)) return null;
	if (!(await caches.keys()).includes(OFFLINE_META_CACHE)) return null;
	const response = await (await caches.open(OFFLINE_META_CACHE)).match(OFFLINE_META_URL);
	const meta = await response?.json().catch(() => null);
	return typeof meta?.userId === 'string' ? meta : null;
}

async function deleteOfflineCaches(): Promise<void> {
	if (typeof window === 'undefined' || !('caches' in window)) return;
	const names = await caches.keys();
	await Promise.all(
		names.filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX)).map((name) => caches.delete(name))
	);
}

export async function claimOfflineData(userId: string): Promise<void> {
	if (typeof window === 'undefined') return;
	if ('caches' in window && (await caches.keys()).includes(OFFLINE_META_CACHE)) {
		const meta = await readOfflineMeta();
		if (meta?.userId !== userId) await deleteOfflineCaches();
	}
	if ('serviceWorker' in navigator && (await navigator.serviceWorker.getRegistration())?.active) {
		await workerMessage({ type: 'CLAIM_OFFLINE_USER', userId }, 10_000, false);
	}
}

export async function clearOfflineData(): Promise<void> {
	if (typeof window === 'undefined') return;
	await deleteOfflineCaches();
	if ('serviceWorker' in navigator && (await navigator.serviceWorker.getRegistration())?.active) {
		await workerMessage({ type: 'CLEAR_OFFLINE_DATA' }, 10_000, false);
	}
	// Sprites are kept across sign-out (they aren't account data), so the artwork status stays valid.
	offlineSyncStatus.set({ state: 'idle', generatedAt: null, message: null });
}

function currentSpriteRoot(): string {
	return spriteRoot(PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true');
}

function applyArtworkResult(result: Record<string, unknown>): void {
	const missing = Number(result.missing ?? 0);
	const failed = Number(result.failedArtwork ?? 0);
	if (failed > 0) {
		artworkDownloadStatus.set({
			state: 'error',
			missingBytes: Number(result.missingBytes ?? 0),
			message: `${failed} artwork files could not be saved`
		});
	} else {
		artworkDownloadStatus.set({
			state: missing > 0 ? 'missing' : 'done',
			missingBytes: Number(result.missingBytes ?? 0),
			message: null
		});
	}
}

/** Checks whether every sprite (all forms, shiny and female) is already saved on this device. */
export async function checkArtworkStatus(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		applyArtworkResult(
			await workerMessage({ type: 'ARTWORK_STATUS', spriteRoot: currentSpriteRoot() }, 30_000)
		);
	} catch (error) {
		// Leave the link hidden rather than offering a download that can't be checked.
		console.error('Unable to check saved artwork', error);
	}
}

/**
 * Artwork is normally cached as it is viewed. This saves every sprite that exists - all forms,
 * shiny and female variants, not just the saved dexes - skipping any that are already cached.
 */
export async function downloadAllArtwork(): Promise<void> {
	if (typeof window === 'undefined' || !navigator.onLine) return;
	artworkDownloadStatus.update((status) => ({ ...status, state: 'downloading', message: null }));
	try {
		// Generous timeout: the worker fetches each missing sprite with its own 15s limit.
		applyArtworkResult(
			await workerMessage(
				{ type: 'CACHE_ALL_ARTWORK', spriteRoot: currentSpriteRoot() },
				30 * 60 * 1000
			)
		);
	} catch (error) {
		artworkDownloadStatus.update((status) => ({
			...status,
			state: 'error',
			message: error instanceof Error ? error.message : String(error)
		}));
	}
}

export function startOfflineSync(getUserId: () => string | null): () => void {
	let timer: number | null = null;
	let stopped = false;
	let running = false;
	let rerun = false;
	let lastGeneratedAt: string | null = null;

	const synchronize = async (reuseFreshCopy: boolean) => {
		if (stopped || !navigator.onLine) return;
		if (running) {
			rerun = true;
			return;
		}
		const userId = getUserId();
		if (!userId || !('serviceWorker' in navigator)) return;
		running = true;
		try {
			await claimOfflineData(userId);
			if (reuseFreshCopy) {
				const meta = await readOfflineMeta();
				const age = meta?.generatedAt ? Date.now() - Date.parse(meta.generatedAt) : Infinity;
				if (
					meta?.userId === userId &&
					meta.format === OFFLINE_META_FORMAT &&
					age >= 0 &&
					age < SNAPSHOT_FRESH_MS
				) {
					lastGeneratedAt = meta.generatedAt ?? null;
					offlineSyncStatus.set({ state: 'ready', generatedAt: lastGeneratedAt, message: null });
					void checkArtworkStatus();
					return;
				}
			}
			offlineSyncStatus.set({ state: 'syncing', generatedAt: null, message: null });
			const response = await fetch('/api/offline-snapshot', {
				credentials: 'include',
				headers: { Accept: 'application/json' }
			});
			if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`);
			const snapshot = (await response.json()) as OfflineSnapshot;
			if (snapshot.userId !== userId) throw new Error('Snapshot owner did not match the session');
			const useLocal = PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true';
			// The worker derives which artwork belongs to the collection from these URLs, and the offline
			// viewer renders them.
			for (const { pokedex, entries } of snapshot.pokedexes) {
				for (const { pokedexEntry } of entries) {
					(pokedexEntry as typeof pokedexEntry & { offlineSpriteUrl: string }).offlineSpriteUrl =
						resolveSpriteUrl(pokedexEntry, pokedex.isShinyDex, useLocal);
				}
			}
			if (getUserId() !== userId) throw new Error('Session changed during offline synchronization');
			await workerMessage({ type: 'SYNC_OFFLINE_SNAPSHOT', snapshot });
			offlineSyncStatus.set({ state: 'ready', generatedAt: snapshot.generatedAt, message: null });
			lastGeneratedAt = snapshot.generatedAt;
			void checkArtworkStatus();
		} catch (error) {
			offlineSyncStatus.set({
				state: 'error',
				generatedAt: lastGeneratedAt,
				message: error instanceof Error ? error.message : String(error)
			});
		} finally {
			running = false;
			if (rerun && !stopped) {
				rerun = false;
				schedule();
			}
		}
	};

	const scheduleSync = (reuseFreshCopy: boolean) => {
		if (timer !== null) window.clearTimeout(timer);
		timer = window.setTimeout(() => {
			timer = null;
			void synchronize(reuseFreshCopy);
		}, 1_000);
	};
	// Explicit requests (edits, Retry, a new sign-in) and reconnecting always fetch a new copy.
	const schedule = () => {
		cancelStartup();
		scheduleSync(false);
	};

	// Best effort: ask the browser not to evict the offline artwork cache under storage pressure.
	void navigator.storage?.persist?.().catch(() => undefined);
	window.addEventListener(SYNC_EVENT, schedule);
	window.addEventListener('online', schedule);
	const cancelStartup = afterCriticalPageWork(() => scheduleSync(true));
	return () => {
		stopped = true;
		cancelStartup();
		if (timer !== null) window.clearTimeout(timer);
		window.removeEventListener(SYNC_EVENT, schedule);
		window.removeEventListener('online', schedule);
	};
}
