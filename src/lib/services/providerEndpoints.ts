import { getEnv } from '$lib/utils/env';

export type ProviderEndpoints = {
	google: { authorize: string; token: string; driveApi: string; driveUpload: string };
	dropbox: { authorize: string; token: string; upload: string };
};

const DEFAULTS: ProviderEndpoints = {
	google: {
		authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
		token: 'https://oauth2.googleapis.com/token',
		driveApi: 'https://www.googleapis.com/drive/v3',
		driveUpload: 'https://www.googleapis.com/upload/drive/v3'
	},
	dropbox: {
		authorize: 'https://www.dropbox.com/oauth2/authorize',
		token: 'https://api.dropbox.com/oauth2/token',
		upload: 'https://content.dropboxapi.com/2/files/upload'
	}
};

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

/**
 * These endpoints receive the OAuth client secret and the user's refresh token, so an override
 * is only ever a local test seam - never a deployment knob. Two guards, because the env is
 * read at runtime (`$env/dynamic/private`) and a single injected variable would otherwise be
 * enough to redirect those credentials to an arbitrary host:
 *
 *  1. overrides are ignored unless ALLOW_PROVIDER_ENDPOINT_OVERRIDES is exactly "true", and
 *  2. even then, only loopback URLs are accepted.
 */
function isLocalOverride(value: string): boolean {
	try {
		const url = new URL(value);
		return (
			(url.protocol === 'http:' || url.protocol === 'https:') && LOOPBACK_HOSTS.has(url.hostname)
		);
	} catch {
		return false;
	}
}

export function resolveProviderEndpoints(
	env: Record<string, string | undefined>
): ProviderEndpoints {
	const overridesAllowed = env.ALLOW_PROVIDER_ENDPOINT_OVERRIDES === 'true';
	const pick = (override: string | undefined, fallback: string) =>
		overridesAllowed && override && isLocalOverride(override) ? override : fallback;

	return {
		google: {
			authorize: pick(env.GOOGLE_OAUTH_AUTHORIZE_URL, DEFAULTS.google.authorize),
			token: pick(env.GOOGLE_OAUTH_TOKEN_URL, DEFAULTS.google.token),
			driveApi: pick(env.GOOGLE_DRIVE_API_URL, DEFAULTS.google.driveApi),
			driveUpload: pick(env.GOOGLE_DRIVE_UPLOAD_URL, DEFAULTS.google.driveUpload)
		},
		dropbox: {
			authorize: pick(env.DROPBOX_OAUTH_AUTHORIZE_URL, DEFAULTS.dropbox.authorize),
			token: pick(env.DROPBOX_OAUTH_TOKEN_URL, DEFAULTS.dropbox.token),
			upload: pick(env.DROPBOX_UPLOAD_URL, DEFAULTS.dropbox.upload)
		}
	};
}

export function getProviderEndpoints(): ProviderEndpoints {
	return resolveProviderEndpoints(getEnv());
}

export const PROVIDER_ENDPOINT_DEFAULTS = DEFAULTS;
