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
// import { NavigationRoute, registerRoute } from 'workbox-routing';

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

// let allowlist: undefined | RegExp[];
// if (import.meta.env.DEV) allowlist = [/^\/$/];

// // to allow work offline
// registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));
