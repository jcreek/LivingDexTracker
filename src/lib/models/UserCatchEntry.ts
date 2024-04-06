import mongoose, { Schema, Document } from 'mongoose';

export interface UserCatchEntry extends Document {
	userId: mongoose.Types.ObjectId; // Reference to the user
	pokedexEntryId: mongoose.Types.ObjectId; // Reference to the pokedex entry
	haveToEvolve: boolean;
	caught: boolean;
	inHome: boolean;
}

const userCatchEntrySchema = new Schema<UserCatchEntry>({
	userId: { type: mongoose.Types.ObjectId, ref: 'User' },
	pokedexEntryId: { type: mongoose.Types.ObjectId, ref: 'PokedexEntry' },
	haveToEvolve: Boolean,
	caught: Boolean,
	inHome: Boolean
});

export default mongoose.model<UserCatchEntry>('UserCatchEntry', userCatchEntrySchema);
