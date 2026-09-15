import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const directory = process.env.PERF_FIXTURE_DIR ?? '/tmp/livingdex-grid-performance';
const fixture = JSON.parse(await readFile(`${directory}/fixture.json`, 'utf8'));
const baseURL = process.env.PERF_BASE_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
	baseURL,
	storageState: `${directory}/storage-state.json`,
	viewport: { width: 1350, height: 940 }
});
await context.addInitScript(() => {
	window.__layoutShifts = [];
	window.__firstVisible = null;
	new PerformanceObserver((list) => {
		for (const entry of list.getEntries())
			if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value);
	}).observe({ type: 'layout-shift', buffered: true });
	function visible() {
		const cell = document.querySelector('[data-entry-index]');
		if (
			cell &&
			cell.getBoundingClientRect().height > 0 &&
			cell.getBoundingClientRect().top < innerHeight
		)
			window.__firstVisible ??= performance.now();
		if (window.__firstVisible === null) requestAnimationFrame(visible);
	}
	requestAnimationFrame(visible);
});
const page = await context.newPage();
const readJson = (path) =>
	page.evaluate(async (path) => {
		const response = await fetch(path);
		if (!response.ok) throw new Error(`Fixture API failed: ${response.status}`);
		return response.json();
	}, path);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const requests = [];
page.on('request', (request) => requests.push(new URL(request.url()).pathname));
const results = [];
try {
	for (const dex of fixture.dexes) {
		requests.length = 0;
		const response = await page.goto(`/pokedex/${dex.id}`);
		assert.equal(response.status(), 200);
		const html = await response.text();
		assert.ok(/data-entry-index=["']?0["'\s>]/.test(html), 'Initial cells must be server rendered');
		await page.waitForSelector('[data-grid-interactive]');
		await page.waitForTimeout(1000);
		const stats = await page.evaluate(() => ({
			cells: document.querySelectorAll('[data-entry-index]').length,
			dom: document.querySelectorAll('*').length,
			cls: window.__layoutShifts.reduce((sum, value) => sum + value, 0),
			firstVisible: window.__firstVisible,
			interactive: performance.getEntriesByName('pokedex:first-interactive').at(-1)?.startTime
		}));
		assert.ok(stats.cells <= 180, `Mounted cells: ${stats.cells}`);
		assert.ok(stats.dom < 2500, `DOM elements: ${stats.dom}`);
		assert.ok(stats.cls <= 0.1, `CLS: ${stats.cls}`);
		assert.equal(
			requests.filter((path) => /\/api\/pokedexes\/[^/]+\/(grid|combined-data)$/.test(path)).length,
			0
		);
		assert.equal(await page.locator('button button').count(), 0);
		await page.screenshot({ path: `${directory}/${dex.gameScope ? 'scoped' : 'national'}.png` });
		const first = page.locator('[data-entry-index="0"]');
		const entryId = await first.getAttribute('data-entry-id');
		const notes = await readJson(`/api/pokedexes/${dex.id}/entries/${entryId}`);
		await first.click();
		const modal = page.getByRole('dialog', { name: 'Pokémon details' });
		await modal.getByLabel('Notes:', { exact: true }).waitFor();
		assert.equal(
			await modal.getByLabel('Notes:', { exact: true }).inputValue(),
			notes.catchRecord.personalNotes
		);
		const image = modal.locator('img').first();
		await image.waitFor();
		await page.waitForFunction(
			() => document.querySelector('[role="dialog"] img')?.naturalWidth > 0
		);
		assert.equal(await image.evaluate((node) => node.naturalWidth), 512);
		assert.ok(!(await image.getAttribute('src')).includes('sprites-grid'));
		await modal.getByRole('button', { name: 'Close', exact: true }).click();
		assert.equal(await first.evaluate((node) => document.activeElement === node), true);
		// Reopening uses cached details; bulk edits must retain the unloaded personal notes.
		const detailCalls = () =>
			requests.filter((path) => path.endsWith(`/entries/${entryId}`)).length;
		const before = detailCalls();
		await first.click();
		await modal.getByLabel('Notes:', { exact: true }).waitFor();
		assert.equal(detailCalls(), before);
		await modal.getByRole('button', { name: 'Close', exact: true }).click();
		await page.getByRole('button', { name: 'Open bulk actions menu' }).first().click();
		await page.getByRole('button', { name: 'Mark box as In HOME', exact: true }).click();
		await page.waitForResponse(
			(r) =>
				r.url().endsWith(`/pokedexes/${dex.id}/catch-records`) && r.request().method() === 'POST'
		);
		const after = await readJson(`/api/pokedexes/${dex.id}/entries/${entryId}`);
		assert.equal(after.catchRecord.personalNotes, notes.catchRecord.personalNotes);
		assert.equal(after.catchRecord.inHome, true);
		// Focus navigation must reach entries that were not initially mounted.
		await page.locator('[data-entry-index="29"]').focus();
		for (let index = 0; index < 22; index++) await page.keyboard.press('ArrowDown');
		assert.equal(
			await page.evaluate(() => document.activeElement?.getAttribute('data-entry-index')),
			'161'
		);
		await page.getByLabel('Render all boxes').check();
		const grid = await readJson(`/api/pokedexes/${dex.id}/grid`);
		assert.equal(await page.locator('[data-entry-index]').count(), grid.grid.length);
		await page.getByLabel('Render all boxes').uncheck();
		results.push({
			fixture: dex.gameScope ? 'scoped-forms' : 'national',
			...stats,
			documentBytes: Buffer.byteLength(html),
			gridBytes: Buffer.byteLength(JSON.stringify(grid))
		});
	}
	assert.deepEqual(errors, [], 'Browser errors');
	await writeFile(`${directory}/verification.json`, JSON.stringify(results, null, 2));
	console.log(JSON.stringify(results, null, 2));
} finally {
	await browser.close();
}
