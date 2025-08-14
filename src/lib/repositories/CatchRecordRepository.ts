import { BaseRepository } from './BaseRepository';
import type { CatchRecord } from '$lib/types';

export class CatchRecordRepository extends BaseRepository {
	async getByUserPokedex(userPokedexId: string): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('pokedex_id', userPokedexId)
			.order('"pokedexEntryId"', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getByPokedexEntry(
		userPokedexId: string,
		pokedexEntryId: number
	): Promise<CatchRecord | null> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('pokedex_id', userPokedexId)
			.eq('"pokedexEntryId"', pokedexEntryId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}
		return this.toCamelCase(data);
	}

	async create(record: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatchRecord> {
		// Convert field names to match database schema
		const dbData = {
			userId: record.userId, // User ID for RLS
			pokedexEntryId: record.pokedexEntryId,  
			pokedex_id: record.userPokedexId, // Pokédex ID
			caught: record.caught,
			haveToEvolve: record.haveToEvolve,
			inHome: record.inHome,
			hasGigantamaxed: record.hasGigantamaxed,
			personalNotes: record.personalNotes
		};

		// Remove undefined fields
		Object.keys(dbData).forEach(key => {
			if (dbData[key] === undefined) {
				delete dbData[key];
			}
		});

		const { data, error } = await this.supabase
			.from('catch_records')
			.insert(dbData)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async update(id: string, updates: Partial<CatchRecord>): Promise<CatchRecord> {
		// Convert field names to match database schema  
		const dbData: any = {};
		
		if (updates.userId !== undefined) dbData.userId = updates.userId;
		if (updates.userPokedexId !== undefined) dbData.pokedex_id = updates.userPokedexId;
		if (updates.pokedexEntryId !== undefined) dbData.pokedexEntryId = updates.pokedexEntryId;
		if (updates.caught !== undefined) dbData.caught = updates.caught;
		if (updates.haveToEvolve !== undefined) dbData.haveToEvolve = updates.haveToEvolve;
		if (updates.inHome !== undefined) dbData.inHome = updates.inHome;
		if (updates.hasGigantamaxed !== undefined) dbData.hasGigantamaxed = updates.hasGigantamaxed;
		if (updates.personalNotes !== undefined) dbData.personalNotes = updates.personalNotes;

		const { data, error } = await this.supabase
			.from('catch_records')
			.update({
				...dbData,
				updatedAt: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async upsert(record: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatchRecord> {
		// Convert field names to match database schema
		// Some fields remain camelCase (with quotes in DB), others become snake_case
		const dbData = {
			userId: record.userId, // Maps to "userId" column for RLS
			pokedexEntryId: record.pokedexEntryId, // Maps to "pokedexEntryId" column  
			pokedex_id: record.userPokedexId, // Maps to pokedex_id column
			caught: record.caught,
			haveToEvolve: record.haveToEvolve, // Maps to "haveToEvolve" column
			inHome: record.inHome, // Maps to "inHome" column
			hasGigantamaxed: record.hasGigantamaxed, // Maps to "hasGigantamaxed" column
			personalNotes: record.personalNotes // Maps to "personalNotes" column
		};

		// Remove undefined fields to avoid database errors
		Object.keys(dbData).forEach(key => {
			if (dbData[key] === undefined) {
				delete dbData[key];
			}
		});

		const { data, error } = await this.supabase
			.from('catch_records')
			.upsert(dbData, {
				onConflict: '"userId","pokedexEntryId",pokedex_id'
			})
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async batchUpsert(
		records: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>[]
	): Promise<CatchRecord[]> {
		const dbData = records.map((record) => {
			const converted = {
				userId: record.userId, // User ID for RLS
				pokedexEntryId: record.pokedexEntryId,  
				pokedex_id: record.userPokedexId, // Pokédex ID
				caught: record.caught,
				haveToEvolve: record.haveToEvolve,
				inHome: record.inHome,
				hasGigantamaxed: record.hasGigantamaxed,
				personalNotes: record.personalNotes
			};

			// Remove undefined fields
			Object.keys(converted).forEach(key => {
				if (converted[key] === undefined) {
					delete converted[key];
				}
			});

			return converted;
		});

		const { data, error } = await this.supabase
			.from('catch_records')
			.upsert(dbData, {
				onConflict: '"userId","pokedexEntryId",pokedex_id'
			})
			.select();

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async delete(id: string): Promise<void> {
		const { error } = await this.supabase.from('catch_records').delete().eq('id', id);

		if (error) this.handleError(error);
	}

	async toggleCatchStatus(id: string): Promise<CatchRecord> {
		// First get the current record
		const { data: current, error: fetchError } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError) this.handleError(fetchError);

		const currentStatus = current.catch_status;
		let newStatus: string;

		// Cycle through statuses
		switch (currentStatus) {
			case 'not_caught':
				newStatus = 'caught';
				break;
			case 'caught':
				newStatus = 'ready_to_evolve';
				break;
			default:
				newStatus = 'not_caught';
		}

		const { data, error } = await this.supabase
			.from('catch_records')
			.update({
				catch_status: newStatus,
				caught: newStatus !== 'not_caught',
				updatedAt: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}
}
