import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	try {
		// Set the user's session on the Supabase client if authenticated
		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const supabase = event.locals.supabase;
		const pokedexId = event.params.id;

		if (!pokedexId) {
			return json({ error: 'Pokédex ID is required' }, { status: 400 });
		}

		// Get the pokédex configuration
		const { data: pokedex, error: pokedexError } = await supabase
			.from('user_pokedexes')
			.select('*')
			.eq('id', pokedexId)
			.single();

		if (pokedexError || !pokedex) {
			return json({ error: 'Pokédx not found' }, { status: 404 });
		}

		// Get total count of Pokémon in this pokédx
		let totalQuery;
		if (pokedex.regional_pokedex_name === 'national') {
			// National dex query
			totalQuery = supabase.from('pokedex_entries').select('*', { count: 'exact', head: true });

			// Apply filters based on pokédx settings
			if (!pokedex.include_forms) {
				totalQuery = totalQuery.is('form', null);
			}
		} else {
			// Regional dex query
			totalQuery = supabase
				.from('regional_pokedex_entries')
				.select('pokedex_entries(*)', { count: 'exact', head: true })
				.eq('regional_pokedex_name', pokedex.regional_pokedex_name);
		}

		const { count: totalCount, error: totalError } = await totalQuery;

		if (totalError) {
			console.error('Error getting total count:', totalError);
			return json({ error: 'Failed to get total count' }, { status: 500 });
		}

		// Get catch records stats for this pokédx
		const { data: catchStats, error: catchError } = await supabase
			.from('catch_records')
			.select('caught, catch_status')
			.eq('pokedex_id', pokedexId);

		if (catchError) {
			console.error('Error getting catch stats:', catchError);
			return json({ error: 'Failed to get catch statistics' }, { status: 500 });
		}

		// Calculate statistics
		const caught = catchStats?.filter((record: { caught: boolean }) => record.caught === true).length || 0;
		const readyToEvolve = catchStats?.filter(
			(record: { catch_status: string | null }) => record.catch_status === 'ready_to_evolve'
		).length || 0;
		const total = totalCount || 0;

		return json({
			caught,
			total,
			readyToEvolve,
			completionPercentage: total > 0 ? Math.round((caught / total) * 100) : 0
		});
	} catch (error) {
		console.error('Error in pokédx stats API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
