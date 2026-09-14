import { describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();
const getSession = vi.fn();

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
	PUBLIC_SUPABASE_ANON_KEY: 'anon'
}));
vi.mock('@supabase/ssr', () => ({
	createServerClient: () => ({ auth: { getUser, getSession } })
}));

const { handle } = await import('../../src/hooks.server');

async function runHandle() {
	const event = {
		cookies: { getAll: () => [], set: vi.fn() },
		locals: {}
	} as unknown as Parameters<typeof handle>[0]['event'];
	await handle({ event, resolve: vi.fn(async () => new Response()) } as never);
	return event.locals;
}

describe('safeGetSession', () => {
	it('validates the session with Supabase Auth only once per request', async () => {
		getUser.mockReset().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
		getSession.mockReset().mockResolvedValue({ data: { session: { access_token: 't' } } });
		const locals = await runHandle();

		const [first, second] = await Promise.all([locals.safeGetSession(), locals.safeGetSession()]);
		const third = await locals.safeGetSession();

		expect(getUser).toHaveBeenCalledTimes(1);
		expect(first.user?.id).toBe('user-1');
		expect(second).toBe(first);
		expect(third).toBe(first);
	});

	it('does not share a session between requests', async () => {
		getUser.mockReset().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
		getSession.mockReset().mockResolvedValue({ data: { session: {} } });
		await (await runHandle()).safeGetSession();
		await (await runHandle()).safeGetSession();

		expect(getUser).toHaveBeenCalledTimes(2);
	});

	it('returns no session when the JWT is rejected', async () => {
		getUser.mockReset().mockResolvedValue({ data: { user: null }, error: new Error('bad jwt') });
		getSession.mockReset();
		const locals = await runHandle();

		await expect(locals.safeGetSession()).resolves.toEqual({ session: null, user: null });
		expect(getSession).not.toHaveBeenCalled();
	});
});
