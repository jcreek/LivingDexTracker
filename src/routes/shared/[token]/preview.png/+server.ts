import { error } from '@sveltejs/kit';
import { loadSharedPokedex } from '$lib/services/SharedPokedexService';
import { renderSharePreview } from '$lib/services/SharePreviewService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const shared = await loadSharedPokedex(locals.supabase, params.token);
	if (!shared) throw error(404, 'Shared Pokédex not found');

	const image = await renderSharePreview(shared);
	return new Response(image, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
			'Content-Length': String(image.byteLength)
		}
	});
};
