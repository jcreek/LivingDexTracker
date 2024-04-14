import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
// you don't need to do this if you're using generateSW strategy in your app
import { generateSW } from './pwa.mjs';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'development',
			// you don't need to do this if you're using generateSW strategy in your app
			strategies: generateSW ? 'generateSW' : 'injectManifest',
			// you don't need to do this if you're using generateSW strategy in your app
			filename: generateSW ? undefined : 'prompt-sw.ts',
			scope: '/',
			base: '/',
			selfDestroying: process.env.SELF_DESTROYING_SW === 'true',
			pwaAssets: {
				config: true
			},
			manifest: {
				name: 'Living Dex Tracker',
				short_name: 'Living Dex Tracker',
				description:
					'A tool to enable you to track your progress in completing the living Pokédex in Pokémon games.',
				icons: [
					{
						src: '/android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				],
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#f00000',
				background_color: '#f0f0f0'
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}']
			},
			devOptions: {
				enabled: false,
				suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
				type: 'module',
				navigateFallback: '/'
			},
			// if you have shared info in svelte config file put in a separate module and use it also here
			kit: {
				includeVersionFile: true
			}
		})
	]
});
