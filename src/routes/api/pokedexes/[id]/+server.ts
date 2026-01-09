import { json } from '@sveltejs/kit';
import type { Pokedex } from '$lib/models/Pokedex';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

// GET: Get single pokedex by ID
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.findById(id);

		if (!pokedex) {
			// RLS ensures user can only access own pokédexes
			// Return 404 whether it doesn't exist or user doesn't own it (don't leak info)
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		return json(pokedex);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// PUT: Update pokedex
export const PUT = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;
		const data: Partial<Pokedex> = await event.request.json();

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.update(id, data);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		return json(pokedex);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// DELETE: Delete pokedex
export const DELETE = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);

		// Verify pokedex exists and user owns it
		const pokedex = await repo.findById(id);
		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		await repo.delete(id);

		return json({ success: true });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
