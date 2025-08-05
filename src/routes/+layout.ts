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
					const cookie = cookies.find(c => c.startsWith(`${key}=`));
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
		data: { session }
	} = await supabase.auth.getSession();

	return {
		supabase,
		session
	};
};