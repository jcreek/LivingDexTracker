import { describe, expect, it, vi } from 'vitest';
import {
	clearOAuthStateCookie,
	createOAuthState,
	readOAuthStateCookie,
	setOAuthStateCookie,
	type OAuthStatePayload
} from '../../src/lib/utils/oauthState';

function eventWithCookie(raw?: string) {
	return {
		url: new URL('https://example.test/callback'),
		cookies: {
			get: vi.fn(() => raw),
			set: vi.fn(),
			delete: vi.fn()
		}
	} as never;
}

describe('OAuth state cookies', () => {
	it('creates opaque unique state values', () => {
		const first = createOAuthState();
		const second = createOAuthState();
		expect(first).toMatch(/^[0-9a-f-]{36}$/);
		expect(second).not.toBe(first);
	});

	it('writes a secure, short-lived, provider-scoped cookie', () => {
		const event = eventWithCookie();
		const payload: OAuthStatePayload = {
			state: 'state-1',
			userId: 'user-1',
			provider: 'google_drive',
			returnTo: '/backup-settings'
		};
		setOAuthStateCookie(event, 'google_drive', payload);
		expect(event.cookies.set).toHaveBeenCalledWith(
			'oauth_state_google_drive',
			JSON.stringify(payload),
			expect.objectContaining({ httpOnly: true, sameSite: 'lax', secure: true, maxAge: 600 })
		);
	});

	it('reads only structurally valid state', () => {
		expect(readOAuthStateCookie(eventWithCookie('{bad json'), 'dropbox')).toBeNull();
		expect(readOAuthStateCookie(eventWithCookie('{}'), 'dropbox')).toBeNull();
		expect(readOAuthStateCookie(eventWithCookie(), 'dropbox')).toBeNull();
		expect(
			readOAuthStateCookie(
				eventWithCookie(JSON.stringify({ state: 's', userId: 'u', provider: 'dropbox' })),
				'dropbox'
			)
		).toMatchObject({ state: 's', userId: 'u' });
	});

	it('clears the provider cookie at the shared path', () => {
		const event = eventWithCookie();
		clearOAuthStateCookie(event, 'dropbox');
		expect(event.cookies.delete).toHaveBeenCalledWith('oauth_state_dropbox', { path: '/' });
	});
});
