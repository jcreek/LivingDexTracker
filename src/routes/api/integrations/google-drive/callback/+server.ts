import { json, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import PokedexExportIntegrationRepository from '$lib/repositories/PokedexExportIntegrationRepository';
import { requireAuth } from '$lib/utils/auth';
import { clearOAuthStateCookie, readOAuthStateCookie } from '$lib/utils/oauthState';
import { getEnv } from '$lib/utils/env';

export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const url = new URL(event.request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');
		const errorParam = url.searchParams.get('error');

		const oauthState = readOAuthStateCookie(event, 'google_drive');
		if (!oauthState || !state || oauthState.state !== state || oauthState.userId !== userId) {
			clearOAuthStateCookie(event, 'google_drive');
			return json({ error: 'Invalid OAuth state' }, { status: 400 });
		}

		clearOAuthStateCookie(event, 'google_drive');

		const fallbackReturnTo = oauthState.pokedexId
			? `/pokedex/${oauthState.pokedexId}`
			: '/backup-settings';
		const baseReturnTo =
			oauthState.returnTo && oauthState.returnTo.startsWith('/')
				? oauthState.returnTo
				: fallbackReturnTo;
		const returnTo = baseReturnTo.includes('?')
			? `${baseReturnTo}&export=google`
			: `${baseReturnTo}?export=google`;

		if (errorParam) {
			throw redirect(302, `${returnTo}-denied`);
		}

		if (!code) {
			return json({ error: 'Missing OAuth code' }, { status: 400 });
		}

		const env = getEnv();
		const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
		const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
		if (!clientId || !clientSecret) {
			return json({ error: 'Missing Google OAuth credentials' }, { status: 500 });
		}

		const redirectUri = `${event.url.origin}/api/integrations/google-drive/callback`;

		const tokenParams = new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		});

		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: tokenParams.toString()
		});

		if (!tokenResponse.ok) {
			const text = await tokenResponse.text();
			return json({ error: `Google token exchange failed: ${text}` }, { status: 500 });
		}

		const tokenData = (await tokenResponse.json()) as {
			access_token: string;
			expires_in?: number;
			refresh_token?: string;
			scope?: string;
		};

		const expiresAt = tokenData.expires_in
			? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
			: null;

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexExportIntegrationRepository(event.locals.supabase, userId, null);

		const fileName = oauthState.fileName?.trim() ? oauthState.fileName : null;
		const folderId = oauthState.folderId?.trim() ? oauthState.folderId : null;

		try {
			await repo.upsert({
				provider: 'google_drive',
				enabled: true,
				fileName,
				folderId,
				accessToken: tokenData.access_token,
				refreshToken: tokenData.refresh_token ?? null,
				accessTokenExpiresAt: expiresAt,
				metadata: tokenData.scope ? { scope: tokenData.scope } : null
			});
		} catch (saveError) {
			console.error('Google Drive integration save failed:', saveError);
			throw redirect(302, `${returnTo}-error`);
		}

		throw redirect(302, `${returnTo}-connected`);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
