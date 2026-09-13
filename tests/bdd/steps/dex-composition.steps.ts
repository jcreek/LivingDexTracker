import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { loadEntries } from '../support/app';

const { When, Then } = createBdd(test);

When('I inspect its entries without forms', async ({ page, state }) => {
	await loadEntries(page, state, false);
});

When('I inspect its entries with forms', async ({ page, state }) => {
	await loadEntries(page, state, true);
});

When('I view the Pokédex', async ({ page, state }) => {
	if (!state.pokedexId) throw new Error('A Pokédex must exist before it can be viewed');
	await page.goto(`/pokedex/${state.pokedexId}`);
	await expect(page.getByRole('button', { name: /^View details for / }).first()).toBeVisible();
});

Then('it contains {int} unique species', async ({ state }, count: number) => {
	expect(state.entries).toHaveLength(count);
	expect(new Set(state.entries.map((entry) => entry.pokemon)).size).toBe(count);
});

Then('named default forms are represented once', async ({ state }) => {
	for (const [pokemon, form] of Object.entries({
		Basculin: 'Red-striped',
		Tornadus: 'Incarnate Form',
		Oricorio: 'Baile (Red)',
		Zygarde: '50%',
		Gimmighoul: 'Box Form',
		Rotom: 'Lightbulb',
		Unown: 'A'
	})) {
		expect(state.entries.filter((entry) => entry.pokemon === pokemon)).toEqual([
			expect.objectContaining({ form })
		]);
	}
});

Then('every entry identity is unique', async ({ state }) => {
	const identities = state.entries.map((entry) => `${entry.pokemon}|${entry.form ?? ''}`);
	expect(new Set(identities).size).toBe(identities.length);
});

Then('{word} has {int} forms', async ({ state }, pokemon: string, count: number) => {
	expect(state.entries.filter((entry) => entry.pokemon === pokemon)).toHaveLength(count);
});

Then('its Pokémon use shiny sprites', async ({ page }) => {
	const first = page.locator('img[src*="/shiny/"]').first();
	for (let attempts = 0; attempts < 10 && (await first.count()) === 0; attempts++) {
		await page.mouse.wheel(0, 2500);
	}
	await expect(first).toBeVisible();
});

Then('Rotom includes its named default form without duplicate forms', async ({ state }) => {
	const forms = state.entries
		.filter((entry) => entry.pokemon === 'Rotom')
		.map((entry) => entry.form ?? '');
	expect(forms).toContain('Lightbulb');
	expect(new Set(forms).size).toBe(forms.length);
});
