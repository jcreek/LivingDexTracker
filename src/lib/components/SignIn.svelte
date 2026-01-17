<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function emitSignedInEvent() {
		dispatch('signedIn', {});
	}

	let email = '';
	let password = '';
	let isLoading = false;
	let errorMessage = '';

	// Access the supabase client from the layout data
	export let supabase: any;

	async function signInWithEmail() {
		isLoading = true;
		errorMessage = '';

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password
			});

			if (error) {
				console.error('Sign in error:', error);
				errorMessage = error.message;
				return;
			}

			if (data) {
				emitSignedInEvent();
			}
		} catch (err) {
			console.error('Sign in error:', err);
			errorMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			signInWithEmail();
		}
	}
</script>

<div class="space-y-4">
	<!-- Error Message -->
	{#if errorMessage}
		<div class="alert alert-error text-sm">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{errorMessage}</span>
		</div>
	{/if}

	<!-- Email Input -->
	<div class="form-control">
		<label class="label" for="signin-email">
			<span class="label-text font-medium">Email</span>
		</label>
		<div class="relative">
			<input
				id="signin-email"
				type="email"
				placeholder="your@email.com"
				class="input input-bordered w-full pl-10"
				bind:value={email}
				on:keypress={handleKeyPress}
				disabled={isLoading}
			/>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4 opacity-70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
			>
				<path
					d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
				/>
				<path
					d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
				/>
			</svg>
		</div>
	</div>

	<!-- Password Input -->
	<div class="form-control">
		<label class="label" for="signin-password">
			<span class="label-text font-medium">Password</span>
		</label>
		<div class="relative">
			<input
				id="signin-password"
				type="password"
				placeholder="••••••••"
				class="input input-bordered w-full pl-10"
				bind:value={password}
				on:keypress={handleKeyPress}
				disabled={isLoading}
			/>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4 opacity-70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
			>
				<path
					fill-rule="evenodd"
					d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	</div>

	<!-- Sign In Button -->
	<div class="form-control mt-6">
		<button
			class="btn btn-primary w-full"
			on:click={signInWithEmail}
			disabled={isLoading || !email || !password}
		>
			{#if isLoading}
				<span class="loading loading-spinner loading-sm"></span>
				Signing in...
			{:else}
				Sign In
			{/if}
		</button>
	</div>
</div>
