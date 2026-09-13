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

When('I open the built application', async ({ page }) => {
	await page.goto('/');
	await waitForServiceWorker(page);
});

Given('I have opened the built application online', async ({ page }) => {
	await page.context().setOffline(false);
	await page.goto('/');
	await waitForServiceWorker(page);
	await page.reload();
});

When('I go offline and reload the home page', async ({ page }) => {
	await page.context().setOffline(true);
	await page.reload({ waitUntil: 'domcontentloaded' });
});

When('I go offline and navigate to the sign-in page', async ({ page }) => {
	await page.context().setOffline(true);
	// Client-side navigation, which only works if the route's chunks were precached.
	await page.getByRole('link', { name: 'Sign In' }).click();
	await expect(page).toHaveURL(/\/signin$/);
});

When('I go offline and then return online', async ({ page }) => {
	await page.context().setOffline(true);
	await page.reload({ waitUntil: 'domcontentloaded' });
	await page.context().setOffline(false);
	await page.reload({ waitUntil: 'domcontentloaded' });
});

Then('a service worker controls the page', async ({ page }) => {
	expect(await waitForServiceWorker(page)).toMatch(/\/(?:sw|prompt-sw)\.js$/);
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

	expect(urls, 'app shell is not precached').toContain('');
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

Then('the sign-in form is available offline', async ({ page }) => {
	await expect(page.getByLabel('Email')).toBeVisible();
	await expect(page.getByLabel('Password')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
