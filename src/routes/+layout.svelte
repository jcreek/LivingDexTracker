<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import Navigation from '$lib/components/Navigation.svelte';
	import { userStore } from '$lib/stores/user';
	import { handleAuthError, validateAndRefreshSession, isAuthError } from '$lib/utils/auth';

	export let data: LayoutData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	// Update user store when session changes
	$: userStore.set(session?.user || null);

	onMount(() => {
		// Enhanced auth state change handler
		const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
			console.log('Auth state changed:', event, newSession?.user?.id);
			
			// Handle session changes
			if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
			
			// Handle token refresh failures or auth errors
			if (event === 'TOKEN_REFRESHED' && !newSession) {
				console.log('Token refresh failed, clearing session');
				await handleAuthError('Token refresh failed', supabase, false);
			}
			
			// Handle sign out events by clearing everything
			if (event === 'SIGNED_OUT') {
				await handleAuthError('User signed out', supabase, false);
			}
		});

		// Initial session validation on mount
		const checkInitialSession = async () => {
			if (session) {
				const isValid = await validateAndRefreshSession(supabase);
				if (!isValid) {
					console.log('Initial session validation failed');
				}
			}
		};
		
		checkInitialSession();
		
		// Periodic session validation (every 5 minutes)
		const sessionCheckInterval = setInterval(async () => {
			if (session) {
				const isValid = await validateAndRefreshSession(supabase);
				if (!isValid) {
					console.log('Periodic session validation failed');
				}
			}
		}, 5 * 60 * 1000);

		return () => {
			data.subscription.unsubscribe();
			clearInterval(sessionCheckInterval);
		};
	});
</script>

<div class="min-h-screen bg-base-100">
	<Navigation user={session?.user} />
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>
