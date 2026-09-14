import { writable } from 'svelte/store';
import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';
import type { OfflineSnapshot } from '$lib/models/OfflineSnapshot';
import { resolveSpriteUrl } from '$lib/utils/spriteUrl';

export type OfflineSyncStatus = {
	state: 'idle' | 'syncing' | 'ready' | 'partial' | 'error';
	generatedAt: string | null;
	message: string | null;
};

export const offlineSyncStatus = writable<OfflineSyncStatus>({
	state: 'idle',
	generatedAt: null,
	message: null
});

const SYNC_EVENT = 'livingdex:offline-sync';
const OFFLINE_CACHE_PREFIX = 'livingdex-offline-';
const OFFLINE_META_CACHE = `${OFFLINE_CACHE_PREFIX}meta-v1`;
const OFFLINE_META_URL = '/__offline/current';

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

async function deleteOfflineCaches(): Promise<void> {
	if (typeof window === 'undefined' || !('caches' in window)) return;
	const names = await caches.keys();
	await Promise.all(
		names.filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX)).map((name) => caches.delete(name))
	);
}

export async function claimOfflineData(userId: string): Promise<void> {
	if (typeof window === 'undefined') return;
	if ('caches' in window) {
		const names = await caches.keys();
		if (names.includes(OFFLINE_META_CACHE)) {
			const response = await (await caches.open(OFFLINE_META_CACHE)).match(OFFLINE_META_URL);
			const meta = await response?.json().catch(() => null);
			if (typeof meta?.userId !== 'string' || meta.userId !== userId) await deleteOfflineCaches();
		}
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
	offlineSyncStatus.set({ state: 'idle', generatedAt: null, message: null });
}

export function startOfflineSync(getUserId: () => string | null): () => void {
	let timer: number | null = null;
	let stopped = false;
	let running = false;
	let rerun = false;
	let lastGeneratedAt: string | null = null;

	const synchronize = async () => {
		if (stopped || !navigator.onLine) return;
		if (running) {
			rerun = true;
			return;
		}
		const userId = getUserId();
		if (!userId || !('serviceWorker' in navigator)) return;
		running = true;
		offlineSyncStatus.set({ state: 'syncing', generatedAt: null, message: null });
		try {
			await claimOfflineData(userId);
			const response = await fetch('/api/offline-snapshot', {
				credentials: 'include',
				headers: { Accept: 'application/json' }
			});
			if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`);
			const snapshot = (await response.json()) as OfflineSnapshot;
			if (snapshot.userId !== userId) throw new Error('Snapshot owner did not match the session');
			const useLocal = PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true';
			const artworkUrls = Array.from(
				new Set(
					snapshot.pokedexes.flatMap(({ pokedex, entries }) =>
						entries.map(({ pokedexEntry }) => {
							const url = resolveSpriteUrl(pokedexEntry, pokedex.isShinyDex, useLocal);
							(
								pokedexEntry as typeof pokedexEntry & { offlineSpriteUrl: string }
							).offlineSpriteUrl = url;
							return url;
						})
					)
				)
			);
			if (getUserId() !== userId) throw new Error('Session changed during offline synchronization');
			const result = await workerMessage({
				type: 'SYNC_OFFLINE_SNAPSHOT',
				snapshot,
				artworkUrls
			});
			const failed = Number(result.failedArtwork ?? 0);
			offlineSyncStatus.set({
				state: failed > 0 ? 'partial' : 'ready',
				generatedAt: snapshot.generatedAt,
				message: failed > 0 ? `${failed} artwork files could not be cached` : null
			});
			lastGeneratedAt = snapshot.generatedAt;
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

	const schedule = () => {
		if (timer !== null) window.clearTimeout(timer);
		timer = window.setTimeout(() => {
			timer = null;
			void synchronize();
		}, 1_000);
	};

	// Best effort: ask the browser not to evict the offline artwork cache under storage pressure.
	void navigator.storage?.persist?.().catch(() => undefined);
	window.addEventListener(SYNC_EVENT, schedule);
	window.addEventListener('online', schedule);
	schedule();
	return () => {
		stopped = true;
		if (timer !== null) window.clearTimeout(timer);
		window.removeEventListener(SYNC_EVENT, schedule);
		window.removeEventListener('online', schedule);
	};
}
