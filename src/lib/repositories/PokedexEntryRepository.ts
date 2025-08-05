import { BaseRepository } from './BaseRepository';
import type { PokedexEntry } from '$lib/types';

export class PokedexEntryRepository extends BaseRepository {
	async getAll(): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.order('pokedexNumber', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getById(id: number): Promise<PokedexEntry | null> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			this.handleError(error);
		}
		return this.toCamelCase(data);
	}

	async getByNationalDexNumber(nationalDexNumber: number): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.eq('pokedexNumber', nationalDexNumber)
			.order('form', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getByRegionalPokedex(regionalPokedexId: number, columnName: string): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.not(columnName, 'is', null)
			.order(columnName, { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getFormsIncluded(): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.order('boxPlacementFormsBox', { ascending: true })
			.order('boxPlacementFormsRow', { ascending: true })
			.order('boxPlacementFormsColumn', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async getNoForms(): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.or('form.is.null,form.eq.')
			.order('boxPlacementBox', { ascending: true })
			.order('boxPlacementRow', { ascending: true })
			.order('boxPlacementColumn', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}

	async searchByName(searchTerm: string): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.ilike('pokemon', `%${searchTerm}%`)
			.order('pokedexNumber', { ascending: true })
			.limit(20);

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}
}