import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';

export const GET = async ({ url }) => {
	const enableForms = url.searchParams.get('enableForms') === 'true';
	const region = url.searchParams.get('region');
	const game = url.searchParams.get('game');

	try {
		await dbConnect();
		const repo = new CombinedDataRepository();
		const combinedData = await repo.findAllCombinedData(enableForms, region, game);

		if (combinedData.length === 0) {
			return json({ error: 'No combined data found' }, { status: 404 });
		}
		return json(combinedData);
	} catch (error) {
		console.error(error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		dbDisconnect();
	}
};
