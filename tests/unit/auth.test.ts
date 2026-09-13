import { describe, expect, it, vi } from 'vitest';
import { getOptionalUserId, requireAuth } from '../../src/lib/utils/auth';

function eventReturning(value: unknown) {
	return { locals: { safeGetSession: vi.fn(async () => value) } } as never;
}

describe('authentication guards', () => {
	it('returns the authenticated user id', async () => {
		await expect(
			requireAuth(eventReturning({ session: {}, user: { id: 'user-1' } }))
		).resolves.toBe('user-1');
	});

	it.each([
		{ session: null, user: null },
		{ session: {}, user: null },
		{ session: null, user: { id: 'user-1' } }
	])('rejects an incomplete authenticated session', async (value) => {
		await expect(requireAuth(eventReturning(value))).rejects.toMatchObject({ status: 401 });
	});

	it('optionally returns a user id or null', async () => {
		await expect(
			getOptionalUserId(eventReturning({ session: {}, user: { id: 'user-2' } }))
		).resolves.toBe('user-2');
		await expect(
			getOptionalUserId(eventReturning({ session: null, user: null }))
		).resolves.toBeNull();
		const throwing = {
			locals: { safeGetSession: vi.fn(async () => Promise.reject(new Error('unavailable'))) }
		} as never;
		await expect(getOptionalUserId(throwing)).resolves.toBeNull();
	});
});
