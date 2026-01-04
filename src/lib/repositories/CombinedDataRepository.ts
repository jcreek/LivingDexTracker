import { type PokedexEntry, type PokedexEntryDB } from '$lib/models/PokedexEntry';
import { type CatchRecord, type CatchRecordDB } from '$lib/models/CatchRecord';
import { type CombinedData } from '$lib/models/CombinedData';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getRegionalDexColumnName } from '$lib/utils/regionalDexMapping';

class CombinedDataRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string | null,
		private pokedexId: string | null
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
			kantoDexNumber: entry.kanto_dex_number ?? undefined,
			johtoDexNumber: entry.johto_dex_number ?? undefined,
			hoennDexNumber: entry.hoenn_dex_number ?? undefined,
			sinnohDexNumber: entry.sinnoh_dex_number ?? undefined,
			unovaBwDexNumber: entry.unova_bw_dex_number ?? undefined,
			unovaB2w2DexNumber: entry.unova_b2w2_dex_number ?? undefined,
			kalosCentralDexNumber: entry.kalos_central_dex_number ?? undefined,
			kalosCoastalDexNumber: entry.kalos_coastal_dex_number ?? undefined,
			kalosMountainDexNumber: entry.kalos_mountain_dex_number ?? undefined,
			alolaSmDexNumber: entry.alola_sm_dex_number ?? undefined,
			alolaUsumDexNumber: entry.alola_usum_dex_number ?? undefined,
			galarDexNumber: entry.galar_dex_number ?? undefined,
			galarIsleOfArmorDexNumber: entry.galar_isle_of_armor_dex_number ?? undefined,
			galarCrownTundraDexNumber: entry.galar_crown_tundra_dex_number ?? undefined,
			hisuiDexNumber: entry.hisui_dex_number ?? undefined,
			paldeaDexNumber: entry.paldea_dex_number ?? undefined
		};
	}

	private transformCatchRecord(record: CatchRecordDB): CatchRecord {
		return {
			_id: record.id,
			userId: record.userId,
			pokedexEntryId: record.pokedexEntryId.toString(),
			pokedexId: record.pokedexId,
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

		// Determine ordering strategy based on game filter
		if (game) {
			const regionalColumn = getRegionalDexColumnName(game);
			if (regionalColumn) {
				// Order by regional dex with national dex fallback for NULLs
				query = query
					.order(regionalColumn, { ascending: true, nullsFirst: false })
					.order('pokedexNumber', { ascending: true });
			} else {
				// Game specified but has no regional dex mapping
				query = query.order('pokedexNumber', { ascending: true });
			}
		} else {
			// No game filter - use pre-calculated box placement (national dex order)
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
		if (userId && this.pokedexId) {
			const entryIds = entries.map((entry) => entry.id);
			const { data: records, error: recordsError } = await this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.eq('pokedexId', this.pokedexId)
				.in('pokedexEntryId', entryIds);

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data exactly like master branch
		const combinedData = entries.map((entry) => {
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

		// Recalculate box placement if using regional dex ordering
		if (game && getRegionalDexColumnName(game)) {
			return this.recalculateBoxPlacement(combinedData, enableForms);
		}
		return combinedData;
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

		// Determine ordering strategy based on game filter
		if (game) {
			const regionalColumn = getRegionalDexColumnName(game);
			if (regionalColumn) {
				// Order by regional dex with national dex fallback for NULLs
				query = query
					.order(regionalColumn, { ascending: true, nullsFirst: false })
					.order('pokedexNumber', { ascending: true });
			} else {
				// Game specified but has no regional dex mapping
				query = query.order('pokedexNumber', { ascending: true });
			}
		} else {
			// No game filter - use pre-calculated box placement (national dex order)
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
		if (userId && this.pokedexId) {
			const entryIds = entries.map((entry) => entry.id);
			const { data: records, error: recordsError } = await this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.eq('pokedexId', this.pokedexId)
				.in('pokedexEntryId', entryIds);

			if (!recordsError && records) {
				catchRecords = records;
			}
		}

		// Combine the data exactly like master branch
		const combinedData = entries.map((entry) => {
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

		// Recalculate box placement if using regional dex ordering
		if (game && getRegionalDexColumnName(game)) {
			return this.recalculateBoxPlacement(combinedData, enableForms);
		}
		return combinedData;
	}

	async countCombinedData(
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

	/**
	 * Recalculates box placement based on the current order of data.
	 * Used when ordering by regional dex instead of pre-calculated national dex placement.
	 */
	private recalculateBoxPlacement(
		data: CombinedData[],
		useFormsPlacement: boolean
	): CombinedData[] {
		return data.map((item, index) => {
			const placementIndex = index + 1; // 1-based indexing
			const box = Math.ceil(placementIndex / 30);
			const rowColumnIndex = (placementIndex - 1) % 30;
			const row = Math.floor(rowColumnIndex / 6) + 1;
			const column = (rowColumnIndex % 6) + 1;

			const newPlacement = { box, row, column };

			return {
				...item,
				pokedexEntry: {
					...item.pokedexEntry,
					...(useFormsPlacement
						? { boxPlacementForms: newPlacement }
						: { boxPlacement: newPlacement })
				}
			};
		});
	}
}

export default CombinedDataRepository;
