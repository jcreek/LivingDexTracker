import { error } from '@sveltejs/kit';
import { loadSharedPokedex } from '$lib/services/SharedPokedexService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url, setHeaders }) => {
	const shared = await loadSharedPokedex(locals.supabase, params.token);
	if (!shared) throw error(404, 'Shared Pokédex not found');
	setHeaders({
		'Referrer-Policy': 'no-referrer',
		'X-Robots-Tag': 'noindex, nofollow'
	});

	const canonicalUrl = `${url.origin}/shared/${params.token}`;
	return {
		shared,
		canonicalUrl,
		previewUrl: `${canonicalUrl}/preview.png`
	};
};
