import { json } from '@sveltejs/kit';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import { getOptionalUserId } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	const { url } = event;
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '20', 10);
	const enableForms = url.searchParams.get('enableForms') === 'true';
	const region = url.searchParams.get('region') || '';
	const game = url.searchParams.get('game') || '';

	try {
		// Get userId if authenticated, null if not
		const userId = await getOptionalUserId(event);

		// If user is authenticated, set their session on the Supabase client
		if (userId) {
			const { session } = await event.locals.safeGetSession();
			if (session) {
				await event.locals.supabase.auth.setSession(session);
			}
		}

		const repo = new CombinedDataRepository(event.locals.supabase, userId || '');
		const combinedData = await repo.findCombinedData(
			userId || '',
			page,
			limit,
			enableForms,
			region,
			game
		);

		// Return empty array instead of 404 for better UX
		if (combinedData.length === 0) {
			return json({ combinedData: [], totalPages: 0 });
		}

		const totalCount = await repo.countCombinedData(userId || '', enableForms, region, game);
		const totalPages = Math.ceil(totalCount / limit);

		return json({ combinedData, totalPages });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
