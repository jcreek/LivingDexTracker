import type { PokedexEntry } from './PokedexEntry';
import type { CatchRecord } from './CatchRecord';

/** Complete ordering/status data, without detail text or repeated ownership fields. */
export type PokedexGridRow = {
	pokedexEntry: Pick<
		PokedexEntry,
		'_id' | 'pokemon' | 'pokedexNumber' | 'form' | 'spriteKey' | 'canGigantamax'
	>;
	catchRecord: Pick<
		CatchRecord,
		'_id' | 'caught' | 'haveToEvolve' | 'inHome' | 'hasGigantamaxed'
	> | null;
};
export type CatchRecordPatch = Partial<CatchRecord> &
	Pick<CatchRecord, 'userId' | 'pokedexId' | 'pokemonId'>;

/** Version 1 transport rows: avoid repeating field names 1,000+ times. IDs remain available. */
export type PackedGridRow = [
	entryId: string,
	number: number,
	name: string,
	form: string,
	spriteKey: string,
	canGigantamax: boolean,
	catchId: string | null,
	status: number
];
export function packGrid(rows: PokedexGridRow[]): PackedGridRow[] {
	return rows.map(({ pokedexEntry: e, catchRecord: c }) => [
		e._id,
		e.pokedexNumber,
		e.pokemon,
		e.form,
		e.spriteKey,
		e.canGigantamax,
		c?._id ?? null,
		(c?.caught ? 1 : 0) |
			(c?.haveToEvolve ? 2 : 0) |
			(c?.inHome ? 4 : 0) |
			(c?.hasGigantamaxed ? 8 : 0)
	]);
}
export function unpackGrid(rows: PackedGridRow[]): PokedexGridRow[] {
	return rows.map(([id, number, name, form, spriteKey, canGigantamax, catchId, status]) => ({
		pokedexEntry: { _id: id, pokedexNumber: number, pokemon: name, form, spriteKey, canGigantamax },
		catchRecord:
			catchId === null
				? null
				: {
						_id: catchId,
						caught: !!(status & 1),
						haveToEvolve: !!(status & 2),
						inHome: !!(status & 4),
						hasGigantamaxed: !!(status & 8)
					}
	}));
}
