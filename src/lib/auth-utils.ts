// Authentication utilities for better error handling and session management

export interface AuthResult {
	isAuthenticated: boolean;
	user: any;
	session: any;
	error?: string;
}

/**
 * Enhanced authentication check with detailed error reporting
 */
export async function checkAuthentication(safeGetSession: () => Promise<{session: any, user: any}>): Promise<AuthResult> {
	try {
		const { session, user } = await safeGetSession();
		
		if (!session) {
			return {
				isAuthenticated: false,
				user: null,
				session: null,
				error: 'No session found'
			};
		}
		
		if (!user) {
			return {
				isAuthenticated: false,
				user: null,
				session: null,
				error: 'No user found in session'
			};
		}
		
		// Check if session is expired
		if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
			return {
				isAuthenticated: false,
				user: null,
				session: null,
				error: 'Session expired'
			};
		}
		
		return {
			isAuthenticated: true,
			user,
			session
		};
	} catch (error: any) {
		return {
			isAuthenticated: false,
			user: null,
			session: null,
			error: error.message || 'Authentication check failed'
		};
	}
}

/**
 * Standard unauthorized response with consistent error format
 */
export function unauthorizedResponse(reason?: string) {
	const message = reason ? `Unauthorized: ${reason}` : 'Unauthorized';
	return {
		error: message,
		authenticated: false,
		timestamp: new Date().toISOString()
	};
}