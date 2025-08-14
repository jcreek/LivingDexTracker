import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UserPokedexRepository, CatchRecordRepository } from '$lib/repositories';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const userPokedexRepo = new UserPokedexRepository(supabase);
		const catchRecordRepo = new CatchRecordRepository(supabase);

		// Verify ownership of the pokedex
		const pokedex = await userPokedexRepo.getById(data.userPokedexId);
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}

		const record = await catchRecordRepo.upsert({
			userId: user.id, // This is the actual user ID for RLS
			userPokedexId: data.userPokedexId, // This maps to pokedex_id
			pokedexEntryId: data.pokedexEntryId,
			caught: data.caught || false,
			haveToEvolve: data.haveToEvolve || false,
			inHome: data.inHome || false,
			hasGigantamaxed: data.hasGigantamaxed || false,
			personalNotes: data.personalNotes || null
		});

		return json({ record }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const userPokedexRepo = new UserPokedexRepository(supabase);
		const catchRecordRepo = new CatchRecordRepository(supabase);

		// Verify ownership of the pokedex
		const pokedex = await userPokedexRepo.getById(data.userPokedexId);
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}

		const record = await catchRecordRepo.update(data.id, {
			userId: user.id, // Ensure RLS compliance
			caught: data.caught,
			haveToEvolve: data.haveToEvolve,
			inHome: data.inHome,
			hasGigantamaxed: data.hasGigantamaxed,
			personalNotes: data.personalNotes
		});

		return json({ record });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
