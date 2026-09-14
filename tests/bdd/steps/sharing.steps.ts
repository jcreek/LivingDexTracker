import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';

const { When, Then } = createBdd(test);

When('I open the Pokédex share dialog', async ({ page, state }) => {
	const detailsDialog = page.getByRole('dialog').filter({ hasText: 'Notes:' });
	if (await detailsDialog.count()) {
		await detailsDialog.getByRole('button', { name: 'Close', exact: true }).click();
	}
	await page.getByRole('button', { name: 'Share', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: /Share Public Journey/ });
	await expect(dialog).toBeVisible();
	state.shareUrl = await dialog.getByLabel('Read-only link').inputValue();
});

Then('I receive an unguessable read-only link', async ({ state }) => {
	expect(state.shareUrl).toMatch(
		/^https?:\/\/[^/]+\/shared\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
	);
});

When('I visit the shared link while signed out', async ({ page, context, state }) => {
	if (!state.shareUrl) throw new Error('A share URL is required');
	await context.clearCookies();
	await page.goto(state.shareUrl);
});

Then('I can browse the shared Pokédex without editing it', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'Public Journey' })).toBeVisible();
	await expect(page.getByText('Read-only shared Pokédex')).toBeVisible();
	await expect(page.getByLabel('Choose box view layout density')).toBeVisible();
	await expect(page.getByText('Filters:', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Open bulk actions menu' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: /Create Pokédex data/ })).toHaveCount(0);
	await expect(page.getByText('Personal notes')).toHaveCount(0);
});

Then('the shared page does not expose the private note', async ({ page }) => {
	await expect(page.getByText('share-secret-note')).toHaveCount(0);
});

Then('the shared page advertises a social progress image', async ({ page }) => {
	const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
	const image = await page.locator('meta[property="og:image"]').getAttribute('content');
	expect(canonical).toBe(page.url());
	expect(image).toBe(`${page.url()}/preview.png`);
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
		'content',
		'summary_large_image'
	);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
	await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
});

Then('the social progress image is a PNG', async ({ page }) => {
	const image = await page.locator('meta[property="og:image"]').getAttribute('content');
	if (!image) throw new Error('Open Graph image URL is required');
	const response = await page.request.get(image);
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toBe('image/png');
	expect(response.headers()['cache-control']).toContain('max-age=300');
	const body = await response.body();
	expect([...body.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});
