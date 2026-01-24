import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import PokedexExportIntegrationRepository from '$lib/repositories/PokedexExportIntegrationRepository';
import { requireAuth } from '$lib/utils/auth';

export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexExportIntegrationRepository(event.locals.supabase, userId, null);
		const integrations = await repo.listAll();

		const safe = integrations.map((integration) => ({
			id: integration._id,
			provider: integration.provider,
			enabled: integration.enabled,
			fileName: integration.fileName,
			folderId: integration.folderId,
			path: integration.path,
			metadata: integration.metadata,
			lastExportedAt: integration.lastExportedAt,
			lastError: integration.lastError
		}));

		return json(safe);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
