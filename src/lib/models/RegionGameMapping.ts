import mongoose, { Schema, Document } from 'mongoose';

export interface RegionGameMapping extends Document {
	region: string;
	games: string[];
}

const regionGameMappingSchema = new Schema<RegionGameMapping>({
	region: String,
	games: Array<string>
});

export default mongoose.model<RegionGameMapping>('RegionGameMapping', regionGameMappingSchema);
