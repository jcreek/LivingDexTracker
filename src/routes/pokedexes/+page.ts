export const load = async ({ fetch, parent }) => {
	const { session } = await parent();
	
	if (!session) {
		return {
			pokedexes: []
		};
	}

	const response = await fetch('/api/pokedexes');
	const { pokedexes } = await response.json();
	
	return {
		pokedexes
	};
};
