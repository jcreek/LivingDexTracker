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
			},
			// Regional pokédex numbers
			kantoNumber: entry.kanto_number || undefined,
			johtoNumber: entry.johto_number || undefined,
			hoennNumber: entry.hoenn_number || undefined,
			sinnohNumber: entry.sinnoh_number || undefined,
			sinnohExtendedNumber: entry.sinnoh_extended_number || undefined,
			unovaNumber: entry.unova_number || undefined,
			unovaUpdatedNumber: entry.unova_updated_number || undefined,
			kalosCentralNumber: entry.kalos_central_number || undefined,
			kalosCoastalNumber: entry.kalos_coastal_number || undefined,
			kalosMountainNumber: entry.kalos_mountain_number || undefined,
			hoennUpdatedNumber: entry.hoenn_updated_number || undefined,
			alolaNumber: entry.alola_number || undefined,
			alolaUpdatedNumber: entry.alola_updated_number || undefined,
			melemeleNumber: entry.melemele_number || undefined,
			akalaNumber: entry.akala_number || undefined,
			ulaulaNumber: entry.ulaula_number || undefined,
			poniNumber: entry.poni_number || undefined,
			galarNumber: entry.galar_number || undefined,
			isleArmorNumber: entry.isle_armor_number || undefined,
			crownTundraNumber: entry.crown_tundra_number || undefined,
			hisuiNumber: entry.hisui_number || undefined,
			paldeaNumber: entry.paldea_number || undefined,
			kitakamiNumber: entry.kitakami_number || undefined,
			blueberryNumber: entry.blueberry_number || undefined
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
		game: string = '',
		pokedexId: string = '',
		regionalPokedexName: string = 'national',
		gameScope: string = 'all_games',
		generation: string = ''
	): Promise<CombinedData[]> {
		let entries: any[] = [];
		let entriesError: any = null;

		if (regionalPokedexName !== 'national') {
			// Query regional pokédx entries with joined pokédx data
			const { data, error } = await this.supabase
				.from('regional_pokedex_entries')
				.select(
					`
					regional_number,
					pokedex_entries(*)
				`
				)
				.eq('regional_pokedex_name', regionalPokedexName)
				.order('regional_number', { ascending: true });

			if (error) {
				console.error('Error finding regional combined data:', error);
				return [];
			}

			// Extract the pokédx entries from the joined data
			entries =
				data?.map((item) => ({
					...item.pokedex_entries,
					regionalNumber: item.regional_number
				})) || [];
		} else {
			// Query all pokédx entries for national dex
			let query = this.supabase.from('pokedex_entries').select('*');

			// Order by pokédx number for national dex since box placement data isn't populated
			query = query.order('pokedexNumber', { ascending: true });

			const { data, error } = await query;
			entries = data || [];
			entriesError = error;
		}

		if (entriesError) {
			console.error('Error finding combined data:', entriesError);
			return [];
		}

		if (!entries || entries.length === 0) {
			return [];
		}

		// Apply additional filters
		// Box placement filtering is disabled for now since our data doesn't populate these fields
		// if (!enableForms && regionalPokedexName === 'national') {
		// 	entries = entries.filter(entry => entry.boxPlacementBox !== null);
		// }

		if (region) {
			entries = entries.filter((entry) => entry.regionToCatchIn === region);
		}

		if (game) {
			entries = entries.filter(
				(entry) => entry.gamesToCatchIn && entry.gamesToCatchIn.includes(game)
			);
		}

		// Get catch records for all entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId && entries.length > 0) {
			const entryIds = entries.map((entry) => entry.id);
			let recordsQuery = this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.in('pokedexEntryId', entryIds);

			// Filter by pokédx ID if provided
			if (pokedexId) {
				recordsQuery = recordsQuery.eq('pokedex_id', pokedexId);
			}

			const { data: records, error: recordsError } = await recordsQuery;

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data
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
		game: string = '',
		pokedexId: string = '',
		regionalPokedexName: string = 'national',
		gameScope: string = 'all_games',
		generation: string = ''
	): Promise<CombinedData[]> {
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		let entries: any[] = [];
		let entriesError: any = null;

		if (regionalPokedexName !== 'national') {
			// Query regional pokédx entries with joined pokédx data
			const { data, error } = await this.supabase
				.from('regional_pokedex_entries')
				.select(
					`
					regional_number,
					pokedex_entries(*)
				`
				)
				.eq('regional_pokedex_name', regionalPokedexName)
				.order('regional_number', { ascending: true })
				.range(from, to);

			if (error) {
				console.error('Error finding regional paginated data:', error);
				return [];
			}

			// Extract the pokédx entries from the joined data
			entries =
				data?.map((item) => ({
					...item.pokedex_entries,
					regionalNumber: item.regional_number
				})) || [];
		} else {
			// Query pokédx entries for national dex with pagination
			let query = this.supabase.from('pokedex_entries').select('*').range(from, to);

			// Apply filters for national dex
			// Box placement filtering is disabled for now since our data doesn't populate these fields
			// if (!enableForms) {
			// 	query = query.not('boxPlacementBox', 'is', null);
			// }

			// Order by pokédx number for national dex since box placement data isn't populated
			query = query.order('pokedexNumber', { ascending: true });

			const { data, error } = await query;
			entries = data || [];
			entriesError = error;
		}

		if (entriesError) {
			console.error('Error finding paginated combined data:', entriesError);
			return [];
		}

		if (!entries || entries.length === 0) {
			return [];
		}

		// Apply additional filters (only for regional pokédxes, national dex filters are applied in query)
		if (regionalPokedexName !== 'national') {
			if (region) {
				entries = entries.filter((entry) => entry.regionToCatchIn === region);
			}

			if (game) {
				entries = entries.filter(
					(entry) => entry.gamesToCatchIn && entry.gamesToCatchIn.includes(game)
				);
			}
		}

		// Get catch records for these entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId && entries.length > 0) {
			const entryIds = entries.map((entry) => entry.id);
			let recordsQuery = this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.in('pokedexEntryId', entryIds);

			// Filter by pokédx ID if provided
			if (pokedexId) {
				recordsQuery = recordsQuery.eq('pokedex_id', pokedexId);
			}

			const { data: records, error: recordsError } = await recordsQuery;

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data
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
		enableForms: boolean,
		region: string,
		game: string,
		regionalPokedexName: string = 'national'
	): Promise<number> {
		if (regionalPokedexName !== 'national') {
			// Count regional pokédx entries
			let query = this.supabase
				.from('regional_pokedex_entries')
				.select('pokedex_entries(*)', { count: 'exact', head: true })
				.eq('regional_pokedex_name', regionalPokedexName);

			const { count, error } = await query;

			if (error) {
				console.error('Error counting regional combined data:', error);
				return 0;
			}

			return count || 0;
		} else {
			// Count national pokédx entries
			let query = this.supabase
				.from('pokedex_entries')
				.select('id', { count: 'exact', head: true });

			// Apply same filters as in findCombinedData
			// Box placement filtering is disabled for now since our data doesn't populate these fields
			// if (!enableForms) {
			// 	query = query.not('boxPlacementBox', 'is', null);
			// }

			if (region) {
				query = query.eq('regionToCatchIn', region);
			}

			if (game) {
				query = query.contains('gamesToCatchIn', [game]);
			}

			const { count, error } = await query;

			if (error) {
				console.error('Error counting national combined data:', error);
				return 0;
			}

			return count || 0;
		}
	}
}

export default CombinedDataRepository;
