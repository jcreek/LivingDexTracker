import { json } from '@sveltejs/kit';
import { dbConnect, dbDisconnect } from '$lib/utils/db';
import { type CatchRecord } from '$lib/models/CatchRecord';
import CatchRecordRepository from '$lib/repositories/CatchRecordRepository';

export const GET = async () => {
	let catchData = null as CatchRecord[] | null;

	try {
		await dbConnect();
		const repo = new CatchRecordRepository();
		catchData = await repo.findAll();
		// order by pokedexEntryId property, ascending
		catchData = catchData.sort((a, b) => a.pokedexEntryId - b.pokedexEntryId);
	} catch (error) {
		console.error(error);
	} finally {
		dbDisconnect();
	}

	return json(catchData);
};

export const PUT = async ({ request }) => {
	try {
		const data: Partial<CatchRecord> = await request.json();
		await dbConnect();
		const repo = new CatchRecordRepository();
		const upsertedRecord = await repo.upsert(data);
		return json(upsertedRecord);
	} catch (err) {
		console.error(err);
		throw error(500, 'Internal Server Error');
	} finally {
		await dbDisconnect();
	}
};

export const POST = async ({ request }) => {
	try {
		const records: Partial<CatchRecord>[] = await request.json();
		await dbConnect();
		const repo = new CatchRecordRepository();

		const insertedRecords = [];
		for (const record of records) {
			const upsertedRecord = await repo.upsert(record);
			insertedRecords.push(upsertedRecord);
		}

		return json(insertedRecords);
	} catch (err) {
		console.error(err);
		throw error(500, 'Internal Server Error');
	} finally {
		await dbDisconnect();
	}
};
