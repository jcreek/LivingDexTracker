import { randomUUID } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';

export type OAuthStatePayload = {
	state: string;
	userId: string;
	pokedexId?: string | null;
	provider: string;
	fileName?: string | null;
	folderId?: string | null;
	path?: string | null;
	returnTo?: string | null;
};

const STATE_MAX_AGE = 10 * 60; // 10 minutes

export function createOAuthState(): string {
	return randomUUID();
}

function cookieName(provider: string): string {
	return `oauth_state_${provider}`;
}

export function setOAuthStateCookie(
	event: RequestEvent,
	provider: string,
	payload: OAuthStatePayload
) {
	event.cookies.set(cookieName(provider), JSON.stringify(payload), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: event.url.protocol === 'https:',
		maxAge: STATE_MAX_AGE
	});
}

export function readOAuthStateCookie(
	event: RequestEvent,
	provider: string
): OAuthStatePayload | null {
	const raw = event.cookies.get(cookieName(provider));
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as OAuthStatePayload;
		if (!parsed?.state || !parsed?.userId) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function clearOAuthStateCookie(event: RequestEvent, provider: string) {
	event.cookies.delete(cookieName(provider), { path: '/' });
}
