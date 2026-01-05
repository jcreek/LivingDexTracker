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
			// Box placement is calculated dynamically - not stored in database
			boxPlacementForms: { box: 0, row: 0, column: 0 },
			boxPlacement: { box: 0, row: 0, column: 0 },
			kantoDexNumber: entry.kanto_dex_number ?? undefined,
			johtoDexNumber: entry.johto_dex_number ?? undefined,
			hoennDexNumber: entry.hoenn_dex_number ?? undefined,
			sinnohDexNumber: entry.sinnoh_dex_number ?? undefined,
			unovaBwDexNumber: entry.unova_bw_dex_number ?? undefined,
			unovaB2w2DexNumber: entry.unova_b2w2_dex_number ?? undefined,
			kalosCentralDexNumber: entry.kalos_central_dex_number ?? undefined,
			kalosCoastalDexNumber: entry.kalos_coastal_dex_number ?? undefined,
			kalosMountainDexNumber: entry.kalos_mountain_dex_number ?? undefined,
			alolaSmDexNumber: entry.alola_sm_dex_number ?? undefined,
			alolaUsumDexNumber: entry.alola_usum_dex_number ?? undefined,
			galarDexNumber: entry.galar_dex_number ?? undefined,
			galarIsleOfArmorDexNumber: entry.galar_isle_of_armor_dex_number ?? undefined,
			galarCrownTundraDexNumber: entry.galar_crown_tundra_dex_number ?? undefined,
			hisuiDexNumber: entry.hisui_dex_number ?? undefined,
			paldeaDexNumber: entry.paldea_dex_number ?? undefined
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
		// Box placement is calculated dynamically - not stored in database

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
		// Box placement is calculated dynamically - not stored in database

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
