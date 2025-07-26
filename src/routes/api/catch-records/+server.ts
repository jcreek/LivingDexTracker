import { json } from '@sveltejs/kit';
import { type CatchRecord } from '$lib/models/CatchRecord';
import CatchRecordRepository from '$lib/repositories/CatchRecordRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new CatchRecordRepository(event.locals.supabase, userId);
		const catchData = await repo.findByUserId(userId);
		// order by pokedexEntryId property, ascending
		const sortedData = catchData.sort(
			(a, b) => Number(a.pokedexEntryId) - Number(b.pokedexEntryId)
		);
		return json(sortedData);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		// Check if we can get a session first
		const { session, user } = await event.locals.safeGetSession();

		const userId = await requireAuth(event);

		const data: Partial<CatchRecord> = await event.request.json();

		// Get the user's session and set it on the Supabase client
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		// Ensure the userId is set to the authenticated user
		data.userId = userId;

		const repo = new CatchRecordRepository(event.locals.supabase, userId);
		const upsertedRecord = await repo.upsert(data);
		return json(upsertedRecord);
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
		const records: Partial<CatchRecord>[] = await event.request.json();

		// Get the user's session and set it on the Supabase client
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new CatchRecordRepository(event.locals.supabase, userId);

		const insertedRecords = [];
		for (const record of records) {
			// Ensure the userId is set to the authenticated user
			record.userId = userId;
			const upsertedRecord = await repo.upsert(record);
			insertedRecords.push(upsertedRecord);
		}

		return json(insertedRecords);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
