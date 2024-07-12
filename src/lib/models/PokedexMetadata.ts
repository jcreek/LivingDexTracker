import mongoose, { Schema, Document } from 'mongoose';

export interface PokedexMetadata extends Document {
	lastModified: Date;
}

const pokedexMetadataSchema = new Schema<PokedexMetadata>({
	lastModified: {
		type: Date,
		default: Date.now
	}
});

export default mongoose.model<PokedexMetadata>('PokedexMetadata', pokedexMetadataSchema);
