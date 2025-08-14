import { BaseRepository } from './BaseRepository';
import type { RegionalPokedexInfo } from '$lib/types';

export class RegionalPokedexRepository extends BaseRepository {
	async getAll(): Promise<RegionalPokedexInfo[]> {
		const { data, error } = await this.supabase
			.from('regional_pokedex_info')
			.select('*')
			.order('id', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getById(id: number): Promise<RegionalPokedexInfo | null> {
		const { data, error } = await this.supabase
			.from('regional_pokedex_info')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}
		return this.toCamelCase(data);
	}

	async getByName(name: string): Promise<RegionalPokedexInfo | null> {
		const { data, error } = await this.supabase
			.from('regional_pokedex_info')
			.select('*')
			.eq('name', name)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}
		return this.toCamelCase(data);
	}

	async getByRegion(region: string): Promise<RegionalPokedexInfo[]> {
		const { data, error } = await this.supabase
			.from('regional_pokedex_info')
			.select('*')
			.eq('region', region)
			.order('id', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getByGeneration(generation: string): Promise<RegionalPokedexInfo[]> {
		const { data, error } = await this.supabase
			.from('regional_pokedex_info')
			.select('*')
			.eq('generation', generation)
			.order('id', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}
}
