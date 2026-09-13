import { test as base } from 'playwright-bdd';

export type ScenarioState = {
	email: string;
	password: string;
	replacementPassword: string;
	userId: string | null;
	pokedexId: string | null;
	pokedexName: string | null;
	entries: Array<{ pokemon: string; form: string | null; num: number; id: string }>;
	lastResponseStatus: number | null;
	lastMessage: string | null;
};

type Fixtures = { state: ScenarioState };

export const test = base.extend<Fixtures>({
	// Playwright fixture callbacks require the dependency object even when this fixture has none.
	// eslint-disable-next-line no-empty-pattern
	state: async ({}, use, testInfo) => {
		const slug = testInfo.testId
			.replace(/[^a-z0-9]/gi, '')
			.slice(-18)
			.toLowerCase();
		await use({
			email: `bdd-${slug}-${Date.now()}@example.test`,
			password: 'BddPassword123!',
			replacementPassword: 'BddReplacement456!',
			userId: null,
			pokedexId: null,
			pokedexName: null,
			entries: [],
			lastResponseStatus: null,
			lastMessage: null
		});
	}
});

export { expect } from '@playwright/test';
