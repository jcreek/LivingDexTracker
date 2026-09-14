import { createBdd } from 'playwright-bdd';
import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';

const { Given, When, Then } = createBdd(test);

async function waitForServiceWorker(page: Page) {
	return page.evaluate(async () => {
		if (!('serviceWorker' in navigator)) throw new Error('Service workers are not supported');
		const registration = await Promise.race([
			navigator.serviceWorker.ready,
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Service worker registration timed out')), 15_000)
			)
		]);
		return registration.active?.scriptURL ?? null;
	});
}

async function cacheContents(page: Page) {
	return page.evaluate(async () => {
		const contents: Record<string, string[]> = {};
		for (const name of await caches.keys()) {
			const cache = await caches.open(name);
			contents[name] = (await cache.keys()).map((request) => request.url);
		}
		return contents;
	});
}

function recordLegacyWorkerRequest(page: Page, state: { legacyServiceWorkerRequested: boolean }) {
	page.on('request', (request) => {
		if (new URL(request.url()).pathname === '/service-worker.js') {
			state.legacyServiceWorkerRequested = true;
		}
	});
}

When('I open the built application', async ({ page, state }) => {
	recordLegacyWorkerRequest(page, state);
	await page.goto('/');
	await waitForServiceWorker(page);
	if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
		await page.reload();
		await waitForServiceWorker(page);
	}
});

Given('I have opened the built application online', async ({ page, state }) => {
	recordLegacyWorkerRequest(page, state);
	await page.context().setOffline(false);
	await page.goto('/');
	await waitForServiceWorker(page);
	await page.reload();
});

When('I go offline and reload the home page', async ({ page }) => {
	await page.context().setOffline(true);
	await page.reload({ waitUntil: 'domcontentloaded' });
});

When('I go offline and reload the sign-in page', async ({ page }) => {
	await page.goto('/signin');
	await page.context().setOffline(true);
	await page.reload({ waitUntil: 'domcontentloaded' });
});

Given('my offline copy is synchronized', async ({ page, state }) => {
	await waitForServiceWorker(page);
	// A full Living Dex snapshot plus its artwork can take longer than the default poll window on CI.
	await expect
		.poll(
			() =>
				page.evaluate(async (userId) => {
					const meta = await (
						await caches.open('livingdex-offline-meta-v1')
					).match('/__offline/current');
					if (!meta) return false;
					const value = await meta.json();
					return value.userId === userId;
				}, state.userId),
			{ timeout: 30_000 }
		)
		.toBe(true);
	const serializedSnapshot = await page.evaluate(async () => {
		const metaResponse = await (
			await caches.open('livingdex-offline-meta-v1')
		).match('/__offline/current');
		if (!metaResponse) throw new Error('Offline snapshot metadata was not cached');
		const meta = await metaResponse.json();
		const snapshotResponse = await (
			await caches.open(meta.dataCache)
		).match(`/__offline/snapshot/${encodeURIComponent(meta.userId)}`);
		if (!snapshotResponse) throw new Error('Offline snapshot payload was not cached');
		return snapshotResponse.text();
	});
	expect(serializedSnapshot).not.toMatch(/access_token|refresh_token/i);
});

When('I go offline and reload the current Pokédex', async ({ page, state }) => {
	await page.context().setOffline(true);
	await page.goto(`/pokedex/${state.pokedexId}/offline`, {
		waitUntil: 'domcontentloaded'
	});
});

When('I open the offline guide', async ({ page }) => {
	await page.goto('/offline-guide');
});

When('I open the offline guide from the user menu', async ({ page }) => {
	await page.getByRole('button', { name: 'Account menu' }).click();
	await page.getByRole('link', { name: 'Using Offline' }).click();
	await page.waitForURL(/\/offline-guide$/);
});

// Client-side navigation keeps the sync status in memory, so the old layout would show it at once.
When('I return to my Pokédexes from the user menu', async ({ page }) => {
	await page.getByRole('button', { name: 'Account menu' }).click();
	await page.getByRole('link', { name: 'My Pokédexes' }).click();
	await page.waitForURL(/\/my-pokedexes$/);
});

When('I go offline and then return online', async ({ page }) => {
	await page.context().setOffline(true);
	await page.reload({ waitUntil: 'domcontentloaded' });
	await page.context().setOffline(false);
	await page.reload({ waitUntil: 'domcontentloaded' });
});

Then('a service worker controls the page', async ({ page }) => {
	await expect
		.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null))
		.toMatch(/\/(?:sw|prompt-sw)\.js$/);
	expect(
		await page.evaluate(() =>
			navigator.serviceWorker.getRegistrations().then((items) => items.length)
		)
	).toBe(1);
});

Then('no legacy service worker is requested', async ({ state }) => {
	expect(state.legacyServiceWorkerRequested).toBe(false);
});

/**
 * Replaces the deleted client-test/sw.spec.ts assertions. The precise entries differ by build
 * strategy, so this checks the contract that matters: one workbox precache, the app shell and
 * web manifest are in it, and `_app/immutable` assets are cached WITHOUT a revision query -
 * that last one is the `dontCacheBustURLsMatching` behaviour, and it silently regresses.
 */
Then('the application shell is precached', async ({ page }) => {
	const contents = await cacheContents(page);
	const names = Object.keys(contents).filter((name) => name.startsWith('workbox-precache'));
	expect(names).toHaveLength(1);

	const origin = new URL(page.url()).origin;
	const urls = contents[names[0]].map((url) => url.slice(`${origin}/`.length));

	expect(urls, 'personalized SSR root must not be precached').not.toContain('');
	expect(
		urls.some((url) => /^offline(?:\.html)?(?:\?__WB_REVISION__=|$)/.test(url)),
		'offline viewer is not precached'
	).toBe(true);
	expect(
		urls.some((url) => url.startsWith('manifest.webmanifest?__WB_REVISION__=')),
		'revisioned manifest.webmanifest is not precached'
	).toBe(true);
	expect(
		urls.some((url) => url.startsWith('_app/version.json?__WB_REVISION__=')),
		'revisioned _app/version.json is not precached'
	).toBe(true);

	const immutable = urls.filter((url) => url.startsWith('_app/immutable/'));
	expect(immutable.some((url) => url.endsWith('.css'))).toBe(true);
	expect(immutable.some((url) => url.endsWith('.js'))).toBe(true);
	expect(
		immutable.filter((url) => url.includes('__WB_REVISION__')),
		'immutable assets must not be cache-busted'
	).toEqual([]);
});

Then('the application remains available', async ({ page }) => {
	await expect(page.getByRole('heading', { name: /Start Your Pokédex Journey/ })).toBeVisible();
});

Then('the offline guide shows my offline copy status', async ({ page }) => {
	await expect(
		page.getByRole('heading', { name: 'Using Living Dex Tracker offline' })
	).toBeVisible();
	await expect(page.getByTestId('offline-copy-status')).toBeVisible();
});

Then('the offline guide shows when my offline copy was updated', async ({ page }) => {
	await expect(page.getByTestId('offline-copy-status')).toContainText(/Offline copy updated/, {
		timeout: 30_000
	});
});

Then('no offline sync status is shown', async ({ page }) => {
	await expect(page.getByRole('heading', { name: /My Pok/ }).first()).toBeVisible();
	await expect(
		page.getByText(/Offline copy updated|Updating offline copy|Save all artwork for offline/)
	).toHaveCount(0);
});

Then('the read-only offline viewer is available', async ({ page }) => {
	await expect(page.getByText(/offline.*read-only/i)).toBeVisible();
});

Then('the offline copy contains {string}', async ({ page }, name: string) => {
	await expect(page.getByRole('heading', { name })).toBeVisible();
	await expect(page.getByText(/read-only copy/i)).toBeVisible();
	await expect(page.locator('button, input, textarea, select')).toHaveCount(0);
});

Then('my offline copy is removed', async ({ page }) => {
	await expect
		.poll(() =>
			page.evaluate(async () => {
				const names = await caches.keys();
				return names.some((name) => name.startsWith('livingdex-offline-'));
			})
		)
		.toBe(false);
});

Then('my offline copy remains', async ({ page, state }) => {
	const owner = await page.evaluate(async () => {
		const meta = await (await caches.open('livingdex-offline-meta-v1')).match('/__offline/current');
		return meta ? (await meta.json()).userId : null;
	});
	expect(owner).toBe(state.userId);
});
