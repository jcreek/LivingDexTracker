import { type PokedexEntry } from './PokedexEntry';
import { type CatchRecord } from './CatchRecord';

export interface CombinedData {
	pokedexEntry: PokedexEntry;
	catchRecord: CatchRecord;
}
