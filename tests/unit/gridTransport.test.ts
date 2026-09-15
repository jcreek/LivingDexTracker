import { describe, it, expect } from 'vitest';
import { packGrid, unpackGrid, type PokedexGridRow } from '$lib/models/PokedexGridRow';
describe('grid transport', () => {
	it('round-trips missing catches and every flag combination', () => {
		const rows: PokedexGridRow[] = Array.from({ length: 17 }, (_, flags) => ({
			pokedexEntry: {
				_id: String(flags),
				pokedexNumber: 25,
				pokemon: 'Pikachu',
				form: 'Female',
				spriteKey: '25',
				canGigantamax: true
			},
			catchRecord:
				flags === 16
					? null
					: {
							_id: `catch-${flags}`,
							caught: !!(flags & 1),
							haveToEvolve: !!(flags & 2),
							inHome: !!(flags & 4),
							hasGigantamaxed: !!(flags & 8)
						}
		}));
		expect(unpackGrid(packGrid(rows))).toEqual(rows);
	});
});
