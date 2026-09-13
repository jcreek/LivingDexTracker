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
		include: ['tests/unit/**/*.test.ts', 'tests/data/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary', 'html'],
			reportsDirectory: 'coverage',
			include: [
				'src/lib/utils/boxPlacement.ts',
				'src/lib/utils/catchRecordWriteQueue.ts',
				'src/lib/utils/oauthState.ts',
				'src/lib/utils/regionalDexMapping.ts',
				'src/lib/services/PokedexExportFormatting.ts'
			],
			thresholds: {
				perFile: true,
				statements: 90,
				functions: 90,
				lines: 90,
				branches: 80
			}
		}
	}
});
