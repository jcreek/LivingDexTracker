import { type PokedexEntry } from '$lib/models/PokedexEntry';
import { type CatchRecord } from '$lib/models/CatchRecord';
import { type CombinedData } from '$lib/models/CombinedData';
import type { SupabaseClient } from '@supabase/supabase-js';

class CombinedDataRepository {
	constructor(private supabase: SupabaseClient, private userId: string) {}

	// Transform Supabase data to match frontend expectations
	private transformPokedexEntry(entry: any): PokedexEntry {
		return {
			_id: entry.id.toString(),
			pokedexNumber: entry.pokedex_number,
			pokemon: entry.pokemon,
			form: entry.form,
			canGigantamax: entry.can_gigantamax,
			regionToCatchIn: entry.region_to_catch_in,
			gamesToCatchIn: entry.games_to_catch_in || [],
			regionToEvolveIn: entry.region_to_evolve_in,
			evolutionInformation: entry.evolution_information,
			catchInformation: entry.catch_information || [],
			boxPlacementForms: {
				box: entry.box_placement_forms_box,
				row: entry.box_placement_forms_row,
				column: entry.box_placement_forms_column
			},
			boxPlacement: {
				box: entry.box_placement_box,
				row: entry.box_placement_row,
				column: entry.box_placement_column
			}
		};
	}

	private transformCatchRecord(record: any): CatchRecord {
		return {
			_id: record.id,
			userId: record.user_id,
			pokedexEntryId: record.pokedex_entry_id.toString(),
			haveToEvolve: record.have_to_evolve,
			caught: record.caught,
			inHome: record.in_home,
			hasGigantamaxed: record.has_gigantamaxed,
			personalNotes: record.personal_notes
		};
	}

	async findAllCombinedData(
		userId: string,
		enableForms: boolean = true,
		region: string = '',
		game: string = ''
	): Promise<CombinedData[]> {
		let query = this.supabase
			.from('pokedex_entries')
			.select(`
				*,
				catch_records(*)
			`);

		// Apply filters
		if (!enableForms) {
			query = query.not('box_placement_box', 'is', null);
		}

		if (region) {
			query = query.eq('region_to_catch_in', region);
		}

		if (game) {
			query = query.contains('games_to_catch_in', [game]);
		}

		// Order by box placement
		if (enableForms) {
			query = query.order('box_placement_forms_box', { ascending: true })
				.order('box_placement_forms_row', { ascending: true })
				.order('box_placement_forms_column', { ascending: true });
		} else {
			query = query.order('box_placement_box', { ascending: true })
				.order('box_placement_row', { ascending: true })
				.order('box_placement_column', { ascending: true });
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error finding combined data:', error);
			return [];
		}

		// Transform the data and filter catch records by user
		return (data || []).map(entry => {
			const userCatchRecord = Array.isArray(entry.catch_records) 
				? entry.catch_records.find((record: any) => record.user_id === userId)
				: null;

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

		let query = this.supabase
			.from('pokedex_entries')
			.select(`
				*,
				catch_records(*)
			`)
			.range(from, to);

		// Apply filters
		if (!enableForms) {
			query = query.not('box_placement_box', 'is', null);
		}

		if (region) {
			query = query.eq('region_to_catch_in', region);
		}

		if (game) {
			query = query.contains('games_to_catch_in', [game]);
		}

		// Order by box placement
		if (enableForms) {
			query = query.order('box_placement_forms_box', { ascending: true })
				.order('box_placement_forms_row', { ascending: true })
				.order('box_placement_forms_column', { ascending: true });
		} else {
			query = query.order('box_placement_box', { ascending: true })
				.order('box_placement_row', { ascending: true })
				.order('box_placement_column', { ascending: true });
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error finding paginated combined data:', error);
			return [];
		}

		// Transform the data and filter catch records by user
		return (data || []).map(entry => {
			const userCatchRecord = Array.isArray(entry.catch_records) 
				? entry.catch_records.find((record: any) => record.user_id === userId)
				: null;

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
		let query = this.supabase
			.from('pokedex_entries')
			.select('id', { count: 'exact', head: true });

		// Apply same filters as in findCombinedData
		if (!enableForms) {
			query = query.not('box_placement_box', 'is', null);
		}

		if (region) {
			query = query.eq('region_to_catch_in', region);
		}

		if (game) {
			query = query.contains('games_to_catch_in', [game]);
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