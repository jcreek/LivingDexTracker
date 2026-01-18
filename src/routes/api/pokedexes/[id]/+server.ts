import { json } from '@sveltejs/kit';
import type { Pokedex } from '$lib/models/Pokedex';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { recalculatePokedexMappings } from '$lib/services/PokedexMappingService';
import { resolveDexScopes, setPokedexDexScopes } from '$lib/services/PokedexDexScopeService';

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
	let requestedName: string | undefined;
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;
		const data: Partial<Pokedex> = await event.request.json();
		requestedName = typeof data.name === 'string' ? data.name : undefined;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);

		// Fetch the existing pokedex before update to compare values
		const existingPokedex = await repo.findById(id);
		if (!existingPokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const pokedex = await repo.update(id, data);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const dexScopesProvided = Object.prototype.hasOwnProperty.call(data, 'dexScopes');
		const requestedDexScopes =
			dexScopesProvided && Array.isArray(data.dexScopes)
				? data.dexScopes
				: existingPokedex.dexScopes || [];

		const resolvedDexScopes = await resolveDexScopes(event.locals.supabase, {
			...pokedex,
			dexScopes: requestedDexScopes
		});
		pokedex.dexScopes = resolvedDexScopes;

		const existingDexScopes = new Set(existingPokedex.dexScopes || []);
		const nextDexScopes = new Set(resolvedDexScopes);
		const dexScopesChanged =
			existingDexScopes.size !== nextDexScopes.size ||
			[...existingDexScopes].some((dexId) => !nextDexScopes.has(dexId));

		if (dexScopesChanged) {
			await setPokedexDexScopes(event.locals.supabase, id, resolvedDexScopes);
		}

		// Recalculate pokedex_entries_mapping if configuration changed
		// Only recalculate if isFormDex, gameScope, or dexScopes changed
		// Compare the persisted result (pokedex) to existingPokedex to catch changes that repo.update may normalize or default
		const configChanged =
			pokedex.isFormDex !== existingPokedex.isFormDex ||
			pokedex.gameScope !== existingPokedex.gameScope ||
			dexScopesChanged;

		if (configChanged) {
			await recalculatePokedexMappings(event.locals.supabase, id, pokedex);
		}

		return json(pokedex);
	} catch (err) {
		console.error(err);

		// Unique constraint violation (duplicate pokédex name for this user)
		if (
			err &&
			typeof err === 'object' &&
			'code' in err &&
			(err as { code?: unknown }).code === '23505'
		) {
			return json(
				{
					error: requestedName
						? `You already have a Pokédex named "${requestedName}". Please choose a different name.`
						: 'You already have a Pokédex with that name. Please choose a different name.'
				},
				{ status: 409 }
			);
		}

		if (err && typeof err === 'object' && 'status' in err) throw err;
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
