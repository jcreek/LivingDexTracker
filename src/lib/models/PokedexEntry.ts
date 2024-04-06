import mongoose, { Schema, Document } from 'mongoose';

export interface PokedexEntry extends Document {
	order: number;
	boxPlacement: { box: number; row: number; column: number };
	pokedexNumber: number;
	pokemon: string;
	form: string;
	generation: number;
	originGame: string;
	alternativeOrigin: string;
	howToObtain: string;
}

const pokedexEntrySchema = new Schema<PokedexEntry>({
	order: Number,
	boxPlacement: {
		box: Number,
		row: Number,
		column: Number
	},
	pokedexNumber: Number,
	pokemon: String,
	form: String,
	generation: Number,
	originGame: String,
	alternativeOrigin: String,
	howToObtain: String
});

export default mongoose.model<PokedexEntry>('PokedexEntry', pokedexEntrySchema);
