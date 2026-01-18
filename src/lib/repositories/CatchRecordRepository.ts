import type { CatchRecord, CatchRecordDB } from '$lib/models/CatchRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

class CatchRecordRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string,
		private pokedexId: string
	) {}

	// Transform Supabase data to frontend format (minimal transformation)
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

	// Transform frontend data to database format (minimal transformation)
	private transformToDatabase(data: Partial<CatchRecord>): Partial<CatchRecordDB> {
		const dbData: Partial<CatchRecordDB> = {};
		if (data.pokemonId !== undefined && data.pokemonId !== null) {
			const numericId = Number(data.pokemonId);
			if (isNaN(numericId)) {
				throw new Error(`Invalid pokemonId: ${data.pokemonId}`);
			}
			dbData.pokemonId = numericId;
		}
		if (data.pokedexId !== undefined) dbData.pokedexId = data.pokedexId;
		if (data.haveToEvolve !== undefined) dbData.haveToEvolve = data.haveToEvolve;
		if (data.caught !== undefined) dbData.caught = data.caught;
		if (data.inHome !== undefined) dbData.inHome = data.inHome;
		if (data.hasGigantamaxed !== undefined) dbData.hasGigantamaxed = data.hasGigantamaxed;
		if (data.personalNotes !== undefined) dbData.personalNotes = data.personalNotes;

		return dbData;
	}

	/**
	 * Bulk upsert catch records in a single request when possible.
	 *
	 * Requires a unique constraint matching the `onConflict` columns.
	 * If the database is not configured with that constraint, the caller should
	 * catch the error and fall back to per-record upserts.
	 */
	async bulkUpsert(
		records: Array<PartialExcept<CatchRecord, 'pokemonId'>>
	): Promise<CatchRecord[]> {
		if (records.length === 0) return [];

		const dbRows: Partial<CatchRecordDB>[] = records.map((r, index) => {
			if (r.pokemonId === undefined || r.pokemonId === null || r.pokemonId === '') {
				throw new Error(
					`CatchRecordRepository.bulkUpsert: record at index ${index} is missing required field "pokemonId"`
				);
			}

			// Preserve repository scoping; if a caller supplies ids, they must match the repo scope.
			if (r.userId !== undefined && r.userId !== this.userId) {
				throw new Error(
					`CatchRecordRepository.bulkUpsert: record at index ${index} has userId "${r.userId}" but repository is scoped to "${this.userId}"`
				);
			}
			if (r.pokedexId !== undefined && r.pokedexId !== this.pokedexId) {
				throw new Error(
					`CatchRecordRepository.bulkUpsert: record at index ${index} has pokedexId "${r.pokedexId}" but repository is scoped to "${this.pokedexId}"`
				);
			}

			const mapped = this.transformToDatabase(r);
			// Enforce repo scope after mapping so per-record input cannot override it.
			mapped.userId = this.userId;
			mapped.pokedexId = this.pokedexId;

			if (mapped.pokemonId === undefined || mapped.pokemonId === null) {
				throw new Error(
					`CatchRecordRepository.bulkUpsert: record at index ${index} produced no pokemonId after transform`
				);
			}

			return mapped;
		});

		const { data: result, error } = await this.supabase
			.from('catch_records')
			.upsert(dbRows, {
				onConflict: '"userId","pokedexId","pokemonId"'
			})
			.select();

		if (error) {
			console.error('Supabase error bulk upserting catch records:', error);
			throw new Error(`Failed to bulk upsert catch records: ${error.message}`);
		}

		return (result ?? []).map((row) => this.transformCatchRecord(row));
	}

	async findById(id: string): Promise<CatchRecord | null> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('id', id)
			.eq('userId', this.userId)
			.eq('pokedexId', this.pokedexId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}

	async findAll(): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', this.userId)
			.eq('pokedexId', this.pokedexId);

		if (error || !data) return [];
		return data.map((record) => this.transformCatchRecord(record));
	}

	async findByUserId(userId: string): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', userId)
			.eq('pokedexId', this.pokedexId);

		if (error || !data) return [];
		return data.map((record) => this.transformCatchRecord(record));
	}

	async create(data: Partial<CatchRecord>): Promise<CatchRecord> {
		const dbData = {
			userId: this.userId,
			pokedexId: this.pokedexId,
			...this.transformToDatabase(data)
		};

		const { data: result, error } = await this.supabase
			.from('catch_records')
			.insert(dbData)
			.select()
			.single();

		if (error) {
			console.error('Supabase error creating catch record:', error);
			throw new Error(`Failed to create catch record: ${error.message}`);
		}

		if (!result) {
			throw new Error('Failed to create catch record: No result returned');
		}

		return this.transformCatchRecord(result);
	}

	async update(id: string, data: Partial<CatchRecord>): Promise<CatchRecord | null> {
		const dbData = this.transformToDatabase(data);

		const { data: result, error } = await this.supabase
			.from('catch_records')
			.update(dbData)
			.eq('id', id)
			.eq('userId', this.userId)
			.eq('pokedexId', this.pokedexId)
			.select()
			.single();

		if (error || !result) return null;
		return this.transformCatchRecord(result);
	}

	async delete(id: string): Promise<void> {
		const { error } = await this.supabase
			.from('catch_records')
			.delete()
			.eq('id', id)
			.eq('userId', this.userId)
			.eq('pokedexId', this.pokedexId);

		if (error) {
			console.error('Error deleting catch record:', error);
			throw new Error(`Failed to delete catch record: ${error.message}`);
		}
	}

	async upsert(data: Partial<CatchRecord>): Promise<CatchRecord | null> {
		if (data._id) {
			return this.update(data._id, data);
		} else if (data.pokemonId) {
			// Try to find existing record for this user, pokemon, and pokedex
			const existing = await this.findByUserAndPokemon(this.userId, data.pokemonId, this.pokedexId);
			if (existing) {
				return this.update(existing._id, data);
			} else {
				return this.create(data);
			}
		}
		return this.create(data);
	}

	async findByUserAndPokemon(
		userId: string,
		pokemonId: string,
		pokedexId: string
	): Promise<CatchRecord | null> {
		const numericId = Number(pokemonId);
		if (isNaN(numericId)) {
			return null;
		}
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', userId)
			.eq('pokemonId', numericId)
			.eq('pokedexId', pokedexId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}
}

export default CatchRecordRepository;
