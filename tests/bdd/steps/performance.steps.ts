import { createBdd } from 'playwright-bdd';
import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';

const { When, Then } = createBdd(test);

// Per-page scratch values; scenarios run one at a time (workers: 1).
type Timing = {
	entriesMs?: number;
	switchMs: number[];
	gridRequests: number;
	detailRequests: number;
	detailsPrimed: boolean;
};
const timings = new WeakMap<Page, Timing>();

function entriesVisible(page: Page) {
	return expect(page.getByRole('button', { name: /^View details for / }).first()).toBeVisible({
		timeout: 30_000
	});
}

When('I load the Pokédex page directly', async ({ page, state }) => {
	if (!state.pokedexId) throw new Error('A Pokédex must exist before it can be opened');
	const record: Timing = {
		switchMs: [],
		gridRequests: 0,
		detailRequests: 0,
		detailsPrimed: false
	};
	timings.set(page, record);
	// Only requests made while the page first loads matter; the page's 60s reconciliation refetch
	// can't fire within this window.
	const countGridRequests = (request: { url(): string }) => {
		if (/\/api\/pokedexes\/[^/]+\/grid/.test(request.url())) record.gridRequests++;
	};
	// The background detail read is deliberately allowed: it is what keeps cards from fetching
	// themselves one at a time. Remember when it lands so a later step can open a card.
	const notePrimedDetails = (response: { url(): string; status(): number }) => {
		if (/\/api\/pokedexes\/[^/]+\/combined-data/.test(response.url()) && response.status() === 200)
			record.detailsPrimed = true;
	};
	page.on('request', countGridRequests);
	page.on('response', notePrimedDetails);

	const started = Date.now();
	await page.goto(`/pokedex/${state.pokedexId}`);
	await entriesVisible(page);
	record.entriesMs = Date.now() - started;
	page.off('request', countGridRequests);
});

When('the Pokédex has finished loading its details in the background', async ({ page }) => {
	const record = timings.get(page);
	expect(record, 'the Pokédex page was never loaded').toBeDefined();
	await expect.poll(() => record!.detailsPrimed, { timeout: 30_000 }).toBe(true);
});

When('I open the first Pokémon', async ({ page }) => {
	const record = timings.get(page);
	expect(record, 'the Pokédex page was never loaded').toBeDefined();
	const countDetailRequests = (request: { url(): string }) => {
		if (/\/api\/pokedexes\/[^/]+\/entries\//.test(request.url())) record!.detailRequests++;
	};
	page.on('request', countDetailRequests);
	await page
		.getByRole('button', { name: /^View details for / })
		.first()
		.click();
	// "Where to catch" comes from the detail row, so it only renders once details are present.
	await expect(page.getByText('Where to catch:')).toBeVisible({ timeout: 10_000 });
	// Give any stray per-entry request time to be made before asserting none was.
	await page.waitForTimeout(500);
	page.off('request', countDetailRequests);
});

Then('its details were already in the browser', async ({ page }) => {
	await expect(page.getByRole('status')).toHaveCount(0);
	expect(timings.get(page)?.detailRequests).toBe(0);
});

Then('its entries appear within {int} seconds', async ({ page }, seconds: number) => {
	const entriesMs = timings.get(page)?.entriesMs;
	expect(entriesMs, 'entries never became visible').toBeDefined();
	expect(entriesMs!).toBeLessThan(seconds * 1000);
});

Then('the browser did not request the grid separately', async ({ page }) => {
	// The server load includes the compact grid with the HTML, so the page must not make
	// the old hydrate-then-fetch round trip.
	expect(timings.get(page)?.gridRequests).toBe(0);
});

When('I switch between my Pokédex list and the Pokédex', async ({ page, state }) => {
	if (!state.pokedexName) throw new Error('A Pokédex must exist before switching to it');
	const record: Timing = {
		switchMs: [],
		gridRequests: 0,
		detailRequests: 0,
		detailsPrimed: false
	};
	timings.set(page, record);
	await page.goto('/my-pokedexes');
	const card = page.locator('.card').filter({ hasText: state.pokedexName }).first();
	await expect(card).toBeVisible();

	for (let round = 0; round < 2; round++) {
		// List -> Pokédex: a client-side navigation through the card's View button.
		let started = Date.now();
		await card.getByRole('button', { name: 'View', exact: true }).click();
		await page.waitForURL('**/pokedex/**');
		await entriesVisible(page);
		record.switchMs.push(Date.now() - started);

		// Pokédex -> list: back navigation is also handled by the client router.
		started = Date.now();
		await page.goBack();
		await expect(card).toBeVisible();
		record.switchMs.push(Date.now() - started);
	}
});

Then('each switch finishes within {int} seconds', async ({ page }, seconds: number) => {
	const switchMs = timings.get(page)?.switchMs ?? [];
	expect(switchMs).toHaveLength(4);
	for (const ms of switchMs) expect(ms).toBeLessThan(seconds * 1000);
});
