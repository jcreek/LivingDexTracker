import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			get(key) {
				// Use data from server for initial load
				if (!isBrowser() && data?.cookies) {
					const cookie = data.cookies.find((c: any) => c.name === key);
					return cookie?.value;
				}

				// Use document.cookie for browser
				if (isBrowser()) {
					const cookies = document.cookie.split('; ');
					const cookie = cookies.find((c) => c.startsWith(`${key}=`));
					if (cookie) {
						return decodeURIComponent(cookie.split('=')[1]);
					}
				}

				return undefined;
			},
			set(key, value, options) {
				if (!isBrowser()) return;

				let cookieStr = `${key}=${encodeURIComponent(value)}`;

				if (options?.maxAge) {
					cookieStr += `; max-age=${options.maxAge}`;
				}
				if (options?.expires) {
					cookieStr += `; expires=${options.expires.toUTCString()}`;
				}

				// Always set path to root
				cookieStr += `; path=/`;

				if (options?.domain) {
					cookieStr += `; domain=${options.domain}`;
				}
				if (options?.sameSite) {
					cookieStr += `; samesite=${options.sameSite}`;
				}
				if (options?.secure) {
					cookieStr += `; secure`;
				}

				document.cookie = cookieStr;
			},
			remove(key, options) {
				if (!isBrowser()) return;

				let cookieStr = `${key}=; max-age=0; path=/`;

				if (options?.domain) {
					cookieStr += `; domain=${options.domain}`;
				}

				document.cookie = cookieStr;
			}
		}
	});

	const {
		data: { session },
		error
	} = await supabase.auth.getSession();
	
	// Enhanced session validation
	if (error) {
		console.log('Client session error:', error.message);
	}
	
	// If session exists but appears invalid, attempt refresh
	if (session && session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
		console.log('Session expired, attempting refresh');
		const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
		if (refreshError) {
			console.log('Session refresh failed:', refreshError.message);
			// Clear the invalid session
			await supabase.auth.signOut({ scope: 'local' });
			return {
				supabase,
				session: null
			};
		} else {
			return {
				supabase,
				session: refreshData.session
			};
		}
	}

	return {
		supabase,
		session
	};
};
