<script lang="ts">
	let email = '';
	let password = '';

	// Access the supabase client from the layout data
	export let supabase: any;

	async function signUpNewUser() {
		try {
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					// Redirect URL after successful sign-up
					redirectTo: '/welcome'
				}
			});

			if (error) {
				throw error;
			}

			// Handle success (optional)
		} catch (error) {
			console.error('Sign up error:', error.message);
			// Handle error
		}
	}
</script>

<input type="email" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />
<button on:click={signUpNewUser}>Sign Up</button>
