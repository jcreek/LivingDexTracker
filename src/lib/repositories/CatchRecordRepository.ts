import type { CatchRecord, CatchRecordDB } from '$lib/models/CatchRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

class CatchRecordRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string
	) {}

	// Transform Supabase data to frontend format (minimal transformation)
	private transformCatchRecord(record: CatchRecordDB): CatchRecord {
		return {
			_id: record.id,
			userId: record.userId,
			pokedexEntryId: record.pokedexEntryId.toString(),
			pokedexId: record.pokedex_id, // NEW FIELD
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
		if (data.pokedexEntryId !== undefined && data.pokedexEntryId !== null) {
			const numericId = Number(data.pokedexEntryId);
			if (isNaN(numericId)) {
				throw new Error(`Invalid pokedexEntryId: ${data.pokedexEntryId}`);
			}
			dbData.pokedexEntryId = numericId;
		}
		if (data.pokedexId !== undefined && data.pokedexId !== null && data.pokedexId !== '') {
			dbData.pokedex_id = data.pokedexId; // NEW FIELD
		}
		if (data.haveToEvolve !== undefined) dbData.haveToEvolve = data.haveToEvolve;
		if (data.caught !== undefined) dbData.caught = data.caught;
		if (data.inHome !== undefined) dbData.inHome = data.inHome;
		if (data.hasGigantamaxed !== undefined) dbData.hasGigantamaxed = data.hasGigantamaxed;
		if (data.personalNotes !== undefined) dbData.personalNotes = data.personalNotes;

		return dbData;
	}

	async findById(id: string): Promise<CatchRecord | null> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('id', id)
			.eq('userId', this.userId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}

	async findAll(): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', this.userId);

		if (error || !data) return [];
		return data.map((record) => this.transformCatchRecord(record));
	}

	async findByUserId(userId: string): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', userId);

		if (error || !data) return [];
		return data.map((record) => this.transformCatchRecord(record));
	}

	async create(data: Partial<CatchRecord>): Promise<CatchRecord> {
		const dbData = {
			userId: this.userId,
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
			.eq('userId', this.userId);

		if (error) {
			console.error('Error deleting catch record:', error);
			throw new Error(`Failed to delete catch record: ${error.message}`);
		}
	}

	async upsert(data: Partial<CatchRecord>): Promise<CatchRecord | null> {
		if (data._id) {
			return this.update(data._id, data);
		} else if (data.pokedexEntryId) {
			// Try to find existing record for this user and pokemon
			const existing = await this.findByUserAndPokemon(this.userId, data.pokedexEntryId);
			if (existing) {
				return this.update(existing._id, data);
			} else {
				return this.create(data);
			}
		}
		return this.create(data);
	}

	async findByUserAndPokemon(userId: string, pokedexEntryId: string): Promise<CatchRecord | null> {
		const numericId = Number(pokedexEntryId);
		if (isNaN(numericId)) {
			return null;
		}
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', userId)
			.eq('pokedexEntryId', numericId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}

	async findByPokedexId(pokedexId: string): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('userId', this.userId)
			.eq('pokedex_id', pokedexId);

		if (error || !data) return [];
		return data.map((record) => this.transformCatchRecord(record));
	}
}

export default CatchRecordRepository;
