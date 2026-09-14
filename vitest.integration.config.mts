import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		allowOnly: false,
		include: ['tests/integration/**/*.test.ts'],
		testTimeout: 30_000,
		hookTimeout: 30_000,
		sequence: { concurrent: false }
	}
});
