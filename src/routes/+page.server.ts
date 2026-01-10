import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the homepage
 *
 * Fetches public statistics from the database and passes them to the page component.
 * Stats are cached for 24 hours to improve performance.
 */
export const load: PageServerLoad = async ({ fetch }) => {
	// Fetch stats from database
	const statsResponse = await fetch('/api/stats');
	const statsData = await statsResponse.json();

	return {
		stats: statsData.error ? null : statsData
	};
};
