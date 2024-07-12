import mongoose, { Schema, Document, Types } from 'mongoose';

export interface CatchRecord extends Document {
	userId: string;
	pokedexEntryId: Types.ObjectId;
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
	hasGigantamaxed: boolean;
	personalNotes: string;
}

const catchRecordSchema = new Schema<CatchRecord>({
	userId: String,
	pokedexEntryId: { type: Schema.Types.ObjectId, ref: 'PokedexEntry', required: true },
	haveToEvolve: { type: Boolean, default: false },
	caught: { type: Boolean, default: false },
	inHome: { type: Boolean, default: false },
	hasGigantamaxed: { type: Boolean, default: false },
	personalNotes: String
});

const CatchRecordModel = mongoose.model<CatchRecord>('CatchRecord', catchRecordSchema);
export default CatchRecordModel;
