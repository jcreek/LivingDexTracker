import { json, error } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import { type CatchRecord } from '$lib/models/CatchRecord';
import CatchRecordRepository from '$lib/repositories/CatchRecordRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	let catchData = null as CatchRecord[] | null;

	try {
		const userId = await requireAuth(event);
		await dbConnect();
		const repo = new CatchRecordRepository();
		catchData = await repo.findByUserId(userId);
		// order by pokedexEntryId property, ascending
		catchData = catchData.sort((a, b) => a.pokedexEntryId - b.pokedexEntryId);
	} catch (error) {
		console.error(error);
		if (error.status) {
			// Re-throw SvelteKit errors (like 401)
			throw error;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		dbDisconnect();
	}

	return json(catchData);
};

export const PUT = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const data: Partial<CatchRecord> = await event.request.json();
		
		// Ensure the userId is set to the authenticated user
		data.userId = userId;
		
		await dbConnect();
		const repo = new CatchRecordRepository();
		const upsertedRecord = await repo.upsert(data);
		return json(upsertedRecord);
	} catch (err) {
		console.error(err);
		if (err.status) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		await dbDisconnect();
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const records: Partial<CatchRecord>[] = await event.request.json();
		await dbConnect();
		const repo = new CatchRecordRepository();

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
		if (err.status) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	} finally {
		await dbDisconnect();
	}
};
