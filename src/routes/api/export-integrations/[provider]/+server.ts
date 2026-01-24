import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAuth } from '$lib/utils/auth';

const ALLOWED_PROVIDERS = new Set(['google_drive', 'dropbox']);

export const PUT = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { provider } = event.params;

		if (!provider || !ALLOWED_PROVIDERS.has(provider)) {
			return json({ error: 'Invalid provider' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		let body: {
			folderId?: string | null;
			path?: string | null;
		};
		try {
			body = (await event.request.json()) as {
				folderId?: string | null;
				path?: string | null;
			};
		} catch (err) {
			if (err instanceof SyntaxError) {
				return new Response('Malformed JSON', { status: 400 });
			}
			throw err;
		}

		const patch: Record<string, unknown> = {};
		if (body.folderId !== undefined) patch.folderId = body.folderId;
		if (body.path !== undefined) patch.path = body.path;
		if (Object.keys(patch).length === 0) {
			return json({ error: 'No fields to update' }, { status: 400 });
		}

		const { data, error } = await event.locals.supabase
			.from('pokedex_export_integrations')
			.update(patch)
			.eq('userId', userId)
			.is('pokedexId', null)
			.eq('provider', provider)
			.select('id, provider, enabled, fileName, folderId, path, metadata, lastExportedAt, lastError')
			.single();

		if (error || !data) {
			return json({ error: 'Integration not found' }, { status: 404 });
		}

		return json(data);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
