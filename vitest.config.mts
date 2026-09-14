import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			'$env/dynamic/private': fileURLToPath(new URL('./tests/support/envStub.ts', import.meta.url))
		}
	},
	test: {
		allowOnly: false,
		include: ['tests/unit/**/*.test.ts', 'tests/data/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary', 'html'],
			reportsDirectory: 'coverage',
			// The whole library surface is measured, so anything new and untested drags the
			// numbers down instead of being invisible to the gate. Excluded here: type-only
			// models, and the store/action modules that only run in a browser.
			include: ['src/lib/**/*.ts'],
			exclude: ['src/lib/models/**', 'src/lib/stores/**', 'src/lib/actions/**'],
			// Set to the measured baseline. Ratchet these up as coverage grows; never down.
			thresholds: {
				statements: 34.58,
				functions: 73.68,
				lines: 34.58,
				branches: 79.79
			}
		}
	}
});
