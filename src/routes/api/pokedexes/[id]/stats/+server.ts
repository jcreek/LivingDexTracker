import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UserPokedexRepository } from '$lib/repositories';

export const GET: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const repo = new UserPokedexRepository(supabase);

		// First verify ownership
		const pokedex = await repo.getById(params.id);
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}

		const stats = await repo.getStats(params.id);

		return json({
			stats: {
				...stats,
				percentComplete: stats.total > 0 ? Math.round((stats.caught / stats.total) * 100) : 0
			}
		});
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
