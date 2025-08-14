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

	async getByRegionalPokedex(
		regionalPokedexId: number,
		columnName: string
	): Promise<PokedexEntry[]> {
		// Check if this is using the legacy column-based approach
		if (columnName && columnName.includes('_number')) {
			const { data, error } = await this.supabase
				.from('pokedex_entries')
				.select('*')
				.not(columnName, 'is', null)
				.order(columnName, { ascending: true });

			if (error) this.handleError(error);
			return this.toCamelCase(data || []);
		}
		
		// Use the new regional_pokedex_entries table structure
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select(`
				*,
				regional_pokedex_entries!inner(
					regional_number,
					regional_pokedex_name
				)
			`)
			.eq('regional_pokedex_entries.regional_pokedex_name', this.getRegionalPokedexName(regionalPokedexId))
			.order('regional_pokedex_entries.regional_number', { ascending: true });

		if (error) this.handleError(error);
		return this.toCamelCase(data || []);
	}
	
	// Helper method to map regional pokedex ID to name
	private getRegionalPokedexName(regionalPokedexId: number): string {
		const mapping: { [key: number]: string } = {
			1: 'national',
			2: 'kanto',
			3: 'johto', 
			4: 'hoenn',
			5: 'sinnoh',
			6: 'sinnoh-extended',
			7: 'unova',
			8: 'unova-updated',
			9: 'kalos-central',
			10: 'kalos-coastal',
			11: 'kalos-mountain',
			12: 'hoenn-updated',
			13: 'alola',
			14: 'alola-updated',
			15: 'melemele',
			16: 'akala',
			17: 'ulaula',
			18: 'poni',
			19: 'galar',
			20: 'isle-armor',
			21: 'crown-tundra',
			22: 'hisui',
			23: 'paldea',
			24: 'kitakami',
			25: 'blueberry'
		};
		return mapping[regionalPokedexId] || 'national';
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
	
	// New method to get entries by regional pokedex name
	async getByRegionalPokedexName(regionalPokedexName: string): Promise<PokedexEntry[]> {
		// First get the regional pokedex entries in the right order
		const { data: regionalEntries, error: regionalError } = await this.supabase
			.from('regional_pokedex_entries')
			.select('pokedex_entry_id, regional_number')
			.eq('regional_pokedex_name', regionalPokedexName)
			.order('regional_number', { ascending: true });

		if (regionalError) this.handleError(regionalError);
		if (!regionalEntries || regionalEntries.length === 0) {
			return [];
		}

		// Get the pokedex entry IDs in order
		const entryIds = regionalEntries.map(entry => entry.pokedex_entry_id);

		// Now get the full pokedex entries
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.in('id', entryIds);

		if (error) this.handleError(error);

		// Create a map for quick lookup and include regional numbers
		const entryMap = new Map((data || []).map(entry => [entry.id, entry]));
		const regionalNumberMap = new Map(regionalEntries.map(entry => [entry.pokedex_entry_id, entry.regional_number]));

		// Return entries in regional number order with regional numbers included
		const orderedEntries = entryIds
			.map(id => {
				const entry = entryMap.get(id);
				const regionalNumber = regionalNumberMap.get(id);
				if (entry && regionalNumber) {
					return { ...entry, regionalNumber };
				}
				return entry;
			})
			.filter(entry => entry !== undefined);

		return this.toCamelCase(orderedEntries);
	}
}
