export const load = async ({ url, parent }) => {
	const { supabase, session } = await parent();

	// Get the pokedexId from URL parameters
	const pokedexId = url.searchParams.get('pokedexId');

	return {
		supabase,
		session,
		pokedexId
	};
};
