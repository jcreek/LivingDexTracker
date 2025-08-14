import { goto } from '$app/navigation';
import { invalidate } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Handle authentication errors consistently across the app
 */
export async function handleAuthError(error: any, supabase: SupabaseClient, redirectToSignIn: boolean = true) {
	console.log('Handling auth error:', error?.message || error);
	
	// Clear invalid session and cookies
	await supabase.auth.signOut({ scope: 'local' });
	
	// Clear any remaining auth cookies manually
	if (typeof document !== 'undefined') {
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const eqPos = cookie.indexOf('=');
			const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
			if (name.startsWith('sb-') || name.includes('supabase')) {
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
			}
		}
	}
	
	// Invalidate auth-dependent data
	await invalidate('supabase:auth');
	
	// Redirect to sign-in if requested
	if (redirectToSignIn && typeof window !== 'undefined') {
		goto('/signin');
	}
}

/**
 * Check if an error is auth-related
 */
export function isAuthError(error: any): boolean {
	if (!error) return false;
	
	const message = error.message || error.toString();
	return (
		message.includes('JWT') ||
		message.includes('unauthorized') ||
		message.includes('Unauthorized') ||
		message.includes('invalid') ||
		message.includes('expired') ||
		message.includes('Auth session missing') ||
		message.includes('Session from session_id claim in JWT does not exist') ||
		error.status === 401 ||
		error.status === 403
	);
}

/**
 * Enhanced fetch wrapper that handles auth errors
 */
export async function authFetch(url: string, options: RequestInit = {}, supabase: SupabaseClient) {
	try {
		const response = await fetch(url, options);
		
		// Handle auth errors in response
		if (response.status === 401 || response.status === 403) {
			const errorData = await response.json().catch(() => ({}));
			if (isAuthError(errorData) || isAuthError(errorData.error)) {
				await handleAuthError(errorData.error || 'Authentication failed', supabase);
				throw new Error('Authentication failed');
			}
		}
		
		return response;
	} catch (error) {
		// Handle network-level auth errors
		if (isAuthError(error)) {
			await handleAuthError(error, supabase);
		}
		throw error;
	}
}

/**
 * Validate current session and refresh if needed
 */
export async function validateAndRefreshSession(supabase: SupabaseClient): Promise<boolean> {
	try {
		const { data: { session }, error } = await supabase.auth.getSession();
		
		if (error) {
			console.log('Session validation error:', error.message);
			await handleAuthError(error, supabase, false);
			return false;
		}
		
		if (!session) {
			return false;
		}
		
		// Check if session is about to expire (within 5 minutes)
		const expiresAt = new Date(session.expires_at! * 1000);
		const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
		
		if (expiresAt < fiveMinutesFromNow) {
			console.log('Session expiring soon, attempting refresh');
			const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
			
			if (refreshError) {
				console.log('Session refresh failed:', refreshError.message);
				await handleAuthError(refreshError, supabase, false);
				return false;
			}
			
			console.log('Session refreshed successfully');
		}
		
		// Validate the user is still valid
		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError || !userData.user) {
			console.log('User validation failed:', userError?.message);
			await handleAuthError(userError || 'User validation failed', supabase, false);
			return false;
		}
		
		return true;
	} catch (error) {
		console.log('Session validation threw error:', error);
		await handleAuthError(error, supabase, false);
		return false;
	}
}