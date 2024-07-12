import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import PokedexMetadataModel from '$lib/models/PokedexMetadata';

export const GET = async () => {
	await dbConnect();

	const metadata = await PokedexMetadataModel.findOne();
	await dbDisconnect();

	if (metadata) {
		return json({ lastModified: metadata.lastModified });
	} else {
		return json({ message: 'Metadata not found' }, { status: 404 });
	}
};
