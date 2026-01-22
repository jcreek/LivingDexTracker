/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
import {
	cleanupOutdatedCaches,
	// createHandlerBoundToURL,
	precacheAndRoute,
	precache
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Add root route to precache manifest
precache([{ url: '/', revision: null }]);

// self.__WB_MANIFEST is default injection point
// Handle the case where __WB_MANIFEST might be undefined in development
const manifest = self.__WB_MANIFEST || [];
if (Array.isArray(manifest)) {
	precacheAndRoute(manifest);
}

// clean old assets
cleanupOutdatedCaches();

registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'image-cache',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 3000,
				maxAgeSeconds: 60 * 60 * 24 * 30,
				purgeOnQuotaError: true
			})
		]
	})
);

// let allowlist: undefined | RegExp[];
// if (import.meta.env.DEV) allowlist = [/^\/$/];

// // to allow work offline
// registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));
