import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { exportPokedexIfConfigured } from '$lib/services/PokedexExportService';
import { requireAuth } from '$lib/utils/auth';

export const POST = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id: pokedexId } = event.params;

		if (!pokedexId) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const result = await exportPokedexIfConfigured(event.locals.supabase, userId, pokedexId);
		return json(result);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
