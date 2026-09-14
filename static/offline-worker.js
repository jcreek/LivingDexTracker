const OFFLINE_CACHE_PREFIX = 'livingdex-offline-';
const OFFLINE_META_CACHE = `${OFFLINE_CACHE_PREFIX}meta-v1`;
const OFFLINE_META_URL = '/__offline/current';
let offlineEpoch = 0;
let offlineOperation = Promise.resolve();
let claimedUserId = null;

function queueOfflineOperation(operation) {
	const result = offlineOperation.then(operation, operation);
	offlineOperation = result.catch(() => undefined);
	return result;
}

function dataCacheName(userId, generation) {
	return `${OFFLINE_CACHE_PREFIX}data-v1-${userId}-${generation}`;
}

function artworkCacheName(userId, generation) {
	return `${OFFLINE_CACHE_PREFIX}art-v1-${userId}-${generation}`;
}

async function currentOfflineMeta() {
	const response = await (await caches.open(OFFLINE_META_CACHE)).match(OFFLINE_META_URL);
	if (!response) return null;
	const data = await response.json().catch(() => null);
	return typeof data?.userId === 'string' ? data : null;
}

async function clearOfflineData() {
	const names = await caches.keys();
	await Promise.all(
		names.filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX)).map((name) => caches.delete(name))
	);
}

async function notifyOfflineDataCleared() {
	const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
	for (const client of windows) client.postMessage({ type: 'OFFLINE_DATA_CLEARED' });
}

async function cacheArtwork(cache, urls) {
	let next = 0;
	let failed = 0;
	const workers = Array.from({ length: Math.min(6, urls.length) }, async () => {
		for (;;) {
			const index = next++;
			if (index >= urls.length) return;
			const url = urls[index];
			try {
				const response = await fetch(url, {
					mode: url.startsWith(self.location.origin) ? 'same-origin' : 'no-cors'
				});
				if (!response.ok && response.type !== 'opaque') throw new Error(`HTTP ${response.status}`);
				await cache.put(url, response);
			} catch {
				failed++;
			}
		}
	});
	await Promise.all(workers);
	return failed;
}

self.addEventListener('message', (event) => {
	const reply = (value) => event.ports[0]?.postMessage(value);
	if (event.data?.type === 'CLEAR_OFFLINE_DATA') {
		claimedUserId = null;
		offlineEpoch++;
		event.waitUntil(
			queueOfflineOperation(async () => {
				await clearOfflineData();
				await notifyOfflineDataCleared();
			})
				.then(() => reply({ ok: true }))
				.catch((error) => reply({ ok: false, error: String(error) }))
		);
		return;
	}
	if (event.data?.type === 'CLAIM_OFFLINE_USER') {
		if (typeof event.data.userId !== 'string') {
			reply({ ok: false, error: 'Invalid offline cache owner' });
			return;
		}
		claimedUserId = event.data.userId;
		offlineEpoch++;
		event.waitUntil(
			queueOfflineOperation(async () => {
				const meta = await currentOfflineMeta();
				if (meta?.userId && meta.userId !== event.data.userId) {
					await clearOfflineData();
					await notifyOfflineDataCleared();
				}
				reply({ ok: true });
			}).catch((error) => reply({ ok: false, error: String(error) }))
		);
		return;
	}
	if (event.data?.type !== 'SYNC_OFFLINE_SNAPSHOT') return;
	const syncEpoch = offlineEpoch;
	const syncUserId = claimedUserId;

	event.waitUntil(
		queueOfflineOperation(async () => {
			let nextData;
			let nextArtwork;
			try {
				const snapshot = event.data.snapshot;
				if (!snapshot || snapshot.version !== 1 || typeof snapshot.userId !== 'string') {
					throw new Error('Unsupported offline snapshot');
				}
				if (!syncUserId || snapshot.userId !== syncUserId) {
					throw new Error('Offline snapshot owner did not match the claimed account');
				}
				const previousMeta = await currentOfflineMeta();
				if (previousMeta?.userId && previousMeta.userId !== snapshot.userId)
					await clearOfflineData();

				const timestamp = String(snapshot.generatedAt).replace(/[^0-9]/g, '');
				const generation = `${timestamp}-${crypto.randomUUID()}`;
				nextData = dataCacheName(snapshot.userId, generation);
				const dataCache = await caches.open(nextData);
				await dataCache.put(
					`/__offline/snapshot/${encodeURIComponent(snapshot.userId)}`,
					new Response(JSON.stringify(snapshot), {
						headers: { 'Content-Type': 'application/json' }
					})
				);

				nextArtwork = artworkCacheName(snapshot.userId, generation);
				const artworkCache = await caches.open(nextArtwork);
				const failedArtwork = await cacheArtwork(
					artworkCache,
					Array.from(new Set(event.data.artworkUrls ?? []))
				);
				if (syncEpoch !== offlineEpoch) {
					await Promise.all([caches.delete(nextData), caches.delete(nextArtwork)]);
					throw new Error('Offline synchronization was superseded by an account change');
				}

				const metaCache = await caches.open(OFFLINE_META_CACHE);
				await metaCache.put(
					OFFLINE_META_URL,
					new Response(
						JSON.stringify({
							userId: snapshot.userId,
							generatedAt: snapshot.generatedAt,
							dataCache: nextData,
							artworkCache: nextArtwork
						}),
						{
							headers: { 'Content-Type': 'application/json' }
						}
					)
				);
				if (syncEpoch !== offlineEpoch) {
					const current = await currentOfflineMeta();
					if (current?.dataCache === nextData) await metaCache.delete(OFFLINE_META_URL);
					await Promise.all([caches.delete(nextData), caches.delete(nextArtwork)]);
					throw new Error('Offline synchronization was superseded by an account change');
				}
				if (previousMeta?.artworkCache && previousMeta.artworkCache !== nextArtwork) {
					await caches.delete(previousMeta.artworkCache);
				}
				if (previousMeta?.dataCache && previousMeta.dataCache !== nextData) {
					await caches.delete(previousMeta.dataCache);
				}
				const currentCaches = await caches.keys();
				await Promise.all(
					currentCaches
						.filter(
							(name) =>
								name.startsWith(OFFLINE_CACHE_PREFIX) &&
								![OFFLINE_META_CACHE, nextData, nextArtwork].includes(name)
						)
						.map((name) => caches.delete(name))
				);
				reply({ ok: true, failedArtwork });
			} catch (error) {
				await Promise.allSettled(
					[nextData, nextArtwork].filter(Boolean).map((name) => caches.delete(name))
				);
				reply({ ok: false, error: error instanceof Error ? error.message : String(error) });
			}
		})
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.mode === 'navigate' && !['/offline', '/offline.html'].includes(url.pathname)) {
		const fallback = async () =>
			(await caches.match('/offline', { ignoreSearch: true })) ??
			(await caches.match('/offline.html', { ignoreSearch: true })) ??
			Response.error();
		event.respondWith(
			self.navigator.onLine
				? fetch(new Request(event.request, { cache: 'no-store' })).catch(fallback)
				: fallback()
		);
		return;
	}
	if (event.request.destination !== 'image') return;
	event.respondWith(
		(async () => {
			const meta = await currentOfflineMeta();
			if (meta?.artworkCache) {
				const cached = await (
					await caches.open(meta.artworkCache)
				).match(event.request, {
					ignoreSearch: true
				});
				if (cached) return cached;
			}
			return fetch(event.request);
		})()
	);
});
