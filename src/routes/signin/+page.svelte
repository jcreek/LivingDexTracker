<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let isSignUp = false;

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const { error: authError } = isSignUp
				? await data.supabase.auth.signUp({
						email,
						password,
						options: {
							emailRedirectTo: `${window.location.origin}/auth/confirm`
						}
					})
				: await data.supabase.auth.signInWithPassword({
						email,
						password
					});

			if (authError) throw authError;

			if (isSignUp) {
				error = 'Check your email to confirm your account!';
			} else {
				await goto('/pokedexes');
			}
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-[80vh] items-center justify-center">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl font-bold text-center w-full" data-testid="auth-title">
				{isSignUp ? 'Create Account' : 'Sign In'}
			</h2>

			{#if error}
				<div
					class="alert {isSignUp && error.includes('email') ? 'alert-success' : 'alert-error'}"
					data-testid="auth-error"
				>
					<span>{error}</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-4" data-testid="auth-form">
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						class="input input-bordered"
						required
						disabled={loading}
						data-testid="email-input"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="input input-bordered"
						required
						disabled={loading}
						minlength="6"
						data-testid="password-input"
					/>
				</div>

				<div class="form-control mt-6">
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading}
						data-testid="submit-button"
					>
						{#if loading}
							<span class="loading loading-spinner"></span>
						{/if}
						{isSignUp ? 'Sign Up' : 'Sign In'}
					</button>
				</div>
			</form>

			<div class="divider">OR</div>

			<div class="tabs tabs-boxed justify-center">
				<button
					class="tab"
					class:tab-active={!isSignUp}
					on:click={() => {
						isSignUp = false;
						error = '';
					}}
					data-testid="signin-tab"
				>
					Sign In
				</button>
				<button
					class="tab"
					class:tab-active={isSignUp}
					on:click={() => {
						isSignUp = true;
						error = '';
					}}
					data-testid="signup-tab"
				>
					Sign Up
				</button>
			</div>
		</div>
	</div>
</div>
