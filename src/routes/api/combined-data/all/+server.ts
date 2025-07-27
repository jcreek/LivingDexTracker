import { json } from '@sveltejs/kit';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import { getOptionalUserId } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	const { url } = event;
	const enableForms = url.searchParams.get('enableForms') === 'true';
	const region = url.searchParams.get('region') || '';
	const game = url.searchParams.get('game') || '';
	const pokedexId = url.searchParams.get('pokedexId') || '';

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
		const combinedData = await repo.findAllCombinedData(userId || '', enableForms, region, game, pokedexId);

		// Return empty array instead of 404 for better UX
		return json(combinedData);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
