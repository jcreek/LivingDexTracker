import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

/**
 * Validates the user session and returns the authenticated user ID
 * Throws a 401 error if the user is not authenticated
 */
export async function requireAuth(event: RequestEvent): Promise<string> {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Authentication required');
	}

	return user.id;
}

/**
 * Optionally validates the user session and returns the user ID if authenticated
 * Returns null if not authenticated (no error thrown)
 */
export async function getOptionalUserId(event: RequestEvent): Promise<string | null> {
	try {
		const { session, user } = await event.locals.safeGetSession();
		return user?.id || null;
	} catch {
		return null;
	}
}
