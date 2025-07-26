import { json } from '@sveltejs/kit';
import UserPokedexRepository from '$lib/repositories/UserPokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { CreatePokedexRequest } from '$lib/models/UserPokedex';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new UserPokedexRepository(event.locals.supabase, userId);
		const pokedexes = await repo.findAll();

		return json({ pokedexes });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const data: CreatePokedexRequest = await event.request.json();

		// Validation
		if (!data.name || data.name.trim().length === 0) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		if (data.gameScope === 'specific_generation' && !data.generation) {
			return json(
				{ error: 'Generation is required for specific generation scope' },
				{ status: 400 }
			);
		}

		if (data.gameScope === 'specific_generation' && data.requireOrigin) {
			return json({ error: 'Origin requirement only applies to all games scope' }, { status: 400 });
		}

		const repo = new UserPokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.create(data);

		return json({ pokedex }, { status: 201 });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Failed to create pokédex' }, { status: 500 });
	}
};
