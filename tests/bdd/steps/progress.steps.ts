import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { firstPokemon, openFirstPokemon } from '../support/app';

const { When, Then } = createBdd(test);

async function ensurePokemonModal(page: Parameters<typeof firstPokemon>[0]) {
	if ((await page.getByRole('dialog').count()) === 0) await openFirstPokemon(page);
}

async function settleAndReload(page: Parameters<typeof firstPokemon>[0]) {
	await expect(page.getByText(/Saving…/)).toHaveCount(0, { timeout: 15_000 });
	await page.reload({ waitUntil: 'networkidle' });
	await expect(firstPokemon(page)).toBeVisible();
}

When('I mark the first Pokémon as caught', async ({ page }) => {
	await ensurePokemonModal(page);
	const checkbox = page
		.getByRole('dialog')
		.getByText('Caught:', { exact: true })
		.locator('..')
		.getByRole('checkbox');
	await checkbox.check();
});

When('I mark the first Pokémon as needing evolution', async ({ page }) => {
	await ensurePokemonModal(page);
	const checkbox = page
		.getByRole('dialog')
		.getByText('Needs to evolve:', { exact: true })
		.locator('..')
		.getByRole('checkbox');
	await checkbox.check();
});

When('I mark the first Pokémon as in HOME', async ({ page }) => {
	await ensurePokemonModal(page);
	await page
		.getByRole('dialog')
		.getByText('In Home:', { exact: true })
		.locator('..')
		.getByRole('checkbox')
		.check();
});

When('I add the note {string} to the first Pokémon', async ({ page }, note: string) => {
	await ensurePokemonModal(page);
	await page.getByRole('dialog').getByLabel('Notes:').fill(note);
	await page.getByRole('dialog').getByLabel('Notes:').blur();
});

function boxContainer(page: Parameters<typeof firstPokemon>[0], box: number) {
	return page
		.getByRole('heading', { name: `Box ${box}`, exact: true })
		.locator('..')
		.locator('..');
}

When('I mark box {int} as caught', async ({ page }, box: number) => {
	const container = boxContainer(page, box);
	await container.getByRole('button', { name: 'Open bulk actions menu' }).click();
	await container.getByRole('button', { name: 'Mark box as Caught' }).click();
});

When('I filter to Pokémon that are not caught', async ({ page, state }) => {
	if ((await page.getByRole('dialog').count()) > 0) {
		await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	}
	// Remember which entry was caught, so the assertion can name it rather than trusting
	// whichever entry happens to be first after filtering.
	state.caughtEntryLabel = await firstPokemon(page).getAttribute('aria-label');
	expect(state.caughtEntryLabel).toMatch(/Status: Caught/);
	await page.getByText('Not caught', { exact: true }).locator('..').getByRole('checkbox').check();
});

When('I select the {string} box layout', async ({ page }, layout: string) => {
	await page.getByLabel('Choose box view layout density').selectOption(layout.toLowerCase());
});

When('I reload the Pokédex', async ({ page }) => {
	await settleAndReload(page);
});

Then('the first Pokémon is shown as caught after reloading', async ({ page }) => {
	await settleAndReload(page);
	await expect(firstPokemon(page)).toHaveAttribute('aria-label', /Status: Caught/);
});

Then('the first Pokémon needs evolution and is not marked caught', async ({ page }) => {
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await settleAndReload(page);
	await expect(firstPokemon(page)).toHaveAttribute('aria-label', /Needs to evolve/);
	await expect(firstPokemon(page)).not.toHaveAttribute('aria-label', /Status: Caught(?:,|$)/);
});

Then('its HOME state and note persist after reloading', async ({ page }) => {
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await settleAndReload(page);
	await expect(firstPokemon(page)).toHaveAttribute('aria-label', /In HOME/);
	await openFirstPokemon(page);
	await expect(page.getByRole('dialog').getByLabel('Notes:')).toHaveValue(
		'Caught, traded, and checked'
	);
});

Then('box {int} contains {int} caught Pokémon', async ({ page }, box: number, count: number) => {
	await settleAndReload(page);
	const entries = boxContainer(page, box).getByRole('button', { name: /^View details for / });
	await expect(entries).toHaveCount(count);
	const labels = await entries.evaluateAll((elements) =>
		elements.map((element) => element.getAttribute('aria-label') ?? '')
	);
	expect(labels.filter((label) => /Status: Caught/.test(label))).toHaveLength(count);
});

Then('the caught Pokémon is filtered out', async ({ page, state }) => {
	const label = state.caughtEntryLabel;
	if (!label) throw new Error('No caught entry was recorded before filtering');
	// That specific entry is excluded...
	await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute(
		'aria-disabled',
		'true'
	);
	// ...and the filter did not simply exclude everything.
	await expect(
		page
			.getByRole('button', { name: /^View details for / })
			.and(page.locator('[aria-disabled="false"]'))
			.first()
	).toBeVisible();
});

Then('the {string} box layout remains selected', async ({ page }, layout: string) => {
	await expect(page.getByLabel('Choose box view layout density')).toHaveValue(layout.toLowerCase());
});
