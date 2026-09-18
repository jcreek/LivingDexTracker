import { describe, expect, it } from 'vitest';
import { mergeEntryDetail } from '$lib/utils/pokemonDetail';
import type { CombinedData } from '$lib/models/CombinedData';

const detail = {
	pokedexEntry: {
		_id: '25',
		pokedexNumber: 25,
		pokemon: 'Pikachu',
		form: '',
		spriteKey: '25',
		canGigantamax: true,
		regionToCatchIn: 'Kanto',
		gamesToCatchIn: ['Red'],
		regionToEvolveIn: '',
		evolutionInformation: 'Use a Thunder Stone',
		catchInformation: ['Viridian Forest'],
		notes: 'Dex note'
	},
	catchRecord: {
		_id: 'catch-1',
		userId: 'user-1',
		pokedexId: 'dex-1',
		pokemonId: '25',
		caught: false,
		haveToEvolve: false,
		inHome: false,
		hasGigantamaxed: false,
		personalNotes: 'My note'
	}
} satisfies CombinedData;

describe('mergeEntryDetail', () => {
	it('keeps catalog text and personal notes while taking status from the grid row', () => {
		const merged = mergeEntryDetail(
			detail,
			{ _id: 'catch-1', caught: true, haveToEvolve: false, inHome: true, hasGigantamaxed: false },
			undefined,
			'user-1',
			'dex-1',
			'25'
		);

		expect(merged.pokedexEntry.evolutionInformation).toBe('Use a Thunder Stone');
		expect(merged.catchRecord).toMatchObject({
			caught: true,
			inHome: true,
			personalNotes: 'My note'
		});
	});

	it('lets a queued write win over both the detail row and the grid row', () => {
		const merged = mergeEntryDetail(
			detail,
			{ _id: 'catch-1', caught: false, haveToEvolve: false, inHome: false, hasGigantamaxed: false },
			{ userId: 'user-1', pokedexId: 'dex-1', pokemonId: '25', caught: true },
			'user-1',
			'dex-1',
			'25'
		);

		expect(merged.catchRecord?.caught).toBe(true);
	});

	it('builds a record from a queued write when nothing has been saved yet', () => {
		const merged = mergeEntryDetail(
			{ ...detail, catchRecord: null },
			null,
			{ userId: 'user-1', pokedexId: 'dex-1', pokemonId: '25', haveToEvolve: true },
			'user-1',
			'dex-1',
			'25'
		);

		expect(merged.catchRecord).toEqual({
			_id: '',
			userId: 'user-1',
			pokedexId: 'dex-1',
			pokemonId: '25',
			caught: false,
			haveToEvolve: true,
			inHome: false,
			hasGigantamaxed: false,
			personalNotes: ''
		});
	});

	it('leaves an uncaught Pokémon without a catch record', () => {
		const merged = mergeEntryDetail({ ...detail, catchRecord: null }, null, null, 'u', 'd', '25');

		expect(merged.catchRecord).toBeNull();
	});
});
