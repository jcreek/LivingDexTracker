import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = process.env.PERF_FIXTURE_DIR ?? '/tmp/livingdex-grid-performance';
const fixture = JSON.parse(await readFile(`${dir}/fixture.json`, 'utf8'));
const browser = await chromium.launch();
const context = await browser.newContext({
	baseURL: process.env.PERF_BASE_URL ?? 'http://127.0.0.1:4173',
	storageState: `${dir}/storage-state.json`,
	viewport: { width: 1350, height: 940 }
});
await context.addInitScript(() => {
	window.__cls = 0;
	new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
	}).observe({ type: 'layout-shift', buffered: true });
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const national = fixture.dexes.find((dex) => !dex.gameScope);
const scoped = fixture.dexes.find((dex) => dex.gameScope);
const results = [];
try {
	await page.goto(`/pokedex/${national.id}`);
	await page.waitForSelector('[data-grid-interactive]');
	for (const width of [1350, 390]) {
		await page.setViewportSize({ width, height: 940 });
		for (const density of ['comfortable', 'compact', 'ultra']) {
			await page.getByLabel('Choose box view layout density').selectOption(density);
			await page.reload();
			await page.waitForSelector('[data-grid-interactive]');
			await page.waitForTimeout(350);
			assert.equal(await page.getByLabel('Choose box view layout density').inputValue(), density);
			const geometry = await page.evaluate(() => {
				const cell = document.querySelector('[data-entry-index="0"]').getBoundingClientRect();
				const shell = document.querySelector('[data-box-number="1"]').getBoundingClientRect();
				return {
					cellWidth: cell.width,
					cellHeight: cell.height,
					cls: window.__cls,
					horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
					shellHeight: shell.height
				};
			});
			assert.ok(Math.abs(geometry.cellWidth - geometry.cellHeight) < 1, JSON.stringify(geometry));
			assert.ok(!geometry.horizontalOverflow, `Horizontal overflow at ${width}/${density}`);
			assert.ok(geometry.cls <= 0.1, `CLS ${geometry.cls} at ${width}/${density}`);
			results.push({ width, density, ...geometry });
		}
	}
	await page.setViewportSize({ width: 1350, height: 940 });
	await page.getByLabel('Choose box view layout density').selectOption('comfortable');
	await page.getByLabel('Not caught', { exact: true }).check();
	assert.equal(await page.locator('[data-entry-index="0"]').getAttribute('aria-disabled'), 'true');
	assert.equal(await page.locator('[data-entry-index="0"]').getAttribute('data-entry-id'), '1');
	await page.getByLabel('Not caught', { exact: true }).uncheck();
	// Resizing across the mobile breakpoint keeps the same box at the scroll anchor.
	await page.locator('[data-box-number="15"]').evaluate((node) => node.scrollIntoView());
	await page.waitForTimeout(100);
	const anchorTop = await page
		.locator('[data-box-number="15"]')
		.evaluate((node) => node.getBoundingClientRect().top);
	await page.setViewportSize({ width: 390, height: 940 });
	await page.waitForTimeout(200);
	const resizedTop = await page
		.locator('[data-box-number="15"]')
		.evaluate((node) => node.getBoundingClientRect().top);
	assert.ok(
		Math.abs(anchorTop - resizedTop) < 2,
		`Scroll anchor moved: ${anchorTop} to ${resizedTop}`
	);
	await page.setViewportSize({ width: 1350, height: 940 });
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.waitForSelector('[data-entry-index="1024"]');
	assert.ok((await page.locator('[data-entry-index]').count()) < 300);
	await page.locator('[data-entry-index="1024"]').focus();
	await page.keyboard.press('ArrowRight');
	assert.equal(
		await page.evaluate(() => document.activeElement.getAttribute('data-entry-index')),
		'1024'
	);
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForSelector('[data-entry-index="0"]');
	// Closing an in-flight modal must prevent its response from replacing the next selection.
	let release;
	const held = new Promise((resolve) => {
		release = resolve;
	});
	await page.route(`**/api/pokedexes/${national.id}/entries/1`, async (route) => {
		await held;
		await route.continue().catch(() => {});
	});
	await page.locator('[data-entry-index="0"]').click();
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await page.locator('[data-entry-index="1"]').click();
	release();
	await page.getByRole('dialog').getByLabel('Notes:', { exact: true }).waitFor();
	assert.equal(
		await page.getByRole('dialog').getByRole('heading', { name: 'Ivysaur', exact: true }).count(),
		1
	);
	assert.equal(
		await page.getByRole('dialog').getByRole('heading', { name: 'Bulbasaur', exact: true }).count(),
		0
	);
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await page.unrouteAll({ behavior: 'wait' });
	// Navigate through actual list cards, preserving fixture-specific totals and positions.
	await page.getByRole('link', { name: 'My Pokédexes' }).click();
	await page
		.locator('.card')
		.filter({ hasText: scoped.name })
		.first()
		.getByRole('button', { name: 'View', exact: true })
		.click();
	await page.waitForSelector('[data-grid-interactive]');
	assert.ok((await page.locator('body').innerText()).includes('Showing 439 of 439'));
	await page.goBack();
	await page
		.locator('.card')
		.filter({ hasText: national.name })
		.first()
		.getByRole('button', { name: 'View', exact: true })
		.click();
	await page.waitForSelector('[data-grid-interactive]');
	// Wait for the existing worker's full snapshot, then read an uncached detail without a network.
	await page.waitForFunction(
		async () => {
			const meta = await (
				await caches.open('livingdex-offline-meta-v1')
			).match('/__offline/current');
			return !!(await meta?.json())?.dataCache;
		},
		{ timeout: 15000 }
	);
	await context.setOffline(true);
	await page.locator('[data-entry-index="5"]').click();
	await page.waitForFunction(() =>
		document.querySelector('[role="dialog"]')?.textContent.includes('Where to catch:')
	);
	assert.equal(await page.getByRole('dialog').locator('textarea').count(), 0);
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	// A mismatched cache owner is never used as fallback.
	await page.evaluate(async () => {
		const cache = await caches.open('livingdex-offline-meta-v1');
		const response = await cache.match('/__offline/current');
		const meta = await response.json();
		await cache.put(
			'/__offline/current',
			new Response(JSON.stringify({ ...meta, userId: 'other-account' }))
		);
	});
	await page.locator('[data-entry-index="6"]').click();
	await page.getByRole('alert').filter({ hasText: 'not saved for offline use' }).waitFor();
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	assert.deepEqual(errors, []);
	await writeFile(`${dir}/behavior.json`, JSON.stringify(results, null, 2));
	console.log(
		'Passed density/mobile geometry, filtered placement, virtual boundaries, modal races, client navigation and isolated offline details.'
	);
	console.log(JSON.stringify(results, null, 2));
} finally {
	await browser.close();
}
