import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { createDexThroughUi, firstPokemon, openFirstPokemon } from '../support/app';

const { Given, When, Then } = createBdd(test);
const MOCK_URL = process.env.MOCK_PROVIDER_URL ?? 'http://127.0.0.1:4199';
const SUPABASE_URL = process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321';

type Provider = 'google_drive' | 'dropbox';

async function seedIntegration(
	state: import('../fixtures').ScenarioState,
	provider: Provider,
	overrides: Record<string, unknown> = {}
) {
	const key = process.env.E2E_SERVICE_ROLE_KEY;
	if (!key || !state.userId)
		throw new Error('A confirmed user and E2E_SERVICE_ROLE_KEY are required');
	const response = await fetch(`${SUPABASE_URL}/rest/v1/pokedex_export_integrations`, {
		method: 'POST',
		headers: {
			apikey: key,
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			Prefer: 'resolution=merge-duplicates,return=representation'
		},
		body: JSON.stringify({
			userId: state.userId,
			pokedexId: null,
			provider,
			enabled: true,
			accessToken: 'mock-access-token',
			refreshToken: 'mock-refresh-token',
			accessTokenExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
			...overrides
		})
	});
	if (!response.ok) throw new Error(await response.text());
}

async function ensureExportDex(
	page: import('@playwright/test').Page,
	state: import('../fixtures').ScenarioState
) {
	if (!state.pokedexId) {
		await createDexThroughUi(page, state, {
			name: state.pokedexName ?? `Export ${Date.now()}`,
			type: 'Living Dex'
		});
	}
}

Given('Google Drive is connected to the mocked provider', async ({ state }) => {
	await seedIntegration(state, 'google_drive');
});

Given('Dropbox is connected with an expired token', async ({ page, state }) => {
	await seedIntegration(state, 'dropbox', {
		accessTokenExpiresAt: new Date(Date.now() - 60_000).toISOString()
	});
	await ensureExportDex(page, state);
});

Given('Google Drive is connected to a failing mocked provider', async ({ page, state }) => {
	await seedIntegration(state, 'google_drive');
	await fetch(`${MOCK_URL}/__mock/fail-uploads`);
	await ensureExportDex(page, state);
});

When('I visit backup settings', async ({ page }) => {
	await page.goto('/backup-settings');
});

When('I connect the mocked {string} provider', async ({ page }, provider: string) => {
	await fetch(`${MOCK_URL}/__mock/reset`);
	await page.goto('/backup-settings');
	const card = page.locator('.card, .border').filter({ hasText: provider }).last();
	await card.getByRole('button', { name: 'Connect' }).click();
	await page.waitForURL(/\/backup-settings\?export=.*-connected/);
});

When('a mocked OAuth callback has an invalid state', async ({ page, state }) => {
	const response = await page.request.get(
		'/api/integrations/google-drive/callback?code=mock&state=invalid-state'
	);
	state.lastResponseStatus = response.status();
});

When('I save a catch note containing a comma and quote', async ({ page, state }) => {
	await ensureExportDex(page, state);
	await page.goto(`/pokedex/${state.pokedexId}`);
	await openFirstPokemon(page);
	await page.getByRole('dialog').getByLabel('Notes:').fill('A comma, and a "quote"');
	await page.getByRole('dialog').getByLabel('Notes:').blur();
	await expect(page.getByText(/Saving…/)).toHaveCount(0, { timeout: 15_000 });
});

When('an export is requested', async ({ page, state }) => {
	const response = await page.request.post(`/api/pokedexes/${state.pokedexId}/export`);
	state.lastResponseStatus = response.status();
});

When('I update collection progress', async ({ page, state }) => {
	await page.goto(`/pokedex/${state.pokedexId}`);
	await openFirstPokemon(page);
	await page
		.getByRole('dialog')
		.getByText('Caught:', { exact: true })
		.locator('..')
		.getByRole('checkbox')
		.check();
	await expect(page.getByText(/Saving…/)).toHaveCount(0, { timeout: 15_000 });
});

Then('Google Drive and Dropbox are shown as not connected', async ({ page }) => {
	await expect(page.getByText('Not Connected', { exact: true })).toHaveCount(2);
});

Then('{string} is shown as connected', async ({ page }, provider: string) => {
	const card = page.locator('.border').filter({ hasText: provider });
	await expect(card.getByText('Connected', { exact: true })).toBeVisible();
});

Then('the backup connection is rejected', async ({ state }) => {
	expect(state.lastResponseStatus).toBe(400);
});

Then('the mocked provider receives a valid escaped CSV', async () => {
	const response = await fetch(`${MOCK_URL}/__mock/state`);
	const mock = (await response.json()) as { requests: Array<{ path: string; body: string }> };
	const upload = mock.requests.find((request) => request.path.includes('upload'));
	expect(upload?.body).toContain('"A comma, and a ""quote"""');
});

Then('the catch update remains saved', async ({ page, state }) => {
	await page.goto(`/pokedex/${state.pokedexId}`);
	await expect(firstPokemon(page)).toBeVisible();
	await openFirstPokemon(page);
	const dialog = page.getByRole('dialog');
	const caught = dialog.getByText('Caught:', { exact: true }).locator('..').getByRole('checkbox');
	const notes = dialog.getByLabel('Notes:');
	expect((await caught.isChecked()) || (await notes.inputValue()).includes('comma')).toBe(true);
});

Then('the token is refreshed before the mocked upload', async ({ state }) => {
	expect(state.lastResponseStatus).toBe(200);
	const response = await fetch(`${MOCK_URL}/__mock/state`);
	const mock = (await response.json()) as { refreshes: number; requests: Array<{ path: string }> };
	expect(mock.refreshes).toBeGreaterThan(0);
	expect(mock.requests.some((request) => request.path.includes('upload'))).toBe(true);
});

Then('the provider failure is shown in backup settings', async ({ page }) => {
	await page.goto('/backup-settings');
	await expect(page.getByText(/mock upload failure/)).toBeVisible();
});
