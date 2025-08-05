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

		if (operation === 'bulk_catch' || operation === 'bulk_uncatch') {
			// Bulk operations for entire box
			const isCaught = operation === 'bulk_catch';
			const catchStatus = isCaught ? 'caught' : 'not_caught';
			
			const batchUpdates = updates.map((pokedexEntryId: number) => ({
				userPokedexId,
				pokedexEntryId,
				isCaught,
				catchStatus,
				catchLocation: 'none',
				originRegion: null,
				gameCaughtIn: null,
				isGigantamax: false,
				notes: null
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