import 'vite-plugin-pwa/svelte';
import 'vite-plugin-pwa/info';
import 'vite-plugin-pwa/pwa-assets';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	const __DATE__: string;
	const __RELOAD_SW__: boolean;
	namespace App {
		// interface Error {}
		interface Locals {
			userid: string;
			buildDate: string;
			periodicUpdates: boolean;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
