import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { createDexThroughUi } from '../support/app';

const { Given, When, Then } = createBdd(test);

async function dexCard(page: Parameters<typeof createDexThroughUi>[0], name: string) {
	await page.goto('/my-pokedexes');
	const card = page.locator('.card').filter({ hasText: name }).first();
	await expect(card).toBeVisible();
	return card;
}

Given('I have no Pokédexes', async ({ page }) => {
	await page.goto('/my-pokedexes');
	await expect(
		page.locator('.card').filter({ has: page.getByRole('button', { name: 'View' }) })
	).toHaveCount(0);
});

Given('I have a Living Dex named {string}', async ({ page, state }, name: string) => {
	await createDexThroughUi(page, state, { name, type: 'Living Dex' });
});

Given('I have a Form Dex named {string}', async ({ page, state }, name: string) => {
	await createDexThroughUi(page, state, { name, type: 'Form Dex' });
});

Given(
	'I have a Form Dex named {string} scoped to game {string} and dex {string}',
	async ({ page, state }, name: string, game: string, dex: string) => {
		await createDexThroughUi(page, state, { name, type: 'Form Dex', game, dex });
	}
);

Given('I have a Shiny Dex named {string}', async ({ page, state }, name: string) => {
	await createDexThroughUi(page, state, { name, type: 'Shiny Dex' });
});

Given('another trainer has a Pokédex', async ({ state }) => {
	const url = process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321';
	const key = process.env.E2E_SERVICE_ROLE_KEY;
	if (!key) throw new Error('E2E_SERVICE_ROLE_KEY is required');
	const headers = {
		apikey: key,
		Authorization: `Bearer ${key}`,
		'Content-Type': 'application/json'
	};
	const userResponse = await fetch(`${url}/auth/v1/admin/users`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			email: `other-${Date.now()}@example.test`,
			password: 'OtherPassword123!',
			email_confirm: true
		})
	});
	const other = (await userResponse.json()) as { id: string };
	const dexResponse = await fetch(`${url}/rest/v1/pokedexes`, {
		method: 'POST',
		headers: { ...headers, Prefer: 'return=representation' },
		body: JSON.stringify({ userId: other.id, name: 'Private', isLivingDex: true })
	});
	if (!dexResponse.ok) throw new Error(await dexResponse.text());
	const [dex] = (await dexResponse.json()) as Array<{ id: string }>;
	state.pokedexId = dex.id;
});

When('I visit my Pokédex list', async ({ page }) => {
	await page.goto('/my-pokedexes');
});

When('I open the new Pokédex form', async ({ page }) => {
	await page.goto('/my-pokedexes');
	await page
		.getByRole('button', { name: /Create (New|Your First) Pokédex/ })
		.first()
		.click();
});

When('I create a Pokédex named {string} of type {string}', async ({ page, state }, name, type) => {
	await createDexThroughUi(page, state, { name, type });
});

When(
	'I create a Living Dex named {string} scoped to game {string} and dex {string}',
	async ({ page, state }, name: string, game: string, dex: string) => {
		await createDexThroughUi(page, state, { name, type: 'Living Dex', game, dex });
	}
);

When('I try to create another Living Dex named {string}', async ({ page, state }, name: string) => {
	await page.goto('/my-pokedexes');
	await page.getByRole('button', { name: 'Create New Pokédex', exact: true }).click();
	const modal = page.locator('.modal-open');
	await modal.getByLabel('Name').fill(name);
	await modal.getByText('Living Dex', { exact: false }).locator('..').getByRole('checkbox').check();
	page.once('dialog', async (dialog) => {
		state.lastMessage = dialog.message();
		await dialog.accept();
	});
	await modal.getByRole('button', { name: 'Create', exact: true }).click();
	await expect.poll(() => state.lastMessage).not.toBeNull();
});

When('I rename it to {string} and enable forms', async ({ page }, name: string) => {
	const card = await dexCard(page, 'Before Editing');
	await card.getByRole('button', { name: 'Edit' }).click();
	const modal = page.locator('.modal-open');
	await modal.getByLabel('Name').fill(name);
	await modal.getByText('Form Dex', { exact: false }).locator('..').getByRole('checkbox').check();
	const response = page.waitForResponse(
		(candidate) =>
			candidate.url().includes('/api/pokedexes/') && candidate.request().method() === 'PUT'
	);
	await modal.getByRole('button', { name: 'Save', exact: true }).click();
	expect((await response).ok()).toBe(true);
	await expect(modal).toHaveCount(0);
});

When('I cancel deleting {string}', async ({ page }, name: string) => {
	const card = await dexCard(page, name);
	page.once('dialog', (dialog) => dialog.dismiss());
	await card.getByRole('button', { name: 'Delete' }).click();
});

When('I confirm deleting {string}', async ({ page }, name: string) => {
	const card = await dexCard(page, name);
	page.once('dialog', (dialog) => dialog.accept());
	const response = page.waitForResponse(
		(candidate) =>
			candidate.url().includes('/api/pokedexes/') && candidate.request().method() === 'DELETE'
	);
	await card.getByRole('button', { name: 'Delete' }).click();
	expect((await response).ok()).toBe(true);
});

When("I request the other trainer's Pokédex", async ({ page, state }) => {
	const response = await page.request.get(`/api/pokedexes/${state.pokedexId}`);
	state.lastResponseStatus = response.status();
});

Then('I see the empty Pokédex message', async ({ page }) => {
	await expect(page.getByText("You haven't created any pokédexes yet!")).toBeVisible();
});

Then('I cannot create a Pokédex without a name and type', async ({ page }) => {
	await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
	await expect(page.getByText('At least one type required')).toBeVisible();
});

Then('the Pokédex {string} is available to view', async ({ page }, name: string) => {
	await expect((await dexCard(page, name)).getByRole('button', { name: 'View' })).toBeVisible();
});

Then('I am told that the Pokédex name is already used', async ({ state }) => {
	expect(state.lastMessage).toMatch(/already have a Pokédex named/i);
});

Then('the Pokédex {string} is no longer listed', async ({ page }, name: string) => {
	await page.goto('/my-pokedexes');
	await expect(page.locator('.card').filter({ hasText: name })).toHaveCount(0);
});

Then('the Pokédex is not disclosed', async ({ state }) => {
	expect(state.lastResponseStatus).toBe(404);
});
