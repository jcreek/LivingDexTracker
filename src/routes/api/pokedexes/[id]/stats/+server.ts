import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	try {
		const supabase = createClient(
			env.PRIVATE_SUPABASE_URL ?? '',
			env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ?? ''
		);
		const pokedexId = params.id;

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
			.select('caught, status')
			.eq('pokedex_id', pokedexId);

		if (catchError) {
			console.error('Error getting catch stats:', catchError);
			return json({ error: 'Failed to get catch statistics' }, { status: 500 });
		}

		// Calculate statistics
		const caught = catchStats.filter((record: any) => record.caught === true).length;
		const readyToEvolve = catchStats.filter((record: any) => record.status === 'ready_to_evolve').length;
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
