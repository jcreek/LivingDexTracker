export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	return {
		supabase,
		session
	};
};
