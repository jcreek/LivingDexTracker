import mongoose from 'mongoose';
import { getEnv } from '$lib/utils/env';
const env = getEnv();

/* 
  0 - disconnected
  1 - connected
  2 - connecting
  3 - disconnecting
  4 - uninitialized
*/
let mongoConnectionState = 0;

export const dbConnect = async () => {
	if (mongoConnectionState === 1) {
		console.log('connection established');
		return;
	}

	if (mongoose.connections.length > 0) {
		mongoConnectionState = mongoose.connections[0].readyState;
		if (mongoConnectionState === 1) {
			console.log('using existing connection');
			return;
		}

		await mongoose.disconnect();
	}

	try {
		await mongoose.connect(env.MONGO_URL, {
			serverApi: { version: '1', strict: true, deprecationErrors: true }
		});
		await mongoose.connection.db.admin().command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
		mongoConnectionState = 1;
	} finally {
		// Ensures that the client will close when you finish/error
		await mongoose.disconnect();
	}
	mongoConnectionState = 1;
};

export const dbDisconnect = async () => {
	if (process.env.NODE_ENV === 'development') return;
	if (mongoConnectionState === 0) return;

	await mongoose.disconnect();
	mongoConnectionState = 0;
	console.log('disconnected from mongodb');
};
