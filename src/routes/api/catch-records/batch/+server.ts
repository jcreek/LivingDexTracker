import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UserPokedexRepository, CatchRecordRepository } from '$lib/repositories';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { userPokedexId, updates, operation } = await request.json();
		const userPokedexRepo = new UserPokedexRepository(supabase);
		const catchRecordRepo = new CatchRecordRepository(supabase);

		// Verify ownership of the pokedex
		const pokedex = await userPokedexRepo.getById(userPokedexId);
		if (!pokedex || pokedex.userId !== user.id) {
			return json({ error: 'Pokédex not found' }, { status: 404 });
		}

		let records;

		if (operation === 'bulk_catch' || operation === 'bulk_uncatch' || operation === 'bulk_ready_to_evolve') {
			// Bulk operations for entire box
			let caught = false;
			let haveToEvolve = false;

			if (operation === 'bulk_catch') {
				caught = true;
				haveToEvolve = false;
			} else if (operation === 'bulk_ready_to_evolve') {
				caught = true;
				haveToEvolve = true;
			}

			const batchUpdates = updates.map((pokedexEntryId: number) => ({
				userId: user.id, // Required for RLS policy
				userPokedexId,
				pokedexEntryId,
				caught,
				haveToEvolve,
				inHome: false,
				hasGigantamaxed: false,
				personalNotes: null
			}));

			records = await catchRecordRepo.batchUpsert(batchUpdates);
		} else {
			// Individual updates
			records = await catchRecordRepo.batchUpsert(updates);
		}

		return json({ records, count: records.length });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
