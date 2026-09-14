import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import { createBrowserClient, isBrowser, parse, serialize } from '@supabase/ssr';
import type { CookieSerializeOptions } from 'cookie';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');
	const recoveryIntent =
		isBrowser() &&
		window.location.pathname === '/reset-password' &&
		(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery' ||
			new URL(window.location.href).searchParams.has('code'));

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			get(key: string) {
				if (!isBrowser()) {
					return JSON.stringify(data.session);
				}

				const cookie = parse(document.cookie);
				return cookie[key];
			},
			set(key: string, value: string, options: CookieSerializeOptions) {
				if (isBrowser()) document.cookie = serialize(key, value, { ...options, path: '/' });
			},
			remove(key: string, options: CookieSerializeOptions) {
				if (isBrowser()) {
					document.cookie = serialize(key, '', { ...options, path: '/', maxAge: 0 });
				}
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

	return { supabase, session, recoveryIntent };
};
