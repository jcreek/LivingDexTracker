import {
	type CatchInformationItem,
	type PokedexEntry,
	type PokedexEntryDB
} from '$lib/models/PokedexEntry';
import type { SupabaseClient } from '@supabase/supabase-js';

class PokedexEntryRepository {
	constructor(private supabase: SupabaseClient) {}

	private parseCatchInformation(
		values: string[] | null
	): Array<string | CatchInformationItem> {
		if (!values) return [];
		return values.map((value) => {
			const trimmed = value.trim();
			if (!trimmed.startsWith('{')) return value;
			try {
				const parsed = JSON.parse(trimmed) as Partial<CatchInformationItem>;
				if (
					parsed &&
					typeof parsed.game === 'string' &&
					typeof parsed.location === 'string' &&
					typeof parsed.notes === 'string'
				) {
					return {
						game: parsed.game,
						location: parsed.location,
						notes: parsed.notes
					};
				}
			} catch {
				return value;
			}
			return value;
		});
	}

	private serializeCatchInformation(values: Array<string | CatchInformationItem>): string[] {
		return values.map((value) => (typeof value === 'string' ? value : JSON.stringify(value)));
	}

	// Transform Supabase data to match frontend expectations (minimal transformation)
	private transformPokedexEntry(entry: PokedexEntryDB): PokedexEntry {
		return {
			_id: entry.id.toString(),
			pokedexNumber: entry.pokedexNumber,
			pokemon: entry.pokemon,
			form: entry.form || '',
			spriteKey: entry.spriteKey || '',
			canGigantamax: entry.canGigantamax,
			regionToCatchIn: entry.regionToCatchIn || '',
			gamesToCatchIn: entry.gamesToCatchIn || [],
			regionToEvolveIn: entry.regionToEvolveIn || '',
			evolutionInformation: entry.evolutionInformation || '',
			catchInformation: this.parseCatchInformation(entry.catchInformation),
			notes: entry.notes || ''
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
		if (data.spriteKey !== undefined) dbData.spriteKey = data.spriteKey;
		if (data.canGigantamax !== undefined) dbData.canGigantamax = data.canGigantamax;
		if (data.regionToCatchIn !== undefined) dbData.regionToCatchIn = data.regionToCatchIn;
		if (data.gamesToCatchIn !== undefined) dbData.gamesToCatchIn = data.gamesToCatchIn;
		if (data.regionToEvolveIn !== undefined) dbData.regionToEvolveIn = data.regionToEvolveIn;
		if (data.evolutionInformation !== undefined)
			dbData.evolutionInformation = data.evolutionInformation;
		if (data.catchInformation !== undefined) {
			dbData.catchInformation = this.serializeCatchInformation(data.catchInformation);
		}
		if (data.notes !== undefined) dbData.notes = data.notes;
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
		if (data.spriteKey !== undefined) dbData.spriteKey = data.spriteKey;
		if (data.canGigantamax !== undefined) dbData.canGigantamax = data.canGigantamax;
		if (data.regionToCatchIn !== undefined) dbData.regionToCatchIn = data.regionToCatchIn;
		if (data.gamesToCatchIn !== undefined) dbData.gamesToCatchIn = data.gamesToCatchIn;
		if (data.regionToEvolveIn !== undefined) dbData.regionToEvolveIn = data.regionToEvolveIn;
		if (data.evolutionInformation !== undefined)
			dbData.evolutionInformation = data.evolutionInformation;
		if (data.catchInformation !== undefined) {
			dbData.catchInformation = this.serializeCatchInformation(data.catchInformation);
		}
		if (data.notes !== undefined) dbData.notes = data.notes;
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
