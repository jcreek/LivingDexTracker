/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Kept as a static script so the same snapshot, artwork and navigation behavior can be imported
// by Workbox's generateSW output too.
self.importScripts('/offline-worker.js');

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// self.__WB_MANIFEST is default injection point
// Handle the case where __WB_MANIFEST might be undefined in development
const manifest = self.__WB_MANIFEST || [];
if (Array.isArray(manifest)) {
	precacheAndRoute(manifest);
}

cleanupOutdatedCaches();
