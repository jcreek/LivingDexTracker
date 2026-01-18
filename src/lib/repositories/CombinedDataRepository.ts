import { type PokedexEntry, type PokedexEntryDB } from '$lib/models/PokedexEntry';
import { type CatchRecord, type CatchRecordDB } from '$lib/models/CatchRecord';
import { type CombinedData } from '$lib/models/CombinedData';
import type { SupabaseClient } from '@supabase/supabase-js';

class CombinedDataRepository {
	private static readonly MAX_ROWS_PER_REQUEST = 1000;

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
			spriteKey: entry.spriteKey || '',
			canGigantamax: entry.canGigantamax,
			regionToCatchIn: entry.regionToCatchIn || '',
			gamesToCatchIn: entry.gamesToCatchIn || [],
			regionToEvolveIn: entry.regionToEvolveIn || '',
			evolutionInformation: entry.evolutionInformation || '',
			catchInformation: entry.catchInformation || []
			// Note: Regional dex numbers are stored in separate regional_dex_numbers table
		};
	}

	private transformCatchRecord(record: CatchRecordDB): CatchRecord {
		return {
			_id: record.id,
			userId: record.userId,
			pokemonId: record.pokemonId.toString(),
			pokedexId: record.pokedexId,
			haveToEvolve: record.haveToEvolve,
			caught: record.caught,
			inHome: record.inHome,
			hasGigantamaxed: record.hasGigantamaxed,
			personalNotes: record.personalNotes
		};
	}

	private buildEntriesQuery(enableForms: boolean, region: string, game: string) {
		let query = this.supabase.from('pokedex_entries').select('*');

		if (!enableForms) {
			// Filter to base forms: NULL or 'male' (gendered species), plus Unown "A".
			query = query.or('form.is.null,form.eq.male,and(pokemon.eq.Unown,form.eq.A)');
		}

		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		if (game) {
			query = query.contains('gamesToCatchIn', [game]);
		}

		// Stable ordering from the database: national dex, Unown order, base/female/temporal, then form label.
		query = query
			.order('pokedexNumber', { ascending: true })
			.order('unownSortOrder', { ascending: true })
			.order('formSortBucket', { ascending: true })
			.order('formSortRegionOrder', { ascending: true })
			.order('formSortRegionalSub', { ascending: true })
			.order('formSortLabel', { ascending: true });

		return query;
	}

	private buildDexEntriesQuery(dexScopes: string[], enableForms: boolean, region: string) {
		let query = this.supabase.from('game_pokedex_entry_details').select('*').in('dexId', dexScopes);

		if (!enableForms) {
			// Filter to base forms: NULL or 'male' (gendered species), plus Unown "A".
			query = query.or('form.is.null,form.eq.male,and(pokemon.eq.Unown,form.eq.A)');
		}

		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		// Stable ordering: dex order, dex number, Unown order, base/female/temporal, then form label.
		query = query
			.order('dexSortOrder', { ascending: true })
			.order('dexNumber', { ascending: true })
			.order('unownSortOrder', { ascending: true })
			.order('formSortBucket', { ascending: true })
			.order('formSortRegionOrder', { ascending: true })
			.order('formSortRegionalSub', { ascending: true })
			.order('formSortLabel', { ascending: true });

		return query;
	}

	private async fetchAllDexEntries(
		dexScopes: string[],
		enableForms: boolean,
		region: string
	): Promise<PokedexEntryDB[]> {
		if (dexScopes.length === 0) return [];

		const entries: PokedexEntryDB[] = [];
		let start = 0;
		const maxRows = CombinedDataRepository.MAX_ROWS_PER_REQUEST;

		while (true) {
			const end = start + maxRows - 1;
			const { data, error } = await this.buildDexEntriesQuery(dexScopes, enableForms, region).range(
				start,
				end
			);

			if (error) {
				console.error('Error finding dex-scoped combined data:', error);
				return [];
			}

			if (!data || data.length === 0) {
				break;
			}

			entries.push(...data);

			if (data.length < maxRows) {
				break;
			}

			start = end + 1;
		}

		return entries;
	}

	private dedupeEntries(entries: PokedexEntryDB[]): PokedexEntryDB[] {
		const seen = new Set<number>();
		const deduped: PokedexEntryDB[] = [];

		for (const entry of entries) {
			if (seen.has(entry.id)) continue;
			seen.add(entry.id);
			deduped.push(entry);
		}

		return deduped;
	}

	private async fetchEntriesByRange(
		from: number,
		to: number,
		enableForms: boolean,
		region: string,
		game: string
	): Promise<PokedexEntryDB[]> {
		const entries: PokedexEntryDB[] = [];
		let start = from;
		const maxRows = CombinedDataRepository.MAX_ROWS_PER_REQUEST;

		while (start <= to) {
			const end = Math.min(to, start + maxRows - 1);
			const { data, error } = await this.buildEntriesQuery(enableForms, region, game).range(
				start,
				end
			);

			if (error) {
				console.error('Error finding paginated combined data:', error);
				return [];
			}

			if (!data || data.length === 0) {
				break;
			}

			entries.push(...data);

			if (data.length < end - start + 1) {
				break;
			}

			start = end + 1;
		}

		return entries;
	}

	private async fetchAllEntries(
		enableForms: boolean,
		region: string,
		game: string
	): Promise<PokedexEntryDB[]> {
		const entries: PokedexEntryDB[] = [];
		let start = 0;
		const maxRows = CombinedDataRepository.MAX_ROWS_PER_REQUEST;

		while (true) {
			const end = start + maxRows - 1;
			const { data, error } = await this.buildEntriesQuery(enableForms, region, game).range(
				start,
				end
			);

			if (error) {
				console.error('Error finding combined data:', error);
				return [];
			}

			if (!data || data.length === 0) {
				break;
			}

			entries.push(...data);

			if (data.length < maxRows) {
				break;
			}

			start = end + 1;
		}

		return entries;
	}

	private async fetchCatchRecords(entryIds: number[], userId: string): Promise<CatchRecordDB[]> {
		if (!this.pokedexId) return [];
		if (entryIds.length === 0) return [];

		const records: CatchRecordDB[] = [];
		const chunkSize = 1000;

		for (let i = 0; i < entryIds.length; i += chunkSize) {
			const chunk = entryIds.slice(i, i + chunkSize);
			const { data, error } = await this.supabase
				.from('catch_records')
				.select('*')
				.eq('userId', userId)
				.eq('pokedexId', this.pokedexId)
				.in('pokemonId', chunk);

			if (error) {
				console.error('Error loading catch records:', error);
				continue;
			}

			if (data) {
				records.push(...data);
			}
		}

		return records;
	}

	async findAllCombinedData(
		userId: string,
		enableForms: boolean = true,
		region: string = '',
		game: string = '',
		dexScopes: string[] = []
	): Promise<CombinedData[]> {
		const entries =
			dexScopes.length > 0
				? this.dedupeEntries(await this.fetchAllDexEntries(dexScopes, enableForms, region))
				: await this.fetchAllEntries(enableForms, region, game);

		if (!entries || entries.length === 0) {
			return [];
		}

		// Get catch records for all entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId && this.pokedexId) {
			const entryIds = entries.map((entry) => entry.id);
			catchRecords = await this.fetchCatchRecords(entryIds, userId);
		}

		// Combine the data exactly like master branch
		const combinedData = entries.map((entry) => {
			const userCatchRecord = catchRecords.find((record) => record.pokemonId === entry.id) || null;

			const transformedEntry = this.transformPokedexEntry(entry);
			const transformedCatchRecord = userCatchRecord
				? this.transformCatchRecord(userCatchRecord)
				: null;

			return {
				pokedexEntry: transformedEntry,
				catchRecord: transformedCatchRecord
			};
		});

		// Box placement is calculated dynamically on the frontend based on the current sort order.
		return combinedData;
	}

	async findCombinedData(
		userId: string,
		page: number = 1,
		limit: number = 20,
		enableForms: boolean = true,
		region: string = '',
		game: string = '',
		dexScopes: string[] = []
	): Promise<CombinedData[]> {
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		const entries =
			dexScopes.length > 0
				? this.dedupeEntries(await this.fetchAllDexEntries(dexScopes, enableForms, region)).slice(
						from,
						to + 1
				  )
				: await this.fetchEntriesByRange(from, to, enableForms, region, game);

		if (!entries || entries.length === 0) {
			return [];
		}

		// Get catch records for these entries
		let catchRecords: CatchRecordDB[] = [];
		if (userId && this.pokedexId) {
			const entryIds = entries.map((entry) => entry.id);
			catchRecords = await this.fetchCatchRecords(entryIds, userId);
		}

		// Combine the data exactly like master branch
		const combinedData = entries.map((entry) => {
			const userCatchRecord = catchRecords.find((record) => record.pokemonId === entry.id) || null;

			const transformedEntry = this.transformPokedexEntry(entry);
			const transformedCatchRecord = userCatchRecord
				? this.transformCatchRecord(userCatchRecord)
				: null;

			return {
				pokedexEntry: transformedEntry,
				catchRecord: transformedCatchRecord
			};
		});

		// Box placement is calculated dynamically on the frontend based on the current sort order.
		return combinedData;
	}

	async countCombinedData(
		enableForms: boolean,
		region: string,
		game: string,
		dexScopes: string[] = []
	): Promise<number> {
		if (dexScopes.length > 0) {
			const entries = this.dedupeEntries(
				await this.fetchAllDexEntries(dexScopes, enableForms, region)
			);
			return entries.length;
		}

		let query = this.supabase.from('pokedex_entries').select('id', { count: 'exact', head: true });

		// Apply same filters as in findCombinedData
		if (!enableForms) {
			// Filter to base forms: NULL or 'male' (gendered species), plus Unown "A".
			query = query.or('form.is.null,form.eq.male,and(pokemon.eq.Unown,form.eq.A)');
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
