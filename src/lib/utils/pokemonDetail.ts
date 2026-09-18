import type { CatchRecord } from '$lib/models/CatchRecord';
import type { CombinedData } from '$lib/models/CombinedData';
import type { PokedexGridRow } from '$lib/models/PokedexGridRow';

/**
 * Builds the Pokémon shown in the detail modal. The detail row supplies catalog text and personal
 * notes; the live grid row and any queued write supply catch status, so a detail response can never
 * undo a status change made while it was being loaded.
 */
export function mergeEntryDetail(
	detail: CombinedData,
	gridRecord: PokedexGridRow['catchRecord'] | null | undefined,
	pending: Partial<CatchRecord> | null | undefined,
	owner: string,
	pokedexId: string,
	entryId: string
): CombinedData {
	if (!detail.catchRecord && !gridRecord && !pending) return { ...detail, catchRecord: null };
	return {
		...detail,
		catchRecord: {
			_id: '',
			userId: owner,
			pokedexId,
			pokemonId: entryId,
			caught: false,
			haveToEvolve: false,
			inHome: false,
			hasGigantamaxed: false,
			personalNotes: '',
			...detail.catchRecord,
			...gridRecord,
			...pending
		}
	};
}
