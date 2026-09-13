<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	const dispatch = createEventDispatcher();

	function emitSignedOutEvent() {
		dispatch('signedOut', {});
	}

	// Access the supabase client from the layout data
	export let supabase: SupabaseClient;

	async function signOut() {
		// `.then(() => {...})` resolved to undefined, so destructuring `error` off it threw a
		// TypeError on every sign-out - after the event had already been emitted.
		const { error } = await supabase.auth.signOut();
		if (error) console.error('Sign out failed', error);
		emitSignedOutEvent();
		// Signing out used to leave the user sitting on the protected page they were on, still
		// showing its content. Send them to the public home page and re-run the server loads.
		await goto('/', { invalidateAll: true });
	}
</script>

<button on:click={signOut}>Sign Out</button>
