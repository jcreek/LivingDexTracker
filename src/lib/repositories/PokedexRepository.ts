import type { Pokedex, PokedexDB } from '$lib/models/Pokedex';
import type { SupabaseClient } from '@supabase/supabase-js';

class PokedexRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string
	) {}

	private transform(db: PokedexDB, dexScopes: string[] = []): Pokedex {
		return {
			_id: db.id,
			userId: db.userId,
			name: db.name,
			description: db.description || '',
			isLivingDex: db.isLivingDex,
			isShinyDex: db.isShinyDex,
			isOriginDex: db.isOriginDex,
			isFormDex: db.isFormDex,
			gameScope: db.gameScope,
			dexScopes
		};
	}

	private transformToDatabase(data: Partial<Pokedex>): Partial<PokedexDB> {
		const dbData: Partial<PokedexDB> = {};
		if (data.name !== undefined) dbData.name = data.name;
		if (data.description !== undefined) dbData.description = data.description;
		if (data.isLivingDex !== undefined) dbData.isLivingDex = data.isLivingDex;
		if (data.isShinyDex !== undefined) dbData.isShinyDex = data.isShinyDex;
		if (data.isOriginDex !== undefined) dbData.isOriginDex = data.isOriginDex;
		if (data.isFormDex !== undefined) dbData.isFormDex = data.isFormDex;
		if (data.gameScope !== undefined) dbData.gameScope = data.gameScope;
		return dbData;
	}

	private async fetchDexScopesMap(pokedexIds: string[]): Promise<Map<string, string[]>> {
		if (pokedexIds.length === 0) return new Map();
		const { data, error } = await this.supabase
			.from('pokedex_dex_scopes')
			.select('pokedexId, dexId')
			.in('pokedexId', pokedexIds);

		if (error || !data) return new Map();

		const map = new Map<string, string[]>();
		for (const row of data) {
			if (!map.has(row.pokedexId)) map.set(row.pokedexId, []);
			map.get(row.pokedexId)?.push(row.dexId);
		}
		return map;
	}

	async findById(id: string): Promise<Pokedex | null> {
		const { data, error } = await this.supabase
			.from('pokedexes')
			.select('*')
			.eq('id', id)
			.eq('userId', this.userId)
			.single();

		if (error || !data) return null;
		const dexScopesMap = await this.fetchDexScopesMap([data.id]);
		return this.transform(data, dexScopesMap.get(data.id) || []);
	}

	async findAll(): Promise<Pokedex[]> {
		const { data, error } = await this.supabase
			.from('pokedexes')
			.select('*')
			.eq('userId', this.userId)
			.order('createdAt', { ascending: true });

		if (error || !data) return [];
		const dexScopesMap = await this.fetchDexScopesMap(data.map((d) => d.id));
		return data.map((d) => this.transform(d, dexScopesMap.get(d.id) || []));
	}

	async create(data: Partial<Pokedex>): Promise<Pokedex> {
		const dbData = {
			userId: this.userId,
			...this.transformToDatabase(data)
		};

		const { data: result, error } = await this.supabase
			.from('pokedexes')
			.insert(dbData)
			.select()
			.single();

		if (error) {
			console.error('Error creating pokedex:', error);
			// Preserve the Supabase error code so the API layer can map to a user-friendly response.
			throw Object.assign(new Error(`Failed to create pokedex: ${error.message}`), {
				code: error.code
			});
		}

		if (!result) {
			throw new Error('Failed to create pokedex: No result returned');
		}

		return this.transform(result);
	}

	async update(id: string, data: Partial<Pokedex>): Promise<Pokedex | null> {
		const dbData = this.transformToDatabase(data);

		const { data: result, error } = await this.supabase
			.from('pokedexes')
			.update(dbData)
			.eq('id', id)
			.eq('userId', this.userId)
			.select()
			.single();

		if (error) {
			console.error('Error updating pokedex:', error);
			throw Object.assign(new Error(`Failed to update pokedex: ${error.message}`), {
				code: error.code
			});
		}
		if (!result) return null;
		return this.transform(result);
	}

	async delete(id: string): Promise<void> {
		const { error } = await this.supabase
			.from('pokedexes')
			.delete()
			.eq('id', id)
			.eq('userId', this.userId);

		if (error) {
			console.error('Error deleting pokedex:', error);
			throw new Error(`Failed to delete pokedex: ${error.message}`);
		}
	}
}

export default PokedexRepository;
