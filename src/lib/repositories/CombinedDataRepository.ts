import { type PokedexEntry, type PokedexEntryDB } from '$lib/models/PokedexEntry';
import { type CatchRecord, type CatchRecordDB } from '$lib/models/CatchRecord';
import { type CombinedData } from '$lib/models/CombinedData';
import type { SupabaseClient } from '@supabase/supabase-js';

class CombinedDataRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string
	) {}

	// Transform Supabase data to match frontend expectations (minimal transformation)
	private transformPokedexEntry(entry: PokedexEntryDB): PokedexEntry {
		return {
			_id: entry.id.toString(),
			pokedexNumber: entry.pokedexNumber,
			pokemon: entry.pokemon,
			form: entry.form || '',
			canGigantamax: entry.canGigantamax,
			regionToCatchIn: entry.regionToCatchIn || '',
			gamesToCatchIn: entry.gamesToCatchIn || [],
			regionToEvolveIn: entry.regionToEvolveIn || '',
			evolutionInformation: entry.evolutionInformation || '',
			catchInformation: entry.catchInformation || [],
			boxPlacementForms: {
				box: entry.boxPlacementFormsBox || 0,
				row: entry.boxPlacementFormsRow || 0,
				column: entry.boxPlacementFormsColumn || 0
			},
			boxPlacement: {
				box: entry.boxPlacementBox || 0,
				row: entry.boxPlacementRow || 0,
				column: entry.boxPlacementColumn || 0
			}
		};
	}

	private transformCatchRecord(record: CatchRecordDB): CatchRecord {
		return {
			_id: record.id,
			userId: record.userId,
			pokedexEntryId: record.pokedexEntryId.toString(),
			haveToEvolve: record.haveToEvolve,
			caught: record.caught,
			inHome: record.inHome,
			hasGigantamaxed: record.hasGigantamaxed,
			personalNotes: record.personalNotes
		};
	}

	async findAllCombinedData(
		userId: string,
		enableForms: boolean = true,
		region: string = '',
		game: string = ''
	): Promise<CombinedData[]> {
		let query = this.supabase.from('pokedex_entries').select('*');

		// Apply filters
		if (!enableForms) {
			query = query.not('boxPlacementBox', 'is', null);
		}

		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		if (game) {
			query = query.contains('gamesToCatchIn', [game]);
		}

		// Order by box placement
		if (enableForms) {
			query = query
				.order('boxPlacementFormsBox', { ascending: true })
				.order('boxPlacementFormsRow', { ascending: true })
				.order('boxPlacementFormsColumn', { ascending: true });
		} else {
			query = query
				.order('boxPlacementBox', { ascending: true })
				.order('boxPlacementRow', { ascending: true })
				.order('boxPlacementColumn', { ascending: true });
		}

		const { data: entries, error: entriesError } = await query;

		if (entriesError) {
			console.error('Error finding combined data:', entriesError);
			return [];
		}

		if (!entries || entries.length === 0) {
			return [];
		}

		// Get catch records for all entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId) {
			const entryIds = entries.map((entry) => entry.id);
			const { data: records, error: recordsError } = await this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.in('pokedexEntryId', entryIds);

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data exactly like master branch
		return entries.map((entry) => {
			const userCatchRecord =
				catchRecords.find((record) => record.pokedexEntryId === entry.id) || null;

			const transformedEntry = this.transformPokedexEntry(entry);
			const transformedCatchRecord = userCatchRecord
				? this.transformCatchRecord(userCatchRecord)
				: null;

			return {
				pokedexEntry: transformedEntry,
				catchRecord: transformedCatchRecord
			};
		});
	}

	async findCombinedData(
		userId: string,
		page: number = 1,
		limit: number = 20,
		enableForms: boolean = true,
		region: string = '',
		game: string = ''
	): Promise<CombinedData[]> {
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		let query = this.supabase.from('pokedex_entries').select('*').range(from, to);

		// Apply filters
		if (!enableForms) {
			query = query.not('boxPlacementBox', 'is', null);
		}

		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		if (game) {
			query = query.contains('gamesToCatchIn', [game]);
		}

		// Order by box placement
		if (enableForms) {
			query = query
				.order('boxPlacementFormsBox', { ascending: true })
				.order('boxPlacementFormsRow', { ascending: true })
				.order('boxPlacementFormsColumn', { ascending: true });
		} else {
			query = query
				.order('boxPlacementBox', { ascending: true })
				.order('boxPlacementRow', { ascending: true })
				.order('boxPlacementColumn', { ascending: true });
		}

		const { data: entries, error: entriesError } = await query;

		if (entriesError) {
			console.error('Error finding paginated combined data:', entriesError);
			return [];
		}

		if (!entries || entries.length === 0) {
			return [];
		}

		// Get catch records for these entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId) {
			const entryIds = entries.map((entry) => entry.id);
			const { data: records, error: recordsError } = await this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.in('pokedexEntryId', entryIds);

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data exactly like master branch
		return entries.map((entry) => {
			const userCatchRecord =
				catchRecords.find((record) => record.pokedexEntryId === entry.id) || null;

			const transformedEntry = this.transformPokedexEntry(entry);
			const transformedCatchRecord = userCatchRecord
				? this.transformCatchRecord(userCatchRecord)
				: null;

			return {
				pokedexEntry: transformedEntry,
				catchRecord: transformedCatchRecord
			};
		});
	}

	async countCombinedData(
		userId: string,
		enableForms: boolean,
		region: string,
		game: string
	): Promise<number> {
		let query = this.supabase.from('pokedex_entries').select('id', { count: 'exact', head: true });

		// Apply same filters as in findCombinedData
		if (!enableForms) {
			query = query.not('boxPlacementBox', 'is', null);
		}

		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		if (game) {
			query = query.contains('gamesToCatchIn', [game]);
		}

		const { count, error } = await query;

		if (error) {
			console.error('Error counting combined data:', error);
			return 0;
		}

		return count || 0;
	}
}

export default CombinedDataRepository;
