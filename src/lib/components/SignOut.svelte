<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { clearOfflineData } from '$lib/stores/offlineSync';
	const dispatch = createEventDispatcher();
	let errorMessage = '';
	let isSigningOut = false;

	function emitSignedOutEvent() {
		dispatch('signedOut', {});
	}

	// Access the supabase client from the layout data
	export let supabase: SupabaseClient;

	async function signOut() {
		errorMessage = '';
		isSigningOut = true;
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				errorMessage = `Sign out failed: ${error.message || 'Please try again.'}`;
				dispatch('signOutFailed', { message: errorMessage });
				return;
			}
			try {
				await clearOfflineData();
			} catch (cacheError) {
				console.error('Signed out, but failed to clear offline data', cacheError);
			}
			emitSignedOutEvent();
			await goto('/', { invalidateAll: true });
		} catch (error) {
			console.error('Sign out failed', error);
			errorMessage = 'Sign out failed. Please try again.';
			dispatch('signOutFailed', { message: errorMessage });
		} finally {
			isSigningOut = false;
		}
	}
</script>

<button on:click={signOut} disabled={isSigningOut}>
	{isSigningOut ? 'Signing Out…' : 'Sign Out'}
</button>
