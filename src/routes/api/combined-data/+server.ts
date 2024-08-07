import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';

export const GET = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '20', 10);
	const enableForms = url.searchParams.get('enableForms') === 'true';
	const region = url.searchParams.get('region');
	const game = url.searchParams.get('game');

	try {
		await dbConnect();
		const repo = new CombinedDataRepository();
		const combinedData = await repo.findCombinedData(page, limit, enableForms, region, game);

		if (combinedData.length === 0) {
			return json({ error: 'No combined data found' }, { status: 404 });
		}
		const totalCount = await repo.countCombinedData(enableForms, region, game);
		const totalPages = Math.ceil(totalCount / limit);

		return json({ combinedData, totalPages });
	} catch (error) {
		console.error(error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		dbDisconnect();
	}
};
