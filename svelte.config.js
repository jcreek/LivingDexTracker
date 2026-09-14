import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// you don't need to do this if you're using generateSW strategy in your app
import { generateSW } from './pwa.mjs';
import { adapter } from './adapter.mjs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Netlify by default, or the node adapter when NODE_ADAPTER=true. See adapter.mjs.
		adapter,
		serviceWorker: {
			// VitePWA owns registration. Registering here as well requests SvelteKit's default
			// /service-worker.js even though the inject-manifest output is /prompt-sw.js.
			register: false
		},
		files: {
			// you don't need to do this if you're using generateSW strategy in your app
			serviceWorker: generateSW ? undefined : 'src/prompt-sw.ts'
		}
	}
};

export default config;
