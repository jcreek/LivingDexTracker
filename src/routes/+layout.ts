import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');
	let recoveryExchangeSucceeded = false;
	let hashRecoveryCallback = false;
	let codeRecoveryCallback = false;
	if (isBrowser() && window.location.pathname === '/reset-password') {
		const hash = new URLSearchParams(window.location.hash.slice(1));
		hashRecoveryCallback =
			hash.get('type') === 'recovery' && hash.has('access_token') && hash.has('refresh_token');
		codeRecoveryCallback = new URL(window.location.href).searchParams.has('code');
	}
	const authFetch: typeof fetch = async (input, init) => {
		const response = await fetch(input, init);
		if (codeRecoveryCallback && response.ok) {
			const requestUrl = new URL(
				typeof input === 'string' || input instanceof URL ? input : input.url,
				window.location.origin
			);
			if (
				requestUrl.pathname.endsWith('/auth/v1/token') &&
				requestUrl.searchParams.get('grant_type') === 'pkce'
			) {
				recoveryExchangeSucceeded = true;
			}
		}
		return response;
	};

	// The browser client manages document.cookie itself, including removing stale session chunks.
	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch: authFetch
				}
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	return {
		supabase,
		session,
		recoveryIntent: !!session && (hashRecoveryCallback || recoveryExchangeSucceeded)
	};
};
