import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures';
import { createConfirmedUser, signIn } from '../support/app';

const { Given, When, Then } = createBdd(test);
const MAILPIT_URL = process.env.TEST_MAILPIT_URL ?? 'http://127.0.0.1:54324';

async function mailCountFor(email: string, subject: string): Promise<number> {
	const response = await fetch(
		`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email} subject:${subject}`)}`
	);
	if (!response.ok) throw new Error(`MailPit is unavailable: ${response.status}`);
	const body = (await response.json()) as { total?: number; messages?: unknown[] };
	return body.total ?? body.messages?.length ?? 0;
}

Given('I am a new visitor', async ({ page }) => {
	await page.goto('/');
});

Given('I have a confirmed account', async ({ state }) => {
	await createConfirmedUser(state);
});

Given('I am signed in', async ({ page, state }) => {
	await createConfirmedUser(state);
	await signIn(page, state);
	await expect(page).toHaveURL(/\/my-pokedexes$/);
});

/**
 * Deliberately an ordinary signed-in session, not a recovery one: following a real recovery
 * action link currently bounces to /signin, because the browser client in src/routes/+layout.ts
 * has no cookie `set`/`remove` method and so cannot persist the session it parses out of the
 * URL. Until that is fixed, these scenarios cover the form, not the emailed-link flow - hence
 * the step name. `createRecoveryLink` in ../support/app.ts is ready for when it is.
 */
Given('I am signed in on the password reset page', async ({ page, state }) => {
	await createConfirmedUser(state);
	await signIn(page, state);
	await expect(page).toHaveURL(/\/my-pokedexes$/);
	await page.goto('/reset-password');
	await expect(page.getByLabel('New Password')).toBeVisible();
});

When('I register with valid account details', async ({ page, state }) => {
	await page.getByLabel('Email').fill(state.email);
	await page.getByLabel('Password').fill(state.password);
	await page.getByRole('button', { name: 'Sign Up', exact: true }).first().click();
});

When('I sign in with my credentials', async ({ page, state }) => {
	await signIn(page, state);
});

When('I sign in with an incorrect password', async ({ page, state }) => {
	await signIn(page, state, `${state.password}-incorrect`);
});

When('I visit the public home page', async ({ page }) => {
	await page.goto('/');
});

When('I sign out', async ({ page }) => {
	await page.getByRole('button', { name: 'usericon' }).click();
	await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
});

When('I request a password reset', async ({ page, state }) => {
	await page.goto('/forgot-password');
	await page.getByLabel('Email').fill(state.email);
	await page.getByRole('button', { name: 'Send Reset Link' }).click();
});

When('I enter two different replacement passwords', async ({ page, state }) => {
	await page.getByLabel('New Password').fill(state.replacementPassword);
	await page.getByLabel('Confirm Password').fill(`${state.replacementPassword}-different`);
	await page.getByRole('button', { name: 'Update Password' }).click();
});

When('I enter a valid replacement password', async ({ page, state }) => {
	await page.getByLabel('New Password').fill(state.replacementPassword);
	await page.getByLabel('Confirm Password').fill(state.replacementPassword);
	await page.getByRole('button', { name: 'Update Password' }).click();
});

Then('I am told to confirm my email', async ({ page }) => {
	await expect(page).toHaveURL(/\/welcome$/);
	await expect(page.getByText('Check Your Email', { exact: true })).toBeVisible();
});

Then('a confirmation email is captured locally', async ({ state }) => {
	await expect.poll(() => mailCountFor(state.email, 'Confirm')).toBeGreaterThan(0);
});

Then('I arrive at my Pokédex list', async ({ page }) => {
	await expect(page).toHaveURL(/\/my-pokedexes$/);
});

Then('I see a sign-in error', async ({ page }) => {
	await expect(page.locator('.alert-error')).toBeVisible();
});

Then('I return to the public home page', async ({ page }) => {
	await expect(page).toHaveURL(/\/$/);
});

Then('a password reset email is captured locally', async ({ page, state }) => {
	await expect(page.getByText('Check your email for the password reset link')).toBeVisible();
	await expect.poll(() => mailCountFor(state.email, 'Reset')).toBeGreaterThan(0);
});

Then('I am told that the passwords do not match', async ({ page }) => {
	await expect(page.getByText('Passwords do not match')).toBeVisible();
});

Then('I am told that my password was updated', async ({ page }) => {
	await expect(page.getByText(/Password updated successfully/)).toBeVisible();
});
