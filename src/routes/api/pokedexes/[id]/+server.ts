import { json } from '@sveltejs/kit';
import UserPokedexRepository from '$lib/repositories/UserPokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const DELETE = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const pokedexId = event.params.id;

		if (!pokedexId) {
			return json({ error: 'Pokédex ID is required' }, { status: 400 });
		}

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new UserPokedexRepository(event.locals.supabase, userId);
		
		// Check if this is the user's last pokédex
		const count = await repo.getPokedexCount();
		if (count <= 1) {
			return json({ error: 'Cannot delete last pokédex' }, { status: 400 });
		}
		
		const success = await repo.delete(pokedexId);
		
		if (!success) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}
		
		return json({ success: true });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Failed to delete pokédex' }, { status: 500 });
	}
};
