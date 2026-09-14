import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();

	return {
		session,
		user,
		// The universal layout load rebuilds a server-side client from these during SSR.
		cookies: cookies.getAll()
	};
};
