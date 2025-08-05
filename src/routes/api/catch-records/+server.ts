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
			userPokedexId: data.userPokedexId,
			pokedexEntryId: data.pokedexEntryId,
			isCaught: data.isCaught || false,
			catchStatus: data.catchStatus || 'not_caught',
			catchLocation: data.catchLocation || 'none',
			originRegion: data.originRegion || null,
			gameCaughtIn: data.gameCaughtIn || null,
			isGigantamax: data.isGigantamax || false,
			notes: data.notes || null
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
			isCaught: data.isCaught,
			catchStatus: data.catchStatus,
			catchLocation: data.catchLocation,
			originRegion: data.originRegion,
			gameCaughtIn: data.gameCaughtIn,
			isGigantamax: data.isGigantamax,
			notes: data.notes
		});

		return json({ record });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};