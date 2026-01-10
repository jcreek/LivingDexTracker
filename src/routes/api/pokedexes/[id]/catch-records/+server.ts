import { json } from '@sveltejs/kit';
import { type CatchRecord } from '$lib/models/CatchRecord';
import CatchRecordRepository from '$lib/repositories/CatchRecordRepository';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

// GET: Get catch records for specific pokédex
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id: pokedexId } = event.params;

		if (!pokedexId) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		// Verify user owns this pokédex (RLS will also check, but explicit verification is better UX)
		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const repo = new CatchRecordRepository(event.locals.supabase, userId, pokedexId);
		const catchData = await repo.findAll();
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

// PUT: Upsert single catch record for specific pokédex
export const PUT = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id: pokedexId } = event.params;
		const data: Partial<CatchRecord> = await event.request.json();

		if (!pokedexId) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		// Verify user owns this pokédex
		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		// Ensure the data is scoped to this pokédex and user
		data.userId = userId;
		data.pokedexId = pokedexId;

		const repo = new CatchRecordRepository(event.locals.supabase, userId, pokedexId);
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

// POST: Bulk upsert catch records for specific pokédex
export const POST = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id: pokedexId } = event.params;
		const body: unknown = await event.request.json();

		if (!pokedexId) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		if (!Array.isArray(body)) {
			return json({ error: 'Request body must be an array of catch records' }, { status: 400 });
		}
		const invalidIndex = body.findIndex((r) => {
			if (!r || typeof r !== 'object') return true;
			const entryId = (r as Partial<CatchRecord>).pokedexEntryId;
			return entryId === undefined || entryId === null || entryId === '';
		});
		if (invalidIndex !== -1) {
			return json(
				{ error: `Record at index ${invalidIndex} is missing required field "pokedexEntryId"` },
				{ status: 400 }
			);
		}

		const records = body as Array<Partial<CatchRecord> & Pick<CatchRecord, 'pokedexEntryId'>>;

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		// Verify user owns this pokédex
		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const repo = new CatchRecordRepository(event.locals.supabase, userId, pokedexId);

		// Ensure the data is scoped to this pokédex and user
		const scoped = records.map((r) => ({
			...r,
			userId,
			pokedexId
		}));

		// Prefer a single bulk upsert when the DB supports it; fall back to per-record upserts.
		try {
			const upserted = await repo.bulkUpsert(scoped);
			return json(upserted);
		} catch (bulkErr) {
			console.warn('Bulk upsert failed; falling back to per-record upserts:', bulkErr);
			const insertedRecords = [];
			for (const record of scoped) {
				const upsertedRecord = await repo.upsert(record);
				insertedRecords.push(upsertedRecord);
			}
			return json(insertedRecords);
		}
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
