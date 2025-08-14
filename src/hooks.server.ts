import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

// Suppress Supabase server-side warnings
const originalWarn = console.warn;
console.warn = (...args) => {
	const message = args[0];
	if (
		typeof message === 'string' &&
		(message.includes('supabase.auth.getSession()') ||
			message.includes('Using the user object as returned from supabase.auth.getSession()') ||
			message.includes('could be insecure'))
	) {
		return; // Suppress Supabase auth warnings
	}
	originalWarn.apply(console, args);
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			/**
			 * Note: You have to add the `path` variable to the
			 * set and remove method due to sveltekit's cookie API
			 * requiring this to be set, setting the path to an empty string
			 * will replicate previous/standard behaviour (https://kit.svelte.dev/docs/types#public-types-cookies)
			 */
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' });
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession`, which is unsafe on the server because it
	 * doesn't validate the JWT, this function validates the JWT by first calling
	 * `getUser` and aborts early if the JWT signature is invalid.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		
		if (error) {
			// Enhanced logging for debugging auth issues
			if (error.message !== 'Auth session missing!' && error.message !== 'JWT expired') {
				console.log('Auth error in safeGetSession:', error.message);
			}
			
			// Clear any potentially corrupt auth cookies
			if (error.message.includes('JWT') || error.message.includes('invalid') || error.message.includes('malformed')) {
				// Clear common Supabase auth cookies by name
				const authCookieNames = [
					'sb-access-token',
					'sb-refresh-token', 
					'supabase-auth-token',
					'supabase.auth.token',
					'sb-localhost-auth-token'
				];
				
				for (const cookieName of authCookieNames) {
					event.cookies.delete(cookieName, { path: '/' });
				}
			}
			
			return { session: null, user: null, error: error.message };
		}

		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();
		
		if (sessionError) {
			console.log('Session error:', sessionError.message);
			return { session: null, user: null, error: sessionError.message };
		}
		
		// Additional validation - ensure session matches user
		if (session && session.user && session.user.id !== user.id) {
			console.log('Session/user mismatch detected');
			return { session: null, user: null, error: 'Session user mismatch' };
		}
		
		// Check if session is expired
		if (session && session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
			console.log('Session expired detected in safeGetSession');
			return { session: null, user: null, error: 'Session expired' };
		}
		
		return { session, user, error: null };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
