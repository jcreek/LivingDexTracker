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
		const pokedex = await repo.getById(params.id);
		
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}
		
		return json({ pokedex });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const repo = new UserPokedexRepository(supabase);
		
		// First verify ownership
		const existing = await repo.getById(params.id);
		if (!existing || existing.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}
		
		const pokedex = await repo.update(params.id, data);
		
		return json({ pokedex });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const repo = new UserPokedexRepository(supabase);
		
		// First verify ownership
		const existing = await repo.getById(params.id);
		if (!existing || existing.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}
		
		await repo.delete(params.id);
		
		return json({ success: true });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};