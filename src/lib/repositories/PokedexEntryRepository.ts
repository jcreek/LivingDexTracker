import { type PokedexEntry } from '$lib/models/PokedexEntry';
import type { SupabaseClient } from '@supabase/supabase-js';

class PokedexEntryRepository {
	constructor(private supabase: SupabaseClient) {}

	// Transform Supabase data to match frontend expectations
	private transformPokedexEntry(entry: any): PokedexEntry {
		return {
			_id: entry.id.toString(),
			pokedexNumber: entry.pokedex_number,
			pokemon: entry.pokemon,
			form: entry.form,
			canGigantamax: entry.can_gigantamax,
			regionToCatchIn: entry.region_to_catch_in,
			gamesToCatchIn: entry.games_to_catch_in || [],
			regionToEvolveIn: entry.region_to_evolve_in,
			evolutionInformation: entry.evolution_information,
			catchInformation: entry.catch_information || [],
			boxPlacementForms: {
				box: entry.box_placement_forms_box,
				row: entry.box_placement_forms_row,
				column: entry.box_placement_forms_column
			},
			boxPlacement: {
				box: entry.box_placement_box,
				row: entry.box_placement_row,
				column: entry.box_placement_column
			}
		};
	}

	async findById(id: string): Promise<PokedexEntry | null> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) return null;
		return this.transformPokedexEntry(data);
	}

	async findAll(): Promise<PokedexEntry[]> {
		const { data, error } = await this.supabase
			.from('pokedex_entries')
			.select('*')
			.order('pokedex_number', { ascending: true });

		if (error || !data) return [];
		return data.map(entry => this.transformPokedexEntry(entry));
	}

	async create(data: Partial<PokedexEntry>): Promise<PokedexEntry> {
		// Transform camelCase to snake_case for database
		const dbData: any = {};
		if (data.pokedexNumber !== undefined) dbData.pokedex_number = data.pokedexNumber;
		if (data.pokemon !== undefined) dbData.pokemon = data.pokemon;
		if (data.form !== undefined) dbData.form = data.form;
		if (data.canGigantamax !== undefined) dbData.can_gigantamax = data.canGigantamax;
		if (data.regionToCatchIn !== undefined) dbData.region_to_catch_in = data.regionToCatchIn;
		if (data.gamesToCatchIn !== undefined) dbData.games_to_catch_in = data.gamesToCatchIn;
		if (data.regionToEvolveIn !== undefined) dbData.region_to_evolve_in = data.regionToEvolveIn;
		if (data.evolutionInformation !== undefined) dbData.evolution_information = data.evolutionInformation;
		if (data.catchInformation !== undefined) dbData.catch_information = data.catchInformation;
		if (data.boxPlacementForms?.box !== undefined) dbData.box_placement_forms_box = data.boxPlacementForms.box;
		if (data.boxPlacementForms?.row !== undefined) dbData.box_placement_forms_row = data.boxPlacementForms.row;
		if (data.boxPlacementForms?.column !== undefined) dbData.box_placement_forms_column = data.boxPlacementForms.column;
		if (data.boxPlacement?.box !== undefined) dbData.box_placement_box = data.boxPlacement.box;
		if (data.boxPlacement?.row !== undefined) dbData.box_placement_row = data.boxPlacement.row;
		if (data.boxPlacement?.column !== undefined) dbData.box_placement_column = data.boxPlacement.column;

		const { data: result, error } = await this.supabase
			.from('pokedex_entries')
			.insert(dbData)
			.select()
			.single();

		if (error || !result) throw new Error('Failed to create pokedex entry');
		return this.transformPokedexEntry(result);
	}

	async update(id: string, data: Partial<PokedexEntry>): Promise<PokedexEntry | null> {
		// Transform camelCase to snake_case for database
		const dbData: any = {};
		if (data.pokedexNumber !== undefined) dbData.pokedex_number = data.pokedexNumber;
		if (data.pokemon !== undefined) dbData.pokemon = data.pokemon;
		// ... add other fields as needed

		const { data: result, error } = await this.supabase
			.from('pokedex_entries')
			.update(dbData)
			.eq('id', id)
			.select()
			.single();

		if (error || !result) return null;
		return this.transformPokedexEntry(result);
	}

	async delete(id: string): Promise<void> {
		await this.supabase
			.from('pokedex_entries')
			.delete()
			.eq('id', id);
	}
}

export default PokedexEntryRepository;
