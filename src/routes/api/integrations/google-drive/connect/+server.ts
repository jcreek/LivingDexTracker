import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import { createOAuthState, setOAuthStateCookie } from '$lib/utils/oauthState';
import { getEnv } from '$lib/utils/env';

export const GET = async (event: RequestEvent) => {
	const userId = await requireAuth(event);
	const url = new URL(event.request.url);
	const pokedexId = url.searchParams.get('pokedexId');
	const fileName = url.searchParams.get('fileName');
	const folderId = url.searchParams.get('folderId');
	const returnToRaw = url.searchParams.get('returnTo');
	const returnTo =
		returnToRaw && returnToRaw.startsWith('/') && !returnToRaw.startsWith('//')
			? returnToRaw
			: '/backup-settings';

	if (pokedexId) {
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const pokedexRepo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await pokedexRepo.findById(pokedexId);
		if (!pokedex) {
			throw redirect(302, '/my-pokedexes');
		}
	}

	const env = getEnv();
	const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
	if (!clientId) {
		const missingClientRedirect = pokedexId
			? `/pokedex/${pokedexId}?export=google-missing-client`
			: '/pokedex?export=google-missing-client';
		throw redirect(302, missingClientRedirect);
	}

	const state = createOAuthState();
	setOAuthStateCookie(event, 'google_drive', {
		state,
		userId,
		pokedexId,
		provider: 'google_drive',
		fileName,
		folderId,
		returnTo
	});

	const redirectUri = `${event.url.origin}/api/integrations/google-drive/callback`;
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: [
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.metadata.readonly'
		].join(' '),
		access_type: 'offline',
		prompt: 'consent',
		include_granted_scopes: 'true',
		state
	});

	throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
