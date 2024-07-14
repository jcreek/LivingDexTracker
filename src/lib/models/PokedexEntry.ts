import mongoose, { Schema, Document } from 'mongoose';

export interface PokedexEntry extends Document {
	pokedexNumber: number;
	boxPlacement: { box: number; row: number; column: number };
	boxPlacementForms: { box: number; row: number; column: number };
	pokemon: string;
	form: string;
	canGigantamax: boolean;
	regionToCatchIn: string;
	gamesToCatchIn: string[];
	regionToEvolveIn: string;
	evolutionInformation: string;
	catchInformation: [
		{
			game: string;
			location: string;
			notes: string;
		}
	];
}

const pokedexEntrySchema = new Schema<PokedexEntry>({
	pokedexNumber: Number,
	boxPlacement: {
		box: Number,
		row: Number,
		column: Number
	},
	boxPlacementForms: {
		box: Number,
		row: Number,
		column: Number
	},
	pokemon: String,
	form: String,
	canGigantamax: Boolean,
	regionToCatchIn: String,
	gamesToCatchIn: Array<string>,
	regionToEvolveIn: String,
	evolutionInformation: String,
	catchInformation: [
		{
			game: String,
			location: String,
			notes: String
		}
	]
});

export default mongoose.model<PokedexEntry>('PokedexEntry', pokedexEntrySchema);
