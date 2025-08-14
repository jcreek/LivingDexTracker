import { BaseRepository } from './BaseRepository';
import type { UserPokedex } from '$lib/types';

export class UserPokedexRepository extends BaseRepository {
	async getByUserId(userId: string): Promise<UserPokedex[]> {
		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.select(
				`
				*,
				regional_pokedex_info (*)
			`
			)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) this.handleError(error);

		return this.toCamelCase(data || []).map((pokedex: any) => ({
			...pokedex,
			regionalPokedexInfo: pokedex.regionalPokedexInfo
		}));
	}

	async getById(id: string): Promise<UserPokedex | null> {
		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.select(
				`
				*,
				regional_pokedex_info (*)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}

		const result = this.toCamelCase(data);
		if (!result) return null;

		return {
			...result,
			regionalPokedexInfo: result.regionalPokedexInfo
		};
	}

	async create(pokedex: Omit<UserPokedex, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserPokedex> {
		const dbData = this.toSnakeCase(pokedex);

		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.insert(dbData)
			.select(
				`
				*,
				regional_pokedex_info (*)
			`
			)
			.single();

		if (error) this.handleError(error);

		const result = this.toCamelCase(data);
		return {
			...result,
			regionalPokedexInfo: result.regionalPokedexInfo
		};
	}

	async update(id: string, updates: Partial<UserPokedex>): Promise<UserPokedex> {
		const dbData = this.toSnakeCase(updates);
		delete dbData.id;
		delete dbData.created_at;

		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.update({
				...dbData,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select(
				`
				*,
				regional_pokedex_info (*)
			`
			)
			.single();

		if (error) this.handleError(error);

		const result = this.toCamelCase(data);
		return {
			...result,
			regionalPokedexInfo: result.regionalPokedexInfo
		};
	}

	async delete(id: string): Promise<void> {
		const { error } = await this.supabase.from('user_pokedexes').delete().eq('id', id);

		if (error) this.handleError(error);
	}

	async getStats(id: string): Promise<{ total: number; caught: number; readyToEvolve: number }> {
		const { data, error } = await this.supabase.rpc('get_pokedex_stats', {
			pokedex_id: id
		});

		if (error) this.handleError(error);

		// RPC functions return arrays, so we need to get the first element
		const result = Array.isArray(data) ? data[0] : data;
		return this.toCamelCase(result || { total: 0, caught: 0, ready_to_evolve: 0 });
	}
}
