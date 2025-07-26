import type { UserPokedex, UserPokedexDB, CreatePokedexRequest } from '$lib/models/UserPokedex';
import type { SupabaseClient } from '@supabase/supabase-js';

class UserPokedexRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string
	) {}

	private transformFromDB(record: UserPokedexDB): UserPokedex {
		return {
			id: record.id,
			userId: record.user_id,
			name: record.name,
			gameScope: record.game_scope,
			generation: record.generation,
			isShiny: record.is_shiny,
			requireOrigin: record.require_origin,
			includeForms: record.include_forms,
			createdAt: record.created_at,
			updatedAt: record.updated_at
		};
	}

	private transformToDB(data: CreatePokedexRequest): Partial<UserPokedexDB> {
		return {
			name: data.name,
			game_scope: data.gameScope,
			generation: data.generation,
			is_shiny: data.isShiny,
			require_origin: data.requireOrigin,
			include_forms: data.includeForms
		};
	}

	async findAll(): Promise<UserPokedex[]> {
		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.select('*')
			.eq('user_id', this.userId)
			.order('created_at', { ascending: true });

		if (error || !data) return [];
		return data.map((record) => this.transformFromDB(record));
	}

	async findById(id: string): Promise<UserPokedex | null> {
		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.select('*')
			.eq('id', id)
			.eq('user_id', this.userId)
			.single();

		if (error || !data) return null;
		return this.transformFromDB(data);
	}

	async create(pokedexData: CreatePokedexRequest): Promise<UserPokedex> {
		const dbData = {
			user_id: this.userId,
			...this.transformToDB(pokedexData)
		};

		const { data, error } = await this.supabase
			.from('user_pokedexes')
			.insert(dbData)
			.select()
			.single();

		if (error || !data) {
			throw new Error(`Failed to create pokédex: ${error?.message}`);
		}

		return this.transformFromDB(data);
	}

	async delete(id: string): Promise<boolean> {
		const { error } = await this.supabase
			.from('user_pokedexes')
			.delete()
			.eq('id', id)
			.eq('user_id', this.userId);

		return !error;
	}

	async getPokedexCount(): Promise<number> {
		const { count, error } = await this.supabase
			.from('user_pokedexes')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', this.userId);

		return error ? 0 : count || 0;
	}
}

export default UserPokedexRepository;
