import { json } from '@sveltejs/kit';
import UserPokedexRepository from '$lib/repositories/UserPokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const DELETE = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const pokedexId = event.params.id;

		if (!pokedexId) {
			return json({ error: 'Pok�dex ID is required' }, { status: 400 });
		}

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new UserPokedexRepository(event.locals.supabase, userId);
		
		// Verify the pok�dex belongs to the user before deleting
		const pokedex = await repo.findById(pokedexId);
		if (!pokedex) {
			return json({ error: 'Pok�dex not found' }, { status: 404 });
		}

		const success = await repo.delete(pokedexId);
		
		if (success) {
			return json({ success: true });
		} else {
			return json({ error: 'Failed to delete pok�dex' }, { status: 500 });
		}
	} catch (err) {
		console.error('Error deleting pok�dex:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};