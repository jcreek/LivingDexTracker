import { json } from '@sveltejs/kit';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	const { url } = event;
	const enableForms = url.searchParams.get('enableForms') === 'true';
	const region = url.searchParams.get('region') || '';
	const game = url.searchParams.get('game') || '';

	try {
		const userId = await requireAuth(event);
		const repo = new CombinedDataRepository(event.locals.supabase, userId);
		const combinedData = await repo.findAllCombinedData(userId, enableForms, region, game);

		// Return empty array instead of 404 for better UX
		return json(combinedData);
	} catch (error) {
		console.error(error);
		if (error.status) {
			throw error;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
