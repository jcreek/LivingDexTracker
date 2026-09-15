import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

// Configuration holds session-file paths, never passwords. Keep it outside the repository.
const [configPath, outputPath] = process.argv.slice(2);
if (!configPath || !outputPath)
	throw new Error('Usage: node scripts/performance/benchmark.mjs CONFIG.json RESULTS.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const samples = config.samples ?? 30;
if (samples < 30)
	throw new Error('Host decisions require at least 30 warm samples per fixture/navigation');
if (!config.revision || !config.databaseLabel || !config.clientLocation)
	throw new Error('Record revision, databaseLabel and clientLocation for comparable results');
const browser = await chromium.launch();
const results = [];
try {
	for (const host of config.hosts) {
		for (const fixture of host.fixtures) {
			for (const navigation of ['direct', 'client']) {
				const context = await browser.newContext({
					baseURL: host.url,
					storageState: host.storageState,
					viewport: { width: 1350, height: 940 },
					deviceScaleFactor: 1
				});
				await context.addInitScript(() => {
					window.__perfShifts = [];
					new PerformanceObserver((list) => {
						for (const entry of list.getEntries())
							if (!entry.hadRecentInput)
								window.__perfShifts.push({ value: entry.value, time: entry.startTime });
					}).observe({ type: 'layout-shift', buffered: true });
					window.__watchGrid = () => {
						window.__perfVisible = null;
						function check() {
							const cell = document.querySelector('[data-entry-index]');
							if (
								location.pathname.startsWith('/pokedex/') &&
								cell &&
								cell.getBoundingClientRect().top < innerHeight &&
								cell.getBoundingClientRect().height > 0
							) {
								window.__perfVisible = performance.now();
								performance.mark('pokedex:first-visible');
							} else requestAnimationFrame(check);
						}
						requestAnimationFrame(check);
					};
					window.__watchGrid();
				});
				const page = await context.newPage();
				for (let index = 0; index <= samples; index++) {
					if (navigation === 'client') {
						await page.goto('/my-pokedexes');
						await page.getByText(fixture.name, { exact: true }).first().waitFor();
					} else if (index > 0) await page.goto('about:blank');
					const bodies = [];
					const requests = { grid: 0, details: 0, snapshot: 0, backup: 0 };
					const onRequest = (request) => {
						const path = new URL(request.url()).pathname;
						if (/\/pokedexes\/[^/]+\/(grid|combined-data)$/.test(path)) requests.grid++;
						if (/\/pokedexes\/[^/]+\/entries\//.test(path)) requests.details++;
						if (path === '/api/offline-snapshot') requests.snapshot++;
						if (path === '/api/export-integrations') requests.backup++;
					};
					const onResponse = (response) => {
						const path = new URL(response.url()).pathname;
						if (!path.startsWith(`/pokedex/${fixture.id}`)) return;
						bodies.push(
							(async () => {
								// Chromium may not expose bodies routed through a service worker.
								const body = await response.body().catch(() => null);
								return {
									url: response.url(),
									bytes: body?.length ?? null,
									status: response.status(),
									fromServiceWorker: response.fromServiceWorker(),
									timings: response.request().timing(),
									serverTiming: response.headers()['server-timing'] ?? null
								};
							})()
						);
					};
					page.on('request', onRequest);
					page.on('response', onResponse);
					let started = 0;
					if (navigation === 'direct')
						await page.goto(`/pokedex/${fixture.id}`, { waitUntil: 'domcontentloaded' });
					else {
						started = await page.evaluate(() => {
							performance.clearMarks('pokedex:first-interactive');
							window.__watchGrid();
							return performance.now();
						});
						await page
							.locator('.card')
							.filter({ hasText: fixture.name })
							.first()
							.getByRole('button', { name: 'View', exact: true })
							.click();
					}
					await page.waitForSelector('[data-grid-interactive]');
					await page.waitForFunction(
						() =>
							window.__perfVisible !== null &&
							performance.getEntriesByName('pokedex:first-interactive').length > 0
					);
					await page.waitForTimeout(1500);
					const browserData = await page.evaluate(
						(start) => ({
							visibleMs: window.__perfVisible - start,
							interactiveMs:
								performance.getEntriesByName('pokedex:first-interactive').at(-1).startTime - start,
							cells: document.querySelectorAll('[data-entry-index]').length,
							dom: document.querySelectorAll('*').length,
							cls: window.__perfShifts
								.filter((entry) => entry.time >= start)
								.reduce((total, entry) => total + entry.value, 0)
						}),
						started
					);
					page.off('request', onRequest);
					page.off('response', onResponse);
					const resources = await page.evaluate(() =>
						performance.getEntriesByType('resource').map((entry) => ({
							url: entry.name,
							decodedBytes: entry.decodedBodySize,
							encodedBytes: entry.encodedBodySize,
							transferBytes: entry.transferSize
						}))
					);
					const responses = (await Promise.all(bodies)).map(({ url, ...response }) => {
						const resource = resources.findLast((entry) => entry.url === url);
						return {
							...response,
							bytes: response.bytes ?? (resource?.decodedBytes || null),
							byteSource: response.bytes !== null ? 'response-body' : 'resource-timing',
							encodedBytes: resource?.encodedBytes ?? null,
							transferBytes: resource?.transferBytes ?? null
						};
					});
					results.push({
						host: host.label,
						fixture: fixture.label,
						navigation,
						run: index === 0 ? 'first-observed' : 'warm',
						...browserData,
						requests,
						responses
					});
				}
				await context.close();
				console.log(
					`Completed ${host.label}/${fixture.label}/${navigation}: ${samples} warm samples.`
				);
			}
		}
	}
	await writeFile(
		outputPath,
		JSON.stringify(
			{
				version: 1,
				capturedAt: new Date().toISOString(),
				revision: config.revision,
				databaseLabel: config.databaseLabel,
				clientLocation: config.clientLocation,
				environment: config.environment ?? 'deployed',
				compatibilityPassed: config.compatibilityPassed ?? false,
				results
			},
			null,
			2
		)
	);
	console.log(
		`Recorded ${results.length} samples; first-observed runs are excluded from warm statistics.`
	);
} finally {
	await browser.close();
}
