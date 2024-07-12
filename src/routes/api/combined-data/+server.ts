import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';

export const GET = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '20', 10);

	try {
		await dbConnect();
		const repo = new CombinedDataRepository();
		const combinedData = await repo.findCombinedData(page, limit);
		const totalCount = await repo.countCombinedData();
		const totalPages = Math.ceil(totalCount / limit);

		return json({ combinedData, totalPages });
	} catch (error) {
		console.error(error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		dbDisconnect();
	}
};
