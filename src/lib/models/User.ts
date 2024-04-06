import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
	username: string;
	// Add other user-related fields as needed
}

const userSchema = new Schema<User>({
	username: String
	// Add other user-related fields as needed
});

export default mongoose.model<User>('User', userSchema);
