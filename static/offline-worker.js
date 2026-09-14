const OFFLINE_CACHE_PREFIX = 'livingdex-offline-';
const OFFLINE_META_CACHE = `${OFFLINE_CACHE_PREFIX}meta-v1`;
const OFFLINE_META_URL = '/__offline/current';
const ARTWORK_FETCH_TIMEOUT_MS = 15_000;
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

// Sprites never change at a given URL, so each user keeps one artwork cache that is topped up
// incrementally instead of being rebuilt on every sync.
function artworkCacheName(userId) {
	return `${OFFLINE_CACHE_PREFIX}art-v2-${userId}`;
}

// Covers both the local `/sprites-small/...` folder and the GitHub-hosted copy of it.
function isSpriteUrl(url) {
	return /\/sprites(-small)?\//.test(url.pathname) && url.pathname.endsWith('.webp');
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

async function cacheArtwork(cache, urls, isCurrent) {
	const wanted = new Set(urls.map((url) => new URL(url, self.location.origin).href));
	const cachedRequests = await cache.keys();
	const cached = new Set(cachedRequests.map((request) => request.url));
	await Promise.all(
		cachedRequests
			.filter((request) => !wanted.has(request.url))
			.map((request) => cache.delete(request))
	);
	const missing = [...wanted].filter((url) => !cached.has(url));

	let next = 0;
	let failed = 0;
	const workers = Array.from({ length: Math.min(6, missing.length) }, async () => {
		for (;;) {
			const index = next++;
			if (index >= missing.length || !isCurrent()) return;
			const url = missing[index];
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), ARTWORK_FETCH_TIMEOUT_MS);
			try {
				// CORS rather than no-cors: opaque responses are padded to several MB each for storage
				// quota, which a full Living Dex of artwork would exhaust.
				const response = await fetch(url, {
					mode: url.startsWith(self.location.origin) ? 'same-origin' : 'cors',
					signal: controller.signal
				});
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				await cache.put(url, response);
			} catch {
				failed++;
			} finally {
				clearTimeout(timeout);
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
	const isCurrent = () => syncEpoch === offlineEpoch;

	event.waitUntil(
		queueOfflineOperation(async () => {
			let nextData;
			let committed = false;
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
				// Per-sync artwork caches of opaque responses could fill the whole storage quota, so drop
				// them before writing anything new.
				await Promise.all(
					(await caches.keys())
						.filter((name) => name.startsWith(`${OFFLINE_CACHE_PREFIX}art-v1-`))
						.map((name) => caches.delete(name))
				);

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
				if (!isCurrent())
					throw new Error('Offline synchronization was superseded by an account change');

				// Commit the collection before any artwork so a slow or failing sprite download can never
				// prevent the offline copy from being saved.
				const artworkCache = artworkCacheName(snapshot.userId);
				const metaCache = await caches.open(OFFLINE_META_CACHE);
				await metaCache.put(
					OFFLINE_META_URL,
					new Response(
						JSON.stringify({
							userId: snapshot.userId,
							generatedAt: snapshot.generatedAt,
							dataCache: nextData,
							artworkCache
						}),
						{
							headers: { 'Content-Type': 'application/json' }
						}
					)
				);
				if (!isCurrent()) {
					const current = await currentOfflineMeta();
					if (current?.dataCache === nextData) await metaCache.delete(OFFLINE_META_URL);
					throw new Error('Offline synchronization was superseded by an account change');
				}
				committed = true;

				const currentCaches = await caches.keys();
				await Promise.all(
					currentCaches
						.filter(
							(name) =>
								name.startsWith(OFFLINE_CACHE_PREFIX) &&
								![OFFLINE_META_CACHE, nextData, artworkCache].includes(name)
						)
						.map((name) => caches.delete(name))
				);

				const failedArtwork = await cacheArtwork(
					await caches.open(artworkCache),
					Array.from(new Set(event.data.artworkUrls ?? [])),
					isCurrent
				);
				if (!isCurrent())
					throw new Error('Offline synchronization was superseded by an account change');
				reply({ ok: true, failedArtwork });
			} catch (error) {
				if (!committed && nextData) await caches.delete(nextData).catch(() => undefined);
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
			if (!meta?.artworkCache) return fetch(event.request);
			const cache = await caches.open(meta.artworkCache);
			const cached = await cache.match(event.request, { ignoreSearch: true });
			if (cached) return cached;
			if (!isSpriteUrl(url)) return fetch(event.request);
			// Cache-first with fill-on-miss: a sprite shown online is stored once and served from the
			// cache from then on, so the bulk sync never has to download it again.
			try {
				const response = await fetch(url.href, {
					mode: url.origin === self.location.origin ? 'same-origin' : 'cors'
				});
				if (response.ok) event.waitUntil(cache.put(url.href, response.clone()));
				return response;
			} catch {
				return fetch(event.request);
			}
		})()
	);
});
