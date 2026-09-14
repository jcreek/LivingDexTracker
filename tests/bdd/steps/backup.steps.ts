import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { createDexThroughUi, firstPokemon, openFirstPokemon } from '../support/app';
import { requireLoopbackUrl } from '../../support/loopback';

const { Given, When, Then } = createBdd(test);
const MOCK_URL = process.env.MOCK_PROVIDER_URL ?? 'http://127.0.0.1:4199';
const SUPABASE_URL = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);

type Provider = 'google_drive' | 'dropbox';

// Outside CI Playwright reuses an already-running mock, which may predate a new control route.
// Fail loudly then, rather than letting the scenario run against the wrong mock behaviour.
async function mockControl(route: string) {
	const response = await fetch(`${MOCK_URL}/__mock/${route}`);
	if (!response.ok) {
		throw new Error(
			`Mock provider rejected /__mock/${route} (${response.status}). Stop any stale mock on port 4199 and rerun.`
		);
	}
}

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
	await mockControl('fail-uploads');
	await ensureExportDex(page, state);
});

const PROVIDERS: Record<string, Provider> = { 'Google Drive': 'google_drive', Dropbox: 'dropbox' };

function providerFor(label: string): Provider {
	const provider = PROVIDERS[label];
	if (!provider) throw new Error(`Unknown backup provider "${label}"`);
	return provider;
}

Given(
	'{string} is connected with a revoked refresh token',
	async ({ page, state }, label: string) => {
		await seedIntegration(state, providerFor(label), {
			accessTokenExpiresAt: new Date(Date.now() - 60_000).toISOString()
		});
		await mockControl('revoke-refresh');
		await ensureExportDex(page, state);
	}
);

Given('{string} previously lost access', async ({ state }, label: string) => {
	await seedIntegration(state, providerFor(label), {
		enabled: false,
		lastError: `${label} access has expired or was revoked. Reconnect ${label} to resume backups.`
	});
});

When('I visit backup settings', async ({ page }) => {
	await page.goto('/backup-settings');
});

When('I connect the mocked {string} provider', async ({ page }, provider: string) => {
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

async function mockState() {
	const response = await fetch(`${MOCK_URL}/__mock/state`);
	if (!response.ok) throw new Error(`Mock provider is unavailable: ${response.status}`);
	return (await response.json()) as {
		refreshes: number;
		requests: Array<{ method: string; path: string; body: string }>;
	};
}

Then('the mocked provider receives a valid escaped CSV', async () => {
	const { requests } = await mockState();
	const upload = requests.find((request) => request.path.includes('upload'));
	expect(upload, 'no upload reached the mock provider').toBeDefined();
	expect(upload!.body).toContain('"A comma, and a ""quote"""');
});

Then('the note survives a reload', async ({ page, state }) => {
	await page.goto(`/pokedex/${state.pokedexId}`);
	await expect(firstPokemon(page)).toBeVisible();
	await openFirstPokemon(page);
	await expect(page.getByRole('dialog').getByLabel('Notes:')).toHaveValue('A comma, and a "quote"');
});

Then('the catch remains marked caught', async ({ page, state }) => {
	await page.goto(`/pokedex/${state.pokedexId}`);
	await expect(firstPokemon(page)).toBeVisible();
	await openFirstPokemon(page);
	const caught = page
		.getByRole('dialog')
		.getByText('Caught:', { exact: true })
		.locator('..')
		.getByRole('checkbox');
	await expect(caught).toBeChecked();
});

Then('the token is refreshed before the mocked upload', async ({ state }) => {
	expect(state.lastResponseStatus).toBe(200);
	const { refreshes, requests } = await mockState();
	// Exactly one refresh, and it has to come before the upload it was needed for - a global
	// ">= 1" would be satisfied by any earlier scenario's traffic.
	expect(refreshes).toBe(1);
	const refreshIndex = requests.findIndex(
		(request) =>
			request.path.endsWith('/token') && request.body.includes('grant_type=refresh_token')
	);
	const uploadIndex = requests.findIndex((request) => request.path.includes('upload'));
	expect(refreshIndex).toBeGreaterThanOrEqual(0);
	expect(uploadIndex).toBeGreaterThan(refreshIndex);
});

Then('the provider failure is shown in backup settings', async ({ page }) => {
	await page.goto('/backup-settings');
	await expect(page.getByText(/mock upload failure/)).toBeVisible();
});

Then('the Pokédex page tells me to reconnect {string}', async ({ page }, label: string) => {
	const toast = page.getByTestId('backup-reconnect-toast');
	await expect(toast).toBeVisible({ timeout: 15_000 });
	await expect(toast).toContainText(label);
	await expect(toast.getByRole('link', { name: 'Reconnect' })).toHaveAttribute(
		'href',
		'/backup-settings'
	);
});

Then('I can dismiss the reconnect alert', async ({ page }) => {
	await page.getByTestId('backup-reconnect-toast').getByRole('button', { name: 'Dismiss' }).click();
	await expect(page.getByTestId('backup-reconnect-toast')).toHaveCount(0);
	// Dismissing the one-off alert must not hide the standing sitewide warning.
	await expect(page.getByTestId('backup-reconnect-banner')).toBeVisible();
});

Then('backup settings asks me to reconnect {string}', async ({ page }, label: string) => {
	await page.goto('/backup-settings');
	const card = page.locator('.border').filter({ hasText: label });
	await expect(card.getByText('Reconnect needed', { exact: true })).toBeVisible();
	await expect(card.getByText(/access has expired or was revoked/)).toBeVisible();
	// The settings page already explains the problem, so the sitewide banner stays out of the way.
	await expect(page.getByTestId('backup-reconnect-banner')).toHaveCount(0);
});

Then('other pages warn that my {string} backup has stopped', async ({ page }, label: string) => {
	await page.goto('/my-pokedexes');
	const banner = page.getByTestId('backup-reconnect-banner');
	await expect(banner).toBeVisible();
	await expect(banner).toContainText(label);
	await expect(banner.getByRole('link', { name: 'Reconnect' })).toHaveAttribute(
		'href',
		'/backup-settings'
	);
});

Then('{string} is not flagged for reconnection', async ({ page, state }, label: string) => {
	await page.goto('/backup-settings');
	const card = page.locator('.border').filter({ hasText: label });
	await expect(card.getByText('Connected', { exact: true })).toBeVisible();
	await page.goto('/my-pokedexes');
	await expect(page.getByTestId('backup-reconnect-banner')).toHaveCount(0);
	// A transient upload failure leaves the integration enabled, so the next export still tries it.
	const response = await page.request.post(`/api/pokedexes/${state.pokedexId}/export`);
	expect(await response.json()).toMatchObject({ attempted: 1 });
});

Then('later exports do not retry the revoked token', async ({ page, state }) => {
	const before = (await mockState()).refreshes;
	const response = await page.request.post(`/api/pokedexes/${state.pokedexId}/export`);
	expect(response.status()).toBe(200);
	expect(await response.json()).toMatchObject({ attempted: 0 });
	expect((await mockState()).refreshes).toBe(before);
});

Then('the previous backup error is cleared', async ({ page }) => {
	await expect(page.getByText(/access has expired or was revoked/)).toHaveCount(0);
	await page.goto('/my-pokedexes');
	await expect(page.getByTestId('backup-reconnect-banner')).toHaveCount(0);
});
