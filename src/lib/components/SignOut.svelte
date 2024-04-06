<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function emitSignedOutEvent() {
		dispatch('signedOut', {});
	}

	// Access the supabase client from the layout data
	export let supabase: any;

	async function signOut() {
		// TODO use the error from the response
		const { error } = await supabase.auth.signOut().then(() => {
			emitSignedOutEvent();
		});
	}
</script>

<button on:click={signOut}>Sign Out</button>
