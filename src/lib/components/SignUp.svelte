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

<form class="card-body">
	<div class="form-control">
		<label class="label">
			<span class="label-text">Email</span>
		</label>
		<input
			type="email"
			placeholder="email"
			class="input input-bordered"
			required
			bind:value={email}
		/>
	</div>
	<div class="form-control">
		<label class="label">
			<span class="label-text">Password</span>
		</label>
		<input
			type="password"
			placeholder="password"
			class="input input-bordered"
			required
			bind:value={password}
		/>
	</div>
	<div class="form-control mt-6">
		<button class="btn btn btn-primary" on:click={signUpNewUser}>Sign Up</button>
	</div>
</form>
