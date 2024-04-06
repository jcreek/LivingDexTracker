<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function emitSignedInEvent() {
		dispatch('signedIn', {});
	}

	let email = '';
	let password = '';

	// Access the supabase client from the layout data
	export let supabase: any;

	async function signInWithEmail() {
		// TODO use the data and error from the response
		const { data, error } = await supabase.auth
			.signInWithPassword({
				email: email,
				password: password
			})
			.then(() => {
				emitSignedInEvent();
			});
	}
</script>

<input type="email" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />
<button on:click={signInWithEmail}>Sign In</button>
