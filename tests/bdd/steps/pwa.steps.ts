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

When('I go offline and revisit the home page with a trailing slash', async ({ page }) => {
	await page.context().setOffline(true);
	await page.goto('/', { waitUntil: 'domcontentloaded' });
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

Then('the application cache is present', async ({ page }) => {
	const cacheNames = await page.evaluate(() => caches.keys());
	expect(cacheNames.length).toBeGreaterThan(0);
});

Then('the application remains available', async ({ page }) => {
	await expect(page.getByRole('heading', { name: /Start Your Pokédex Journey/ })).toBeVisible();
});
