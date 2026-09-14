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
	caughtEntryLabel: string | null;
	legacyServiceWorkerRequested: boolean;
	shareUrl: string | null;
};

type Fixtures = { state: ScenarioState; providerMock: void };

const MOCK_URL = process.env.MOCK_PROVIDER_URL ?? 'http://127.0.0.1:4199';

export const test = base.extend<Fixtures>({
	/**
	 * The mock provider keeps recorded requests, the refresh counter and the fail-uploads switch
	 * in one process-wide object. Without a reset per scenario, assertions are satisfied by
	 * whatever ran before them - and the failing-upload scenario would poison every later one.
	 */
	providerMock: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			const response = await fetch(`${MOCK_URL}/__mock/reset`);
			if (!response.ok) {
				throw new Error(`Unable to reset the mock provider at ${MOCK_URL}: ${response.status}`);
			}
			await use();
		},
		{ auto: true }
	],
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
			lastMessage: null,
			caughtEntryLabel: null,
			legacyServiceWorkerRequested: false,
			shareUrl: null
		});
	}
});

export { expect } from '@playwright/test';
