import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	server: {
		host: '0.0.0.0', // Bind to all interfaces for testing
		port: 5173
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'production',
			strategies: 'generateSW',
			scope: '/',
			base: '/',
			selfDestroying: process.env.SELF_DESTROYING_SW === 'true',
			pwaAssets: {
				config: true
			},
			manifest: {
				name: 'Living Dex Tracker',
				short_name: 'Living Dex Tracker',
				description: 'Track your complete Pokémon collection across multiple games and regions',
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
				theme_color: '#ee1515',
				background_color: '#f0f0f0',
				categories: ['games', 'utilities'],
				lang: 'en',
				orientation: 'portrait-primary'
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}'],
				runtimeCaching: [
					{
						// Cache Pokémon sprites
						urlPattern: /^\/sprites\/.*\.png$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'pokemon-sprites',
							expiration: {
								maxEntries: 2000,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					},
					{
						// Cache API responses
						urlPattern: /^\/api\/.*/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 10 // 10 minutes
							}
						}
					}
				]
			},
			devOptions: {
				enabled: false,
				suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
				type: 'module',
				navigateFallback: '/'
			},
			kit: {
				includeVersionFile: true
			}
		})
	]
});
