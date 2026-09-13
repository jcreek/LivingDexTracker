<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';

	// Access the supabase client from the layout data
	export let supabase: SupabaseClient;

	async function signUpNewUser() {
		try {
			// `redirectTo` is not a signUp option - it was silently ignored, so the confirmation
			// link has always used Supabase's configured site URL. Sending the user to /welcome
			// would need `emailRedirectTo` with an absolute, allow-listed URL.
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password
			});

			if (error) {
				console.error('Sign up error:', error);
				alert(`Sign up failed: ${error.message}`);
				return;
			}

			if (data) {
				// Emit signedUp event to notify parent component
				dispatch('signedUp', {});
			}
		} catch (err) {
			console.error('Sign up error:', err);
			alert('Sign up failed');
		}
	}
</script>

<form class="card-body">
	<div class="form-control">
		<label class="label" for="signup-email">
			<span class="label-text">Email</span>
		</label>
		<input
			id="signup-email"
			type="email"
			placeholder="email"
			class="input input-bordered"
			required
			bind:value={email}
		/>
	</div>
	<div class="form-control">
		<label class="label" for="signup-password">
			<span class="label-text">Password</span>
		</label>
		<input
			id="signup-password"
			type="password"
			placeholder="password"
			class="input input-bordered"
			required
			bind:value={password}
		/>
	</div>
	<div class="form-control mt-6">
		<button class="btn btn-primary" on:click={signUpNewUser}>Sign Up</button>
	</div>
</form>

<style>
	.card-body {
		padding: 0.5rem;
	}
</style>
