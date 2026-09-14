// Lighthouse CI: `npm run test:lighthouse` builds the Node adapter output, serves it and audits the
// public pages. Any category below 90 fails the run (and so the PR).
// Set LIGHTHOUSE_FORM_FACTOR=desktop to audit with the desktop profile; the default is Lighthouse's
// mobile profile (slow 4G + CPU throttling), which is the stricter of the two. The variable must not
// start with LHCI_: lhci treats those as CLI flags, so LHCI_PRESET was passed to `lhci assert` as
// an invalid `--preset`.
const preset = process.env.LIGHTHOUSE_FORM_FACTOR === 'desktop' ? 'desktop' : undefined;

module.exports = {
	ci: {
		collect: {
			startServerCommand: 'npm run preview-node',
			startServerReadyPattern: 'Listening on',
			url: [
				'http://localhost:4173/',
				'http://localhost:4173/signin',
				'http://localhost:4173/welcome',
				'http://localhost:4173/offline-guide',
				'http://localhost:4173/forgot-password'
			],
			// Median of three runs smooths out noise from shared CI runners.
			numberOfRuns: 3,
			settings: {
				...(preset ? { preset } : {}),
				chromeFlags: '--no-sandbox --headless=new'
			}
		},
		assert: {
			assertions: {
				'categories:performance': ['error', { minScore: 0.9 }],
				'categories:accessibility': ['error', { minScore: 0.9 }],
				'categories:best-practices': ['error', { minScore: 0.9 }],
				'categories:seo': ['error', { minScore: 0.9 }],
				// The app compresses its own responses (see src/lib/server/compression.ts and the
				// precompressed build), so nothing may be served uncompressed.
				'uses-text-compression': ['error', { minScore: 1 }],
				// Regression budgets, set a little above what every audited page measured in September
				// 2026 (mobile profile: LCP 1.4-2.6 s, TBT 0 ms, CLS 0, ~100 KB script, ~14 KB CSS and
				// ~175 KB in total over the wire). A PR that makes pages meaningfully slower or heavier
				// fails here even while the category scores stay above 90. When a change legitimately
				// needs more, raise the number in the same PR so the cost is reviewed.
				'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
				'total-blocking-time': ['error', { maxNumericValue: 200 }],
				'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
				'resource-summary:script:size': ['error', { maxNumericValue: 115 * 1024 }],
				'resource-summary:stylesheet:size': ['error', { maxNumericValue: 20 * 1024 }],
				'resource-summary:total:size': ['error', { maxNumericValue: 220 * 1024 }]
			}
		},
		upload: {
			target: 'filesystem',
			outputDir: '.lighthouseci/reports'
		}
	}
};
