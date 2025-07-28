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

		// Apply regional pokédx filtering
		if (regionalPokedexName !== 'national') {
			const columnMap: Record<string, string> = {
				kanto: 'kanto_number',
				johto: 'johto_number',
				hoenn: 'hoenn_number',
				sinnoh: 'sinnoh_number',
				'sinnoh-extended': 'sinnoh_extended_number',
				unova: 'unova_number',
				'unova-updated': 'unova_updated_number',
				'kalos-central': 'kalos_central_number',
				'kalos-coastal': 'kalos_coastal_number',
				'kalos-mountain': 'kalos_mountain_number',
				'hoenn-updated': 'hoenn_updated_number',
				alola: 'alola_number',
				'alola-updated': 'alola_updated_number',
				melemele: 'melemele_number',
				akala: 'akala_number',
				ulaula: 'ulaula_number',
				poni: 'poni_number',
				galar: 'galar_number',
				'isle-armor': 'isle_armor_number',
				'crown-tundra': 'crown_tundra_number',
				hisui: 'hisui_number',
				paldea: 'paldea_number',
				kitakami: 'kitakami_number',
				blueberry: 'blueberry_number'
			};

			const columnName = columnMap[regionalPokedexName];
			if (columnName) {
				query = query.not(columnName, 'is', null);
			}
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
		game: string = '',
		pokedexId: string = '',
		regionalPokedexName: string = 'national',
		gameScope: string = 'all_games',
		generation: string = ''
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

		// Apply regional pokédx filtering
		if (regionalPokedexName !== 'national') {
			const columnMap: Record<string, string> = {
				kanto: 'kanto_number',
				johto: 'johto_number',
				hoenn: 'hoenn_number',
				sinnoh: 'sinnoh_number',
				'sinnoh-extended': 'sinnoh_extended_number',
				unova: 'unova_number',
				'unova-updated': 'unova_updated_number',
				'kalos-central': 'kalos_central_number',
				'kalos-coastal': 'kalos_coastal_number',
				'kalos-mountain': 'kalos_mountain_number',
				'hoenn-updated': 'hoenn_updated_number',
				alola: 'alola_number',
				'alola-updated': 'alola_updated_number',
				melemele: 'melemele_number',
				akala: 'akala_number',
				ulaula: 'ulaula_number',
				poni: 'poni_number',
				galar: 'galar_number',
				'isle-armor': 'isle_armor_number',
				'crown-tundra': 'crown_tundra_number',
				hisui: 'hisui_number',
				paldea: 'paldea_number',
				kitakami: 'kitakami_number',
				blueberry: 'blueberry_number'
			};

			const columnName = columnMap[regionalPokedexName];
			if (columnName) {
				query = query.not(columnName, 'is', null);
			}
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

	async countCombinedData(enableForms: boolean, region: string, game: string): Promise<number> {
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
