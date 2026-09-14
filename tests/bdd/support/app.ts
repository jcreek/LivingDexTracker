import type { Page } from '@playwright/test';
import type { ScenarioState } from '../fixtures';
import { requireLoopbackUrl } from '../../support/loopback';

const SUPABASE_URL = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);
const SERVICE_ROLE_KEY = process.env.E2E_SERVICE_ROLE_KEY;

function requireServiceRoleKey(): string {
	if (!SERVICE_ROLE_KEY) {
		throw new Error('E2E_SERVICE_ROLE_KEY is required. Run BDD through "npm run test:bdd".');
	}
	return SERVICE_ROLE_KEY;
}

export async function createConfirmedUser(state: ScenarioState): Promise<void> {
	if (state.userId) return;
	const key = requireServiceRoleKey();
	const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
		method: 'POST',
		headers: {
			apikey: key,
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: state.email,
			password: state.password,
			email_confirm: true
		})
	});
	if (!response.ok)
		throw new Error(`Unable to create BDD user: ${response.status} ${await response.text()}`);
	const body = (await response.json()) as { id: string };
	state.userId = body.id;
}

export async function deleteAllPokedexes(state: ScenarioState): Promise<void> {
	const key = requireServiceRoleKey();
	if (!state.userId) throw new Error('A confirmed user is required before clearing Pokédexes');
	const response = await fetch(
		`${SUPABASE_URL}/rest/v1/pokedexes?userId=eq.${encodeURIComponent(state.userId)}`,
		{ method: 'DELETE', headers: { apikey: key, Authorization: `Bearer ${key}` } }
	);
	if (!response.ok) throw new Error(`Unable to clear Pokédexes: ${await response.text()}`);
}

export async function signIn(page: Page, state: ScenarioState, password = state.password) {
	await page.goto('/signin');
	await page.getByLabel('Email').fill(state.email);
	await page.getByLabel('Password').fill(password);
	await page.getByRole('button', { name: 'Sign In' }).click();
}

export async function createDexThroughUi(
	page: Page,
	state: ScenarioState,
	options: { name: string; type: string; game?: string; dex?: string }
) {
	await page.goto('/my-pokedexes');
	await page
		.getByRole('button', { name: /Create (New|Your First) Pokédex/ })
		.first()
		.click();
	await page.getByLabel('Name').fill(options.name);
	await page.getByText(options.type, { exact: false }).locator('..').getByRole('checkbox').check();
	if (options.game) {
		await page.getByLabel('Game Scope').selectOption({ label: options.game });
		if (options.dex) {
			const checkbox = page
				.getByText(options.dex, { exact: false })
				.locator('..')
				.getByRole('checkbox');
			if (!(await checkbox.isChecked())) await checkbox.check();
		}
	}
	await page.locator('.modal-open').getByRole('button', { name: 'Create', exact: true }).click();
	await page.waitForLoadState('networkidle');
	state.pokedexName = options.name;
	if (page.url().includes('/pokedex/')) {
		state.pokedexId = page.url().split('/pokedex/')[1].split(/[?#]/)[0];
	} else {
		const card = page.locator('.card').filter({ hasText: options.name }).first();
		await card.getByRole('button', { name: 'View', exact: true }).click();
		await page.waitForURL('**/pokedex/**');
		state.pokedexId = page.url().split('/pokedex/')[1].split(/[?#]/)[0];
	}
}

export async function loadEntries(page: Page, state: ScenarioState, forms: boolean) {
	if (!state.pokedexId) throw new Error('A Pokédex must be created before loading entries');
	const result = await page.evaluate(
		async ([id, enableForms]) => {
			const response = await fetch(
				`/api/pokedexes/${id}/combined-data?page=1&limit=9999&enableForms=${enableForms}`
			);
			if (!response.ok) throw new Error(await response.text());
			const body = await response.json();
			return body.combinedData.map(
				(row: {
					pokedexEntry: {
						_id: string;
						pokemon: string;
						form: string | null;
						pokedexNumber: number;
					};
				}) => ({
					id: row.pokedexEntry._id,
					pokemon: row.pokedexEntry.pokemon,
					form: row.pokedexEntry.form,
					num: row.pokedexEntry.pokedexNumber
				})
			);
		},
		[state.pokedexId, String(forms)]
	);
	state.entries = result;
}

export function firstPokemon(page: Page) {
	return page.getByRole('button', { name: /^View details for / }).first();
}

export async function openFirstPokemon(page: Page) {
	const pokemon = firstPokemon(page);
	await pokemon.click();
	await page.locator('.modal-open, [role="dialog"]').first().waitFor({ state: 'visible' });
}
