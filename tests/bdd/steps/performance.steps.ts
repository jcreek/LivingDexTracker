import { createBdd } from 'playwright-bdd';
import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';

const { When, Then } = createBdd(test);

// Per-page scratch values; scenarios run one at a time (workers: 1).
const timings = new WeakMap<
	Page,
	{ entriesMs?: number; switchMs: number[]; entryRequests: number }
>();

function entriesVisible(page: Page) {
	return expect(page.getByRole('button', { name: /^View details for / }).first()).toBeVisible({
		timeout: 30_000
	});
}

When('I load the Pokédex page directly', async ({ page, state }) => {
	if (!state.pokedexId) throw new Error('A Pokédex must exist before it can be opened');
	const record = { switchMs: [], entryRequests: 0 };
	timings.set(page, record);
	// Only requests made while the page first loads matter; the page's 60s reconciliation refetch
	// can't fire within this window.
	const countEntryRequests = (request: { url(): string }) => {
		if (/\/api\/pokedexes\/[^/]+\/(?:grid|combined-data)/.test(request.url()))
			record.entryRequests++;
	};
	page.on('request', countEntryRequests);

	const started = Date.now();
	await page.goto(`/pokedex/${state.pokedexId}`);
	await entriesVisible(page);
	(record as { entriesMs?: number }).entriesMs = Date.now() - started;
	page.off('request', countEntryRequests);
});

Then('its entries appear within {int} seconds', async ({ page }, seconds: number) => {
	const entriesMs = timings.get(page)?.entriesMs;
	expect(entriesMs, 'entries never became visible').toBeDefined();
	expect(entriesMs!).toBeLessThan(seconds * 1000);
});

Then('the browser did not request the grid separately', async ({ page }) => {
	// The server load includes the compact grid with the HTML, so the page must not make
	// the old hydrate-then-fetch round trip.
	expect(timings.get(page)?.entryRequests).toBe(0);
});

When('I switch between my Pokédex list and the Pokédex', async ({ page, state }) => {
	if (!state.pokedexName) throw new Error('A Pokédex must exist before switching to it');
	const record = { switchMs: [] as number[], entryRequests: 0 };
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
