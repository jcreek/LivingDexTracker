import { type PokedexEntry, type PokedexEntryDB } from '$lib/models/PokedexEntry';
import type { SupabaseClient } from '@supabase/supabase-js';

class PokedexEntryRepository {
	constructor(private supabase: SupabaseClient) {}

	// Transform Supabase data to match frontend expectations (minimal transformation)
	private transformPokedexEntry(entry: PokedexEntryDB): PokedexEntry {
		return {
			_id: entry.id.toString(),
			pokedexNumber: entry.pokedexNumber,
			pokemon: entry.pokemon,
			form: entry.form || '',
			canGigantamax: entry.canGigantamax,
			regionToCatchIn: entry.regionToCatchIn || '',
			gamesToCatchIn: entry.gamesToCatchIn || [],
			regionToEvolveIn: entry.regionToEvolveIn || '',
			evolutionInformation: entry.evolutionInformation || '',
			catchInformation: entry.catchInformation || [],
			boxPlacementForms: {
				box: entry.boxPlacementFormsBox || 0,
				row: entry.boxPlacementFormsRow || 0,
				column: entry.boxPlacementFormsColumn || 0
			},
			boxPlacement: {
				box: entry.boxPlacementBox || 0,
				row: entry.boxPlacementRow || 0,
				column: entry.boxPlacementColumn || 0
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
			.order('pokedexNumber', { ascending: true });

		if (error || !data) return [];
		return data.map((entry) => this.transformPokedexEntry(entry));
	}

	async create(data: Partial<PokedexEntry>): Promise<PokedexEntry> {
		// Transform to database format (minimal transformation needed)
		const dbData: Partial<PokedexEntryDB> = {};
		if (data.pokedexNumber !== undefined) dbData.pokedexNumber = data.pokedexNumber;
		if (data.pokemon !== undefined) dbData.pokemon = data.pokemon;
		if (data.form !== undefined) dbData.form = data.form;
		if (data.canGigantamax !== undefined) dbData.canGigantamax = data.canGigantamax;
		if (data.regionToCatchIn !== undefined) dbData.regionToCatchIn = data.regionToCatchIn;
		if (data.gamesToCatchIn !== undefined) dbData.gamesToCatchIn = data.gamesToCatchIn;
		if (data.regionToEvolveIn !== undefined) dbData.regionToEvolveIn = data.regionToEvolveIn;
		if (data.evolutionInformation !== undefined)
			dbData.evolutionInformation = data.evolutionInformation;
		if (data.catchInformation !== undefined) dbData.catchInformation = data.catchInformation;
		if (data.boxPlacementForms?.box !== undefined)
			dbData.boxPlacementFormsBox = data.boxPlacementForms.box;
		if (data.boxPlacementForms?.row !== undefined)
			dbData.boxPlacementFormsRow = data.boxPlacementForms.row;
		if (data.boxPlacementForms?.column !== undefined)
			dbData.boxPlacementFormsColumn = data.boxPlacementForms.column;
		if (data.boxPlacement?.box !== undefined) dbData.boxPlacementBox = data.boxPlacement.box;
		if (data.boxPlacement?.row !== undefined) dbData.boxPlacementRow = data.boxPlacement.row;
		if (data.boxPlacement?.column !== undefined)
			dbData.boxPlacementColumn = data.boxPlacement.column;

		const { data: result, error } = await this.supabase
			.from('pokedex_entries')
			.insert(dbData)
			.select()
			.single();

		if (error || !result) throw new Error('Failed to create pokedex entry');
		return this.transformPokedexEntry(result);
	}

	async update(id: string, data: Partial<PokedexEntry>): Promise<PokedexEntry | null> {
		// Transform to database format (minimal transformation needed)
		const dbData: Partial<PokedexEntryDB> = {};
		if (data.pokedexNumber !== undefined) dbData.pokedexNumber = data.pokedexNumber;
		if (data.pokemon !== undefined) dbData.pokemon = data.pokemon;
		if (data.form !== undefined) dbData.form = data.form;
		if (data.canGigantamax !== undefined) dbData.canGigantamax = data.canGigantamax;
		if (data.regionToCatchIn !== undefined) dbData.regionToCatchIn = data.regionToCatchIn;
		if (data.gamesToCatchIn !== undefined) dbData.gamesToCatchIn = data.gamesToCatchIn;
		if (data.regionToEvolveIn !== undefined) dbData.regionToEvolveIn = data.regionToEvolveIn;
		if (data.evolutionInformation !== undefined)
			dbData.evolutionInformation = data.evolutionInformation;
		if (data.catchInformation !== undefined) dbData.catchInformation = data.catchInformation;
		if (data.boxPlacementForms?.box !== undefined)
			dbData.boxPlacementFormsBox = data.boxPlacementForms.box;
		if (data.boxPlacementForms?.row !== undefined)
			dbData.boxPlacementFormsRow = data.boxPlacementForms.row;
		if (data.boxPlacementForms?.column !== undefined)
			dbData.boxPlacementFormsColumn = data.boxPlacementForms.column;
		if (data.boxPlacement?.box !== undefined) dbData.boxPlacementBox = data.boxPlacement.box;
		if (data.boxPlacement?.row !== undefined) dbData.boxPlacementRow = data.boxPlacement.row;
		if (data.boxPlacement?.column !== undefined)
			dbData.boxPlacementColumn = data.boxPlacement.column;

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
		await this.supabase.from('pokedex_entries').delete().eq('id', id);
	}
}

export default PokedexEntryRepository;
