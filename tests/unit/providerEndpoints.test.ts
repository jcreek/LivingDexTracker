import { describe, expect, it } from 'vitest';
import {
	PROVIDER_ENDPOINT_DEFAULTS,
	resolveProviderEndpoints
} from '$lib/services/providerEndpoints';

const localOverrides = {
	GOOGLE_OAUTH_AUTHORIZE_URL: 'http://127.0.0.1:4199/google/authorize',
	GOOGLE_OAUTH_TOKEN_URL: 'http://127.0.0.1:4199/google/token',
	GOOGLE_DRIVE_API_URL: 'http://127.0.0.1:4199/google/drive',
	GOOGLE_DRIVE_UPLOAD_URL: 'http://127.0.0.1:4199/google/upload',
	DROPBOX_OAUTH_AUTHORIZE_URL: 'http://127.0.0.1:4199/dropbox/authorize',
	DROPBOX_OAUTH_TOKEN_URL: 'http://127.0.0.1:4199/dropbox/token',
	DROPBOX_UPLOAD_URL: 'http://127.0.0.1:4199/dropbox/files/upload'
};

describe('provider endpoints', () => {
	it('uses the real provider endpoints when nothing is configured', () => {
		expect(resolveProviderEndpoints({})).toEqual(PROVIDER_ENDPOINT_DEFAULTS);
	});

	it('ignores overrides unless they are explicitly allowed', () => {
		// The exfiltration case: these variables carry the client secret and refresh token, and
		// the env is read per request in production.
		expect(resolveProviderEndpoints(localOverrides)).toEqual(PROVIDER_ENDPOINT_DEFAULTS);
		expect(
			resolveProviderEndpoints({ ...localOverrides, ALLOW_PROVIDER_ENDPOINT_OVERRIDES: 'false' })
		).toEqual(PROVIDER_ENDPOINT_DEFAULTS);
		expect(
			resolveProviderEndpoints({ ...localOverrides, ALLOW_PROVIDER_ENDPOINT_OVERRIDES: '1' })
		).toEqual(PROVIDER_ENDPOINT_DEFAULTS);
	});

	it('applies allowed loopback overrides', () => {
		expect(
			resolveProviderEndpoints({ ...localOverrides, ALLOW_PROVIDER_ENDPOINT_OVERRIDES: 'true' })
		).toEqual({
			google: {
				authorize: localOverrides.GOOGLE_OAUTH_AUTHORIZE_URL,
				token: localOverrides.GOOGLE_OAUTH_TOKEN_URL,
				driveApi: localOverrides.GOOGLE_DRIVE_API_URL,
				driveUpload: localOverrides.GOOGLE_DRIVE_UPLOAD_URL
			},
			dropbox: {
				authorize: localOverrides.DROPBOX_OAUTH_AUTHORIZE_URL,
				token: localOverrides.DROPBOX_OAUTH_TOKEN_URL,
				upload: localOverrides.DROPBOX_UPLOAD_URL
			}
		});
	});

	it.each([
		'https://attacker.example/token',
		'http://127.0.0.1.attacker.example/token',
		'http://[::2]/token',
		'file:///etc/passwd',
		'not-a-url',
		''
	])('refuses the non-loopback override %j even when overrides are allowed', (value) => {
		const endpoints = resolveProviderEndpoints({
			ALLOW_PROVIDER_ENDPOINT_OVERRIDES: 'true',
			GOOGLE_OAUTH_TOKEN_URL: value,
			DROPBOX_OAUTH_TOKEN_URL: value
		});
		expect(endpoints.google.token).toBe(PROVIDER_ENDPOINT_DEFAULTS.google.token);
		expect(endpoints.dropbox.token).toBe(PROVIDER_ENDPOINT_DEFAULTS.dropbox.token);
	});

	it('accepts localhost as well as 127.0.0.1', () => {
		expect(
			resolveProviderEndpoints({
				ALLOW_PROVIDER_ENDPOINT_OVERRIDES: 'true',
				GOOGLE_OAUTH_TOKEN_URL: 'http://localhost:4199/google/token'
			}).google.token
		).toBe('http://localhost:4199/google/token');
	});
});
