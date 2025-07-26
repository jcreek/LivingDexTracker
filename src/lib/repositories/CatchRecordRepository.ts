import type { CatchRecord } from '$lib/models/CatchRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

class CatchRecordRepository {
	constructor(private supabase: SupabaseClient, private userId: string) {}

	// Transform Supabase snake_case to frontend camelCase
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

	// Transform frontend camelCase to Supabase snake_case
	private transformToDatabase(data: Partial<CatchRecord>): any {
		const dbData: any = {};
		if (data.pokedexEntryId !== undefined && data.pokedexEntryId !== null) {
			dbData.pokedex_entry_id = Number(data.pokedexEntryId);
		}
		if (data.haveToEvolve !== undefined) dbData.have_to_evolve = data.haveToEvolve;
		if (data.caught !== undefined) dbData.caught = data.caught;
		if (data.inHome !== undefined) dbData.in_home = data.inHome;
		if (data.hasGigantamaxed !== undefined) dbData.has_gigantamaxed = data.hasGigantamaxed;
		if (data.personalNotes !== undefined) dbData.personal_notes = data.personalNotes;
		
		return dbData;
	}

	async findById(id: string): Promise<CatchRecord | null> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('id', id)
			.eq('user_id', this.userId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}

	async findAll(): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('user_id', this.userId);

		if (error || !data) return [];
		return data.map(record => this.transformCatchRecord(record));
	}

	async findByUserId(userId: string): Promise<CatchRecord[]> {
		return this.findAll(); // Already filtered by user in constructor
	}

	async create(data: Partial<CatchRecord>): Promise<CatchRecord> {
		const dbData = {
			user_id: this.userId,
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
			.eq('user_id', this.userId)
			.select()
			.single();

		if (error || !result) return null;
		return this.transformCatchRecord(result);
	}

	async delete(id: string): Promise<void> {
		await this.supabase
			.from('catch_records')
			.delete()
			.eq('id', id)
			.eq('user_id', this.userId);
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
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('user_id', userId)
			.eq('pokedex_entry_id', pokedexEntryId)
			.single();

		if (error || !data) return null;
		return this.transformCatchRecord(data);
	}
}

export default CatchRecordRepository;
