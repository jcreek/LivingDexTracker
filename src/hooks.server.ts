import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { compressResponse } from '$lib/server/compression';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			/**
			 * Note: You have to add the `path` variable to the set method due to sveltekit's cookie
			 * API requiring this to be set, setting the path to '/' will replicate previous/standard
			 * behaviour (https://kit.svelte.dev/docs/types#public-types-cookies)
			 */
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession`, which is unsafe on the server because it
	 * doesn't validate the JWT, this function validates the JWT by first calling
	 * `getUser` and aborts early if the JWT signature is invalid.
	 */
	// getUser is a network round trip to Supabase Auth. Layout and page loads (and API routes) all
	// ask for the session, so validate once per request and share the result.
	let sessionPromise: ReturnType<App.Locals['safeGetSession']> | null = null;
	event.locals.safeGetSession = () => {
		sessionPromise ??= (async () => {
			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();
			if (error) {
				return { session: null, user: null };
			}

			const {
				data: { session }
			} = await event.locals.supabase.auth.getSession();
			return { session, user };
		})();
		return sessionPromise;
	};

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
	return compressResponse(event.request, response);
};
