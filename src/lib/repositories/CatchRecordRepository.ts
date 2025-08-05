import { BaseRepository } from './BaseRepository';
import type { CatchRecord } from '$lib/types';

export class CatchRecordRepository extends BaseRepository {
	async getByUserPokedex(userPokedexId: string): Promise<CatchRecord[]> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('user_pokedex_id', userPokedexId)
			.order('pokedex_entry_id', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getByPokedexEntry(userPokedexId: string, pokedexEntryId: number): Promise<CatchRecord | null> {
		const { data, error } = await this.supabase
			.from('catch_records')
			.select('*')
			.eq('user_pokedex_id', userPokedexId)
			.eq('pokedex_entry_id', pokedexEntryId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}
		return this.toCamelCase(data);
	}

	async create(record: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatchRecord> {
		const dbData = this.toSnakeCase(record);
		
		const { data, error } = await this.supabase
			.from('catch_records')
			.insert(dbData)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async update(id: string, updates: Partial<CatchRecord>): Promise<CatchRecord> {
		const dbData = this.toSnakeCase(updates);
		delete dbData.id;
		delete dbData.created_at;
		
		const { data, error } = await this.supabase
			.from('catch_records')
			.update({
				...dbData,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async upsert(record: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatchRecord> {
		const dbData = this.toSnakeCase(record);
		
		const { data, error } = await this.supabase
			.from('catch_records')
			.upsert(dbData, {
				onConflict: 'user_pokedex_id,pokedex_entry_id'
			})
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}

	async batchUpsert(records: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CatchRecord[]> {
		const dbData = records.map(record => this.toSnakeCase(record));
		
		const { data, error } = await this.supabase
			.from('catch_records')
			.upsert(dbData, {
				onConflict: 'user_pokedex_id,pokedex_entry_id'
			})
			.select();

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async delete(id: string): Promise<void> {
		const { error } = await this.supabase
			.from('catch_records')
			.delete()
			.eq('id', id);

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
				is_caught: newStatus !== 'not_caught',
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) this.handleError(error);
		return this.toCamelCase(data);
	}
}