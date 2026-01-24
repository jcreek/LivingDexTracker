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
	const path = url.searchParams.get('path');
	const returnToRaw = url.searchParams.get('returnTo');
	const returnTo =
		returnToRaw && returnToRaw.startsWith('/') ? returnToRaw : '/backup-settings';

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
	const clientId = env.DROPBOX_OAUTH_CLIENT_ID;
	if (!clientId) {
		const missingClientRedirect = pokedexId
			? `/pokedex/${pokedexId}?export=dropbox-missing-client`
			: '/pokedex?export=dropbox-missing-client';
		throw redirect(302, missingClientRedirect);
	}

	const state = createOAuthState();
	setOAuthStateCookie(event, 'dropbox', {
		state,
		userId,
		pokedexId,
		provider: 'dropbox',
		fileName,
		path,
		returnTo
	});

	const redirectUri = `${event.url.origin}/api/integrations/dropbox/callback`;
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		state,
		token_access_type: 'offline',
		scope: 'files.content.write'
	});

	throw redirect(302, `https://www.dropbox.com/oauth2/authorize?${params.toString()}`);
};
