import { requireLoopbackUrl } from '../support/loopback';

/**
 * Deletes the users each BDD run provisions, so repeated local runs do not need a full
 * `supabase db reset` to stay clean. Pokédexes, catch records and integrations follow via the
 * schema's cascades. Only the suite's own synthetic addresses are touched.
 */
const SUPABASE_URL = requireLoopbackUrl(
	process.env.TEST_SUPABASE_URL ?? 'http://127.0.0.1:54321',
	'TEST_SUPABASE_URL'
);
const OWNED_EMAIL = /^(bdd|other|integration)-.*@example\.test$/;

type AdminUser = { id: string; email?: string };

async function adminRequest(path: string, init: RequestInit = {}) {
	const key = process.env.E2E_SERVICE_ROLE_KEY;
	if (!key) return null;
	return fetch(`${SUPABASE_URL}${path}`, {
		...init,
		headers: {
			apikey: key,
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			...(init.headers ?? {})
		}
	});
}

export default async function globalTeardown() {
	const listed = await adminRequest('/auth/v1/admin/users?per_page=1000');
	if (!listed) {
		console.warn('Skipping BDD teardown: E2E_SERVICE_ROLE_KEY is not set.');
		return;
	}
	if (!listed.ok) {
		console.warn(`Skipping BDD teardown: unable to list users (${listed.status}).`);
		return;
	}

	const { users = [] } = (await listed.json()) as { users?: AdminUser[] };
	const disposable = users.filter((user) => user.email && OWNED_EMAIL.test(user.email));

	let failures = 0;
	for (const user of disposable) {
		const deleted = await adminRequest(`/auth/v1/admin/users/${user.id}`, { method: 'DELETE' });
		if (!deleted?.ok) failures++;
	}

	console.log(
		`BDD teardown removed ${disposable.length - failures} of ${disposable.length} test users.`
	);
}
