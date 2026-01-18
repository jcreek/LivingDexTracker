<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { goto } from '$app/navigation';
	import type { User } from '@supabase/auth-js';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let localUser: User | null = null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showAnimation = false;
	let hasCheckedAuth = false;

	onMount(() => {
		// Start animation
		setTimeout(() => {
			showAnimation = true;
		}, 100);

		// Check authentication after a short delay to allow Supabase to process the token
		setTimeout(() => {
			hasCheckedAuth = true;
			if (!localUser) {
				goto('/signin');
			}
		}, 500);
	});

	// Reactive: redirect if user becomes null after initial check
	$: if (hasCheckedAuth && !localUser) {
		goto('/signin');
	}

	let password = '';
	let confirmPassword = '';
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	async function updatePassword() {
		isLoading = true;
		errorMessage = '';
		successMessage = '';

		// Validate passwords match
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			isLoading = false;
			return;
		}

		// Validate password length
		if (password.length < 6) {
			errorMessage = 'Password must be at least 6 characters long';
			isLoading = false;
			return;
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: password
			});

			if (error) {
				console.error('Update password error:', error);
				errorMessage = error.message;
				return;
			}

			successMessage = 'Password updated successfully! Redirecting to sign in...';

			// Redirect to sign in after a short delay
			setTimeout(() => {
				goto('/signin');
			}, 2000);
		} catch (err) {
			console.error('Update password error:', err);
			errorMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			updatePassword();
		}
	}
</script>

<svelte:head>
	<title>Reset Password - Living Dex Tracker</title>
	<meta name="description" content="Set a new password for your Living Dex Tracker account." />
</svelte:head>

<div class="min-h-[calc(100vh-16rem)] bg-base-100 py-8 md:py-16 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md mx-auto">
		<!-- Hero Section -->
		<div class="text-center mb-8 {showAnimation ? 'animate-fade-in' : ''}">
			<div class="flex justify-center mb-4">
				<div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10 text-primary"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
			</div>
			<h1
				class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
			>
				Reset Password
			</h1>
			<p class="text-base-content/70">Enter your new password below</p>
		</div>

		<!-- Reset Password Card -->
		<div class="card bg-base-200 shadow-xl {showAnimation ? 'animate-slide-up' : ''}">
			<div class="card-body p-6 md:p-8">
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

				<!-- Success Message -->
				{#if successMessage}
					<div class="alert alert-success text-sm">
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{successMessage}</span>
					</div>
				{/if}

				<!-- New Password Input -->
				<div class="form-control">
					<label class="label" for="reset-password-new">
						<span class="label-text font-medium">New Password</span>
					</label>
					<div class="relative">
						<input
							id="reset-password-new"
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

				<!-- Confirm Password Input -->
				<div class="form-control">
					<label class="label" for="reset-password-confirm">
						<span class="label-text font-medium">Confirm Password</span>
					</label>
					<div class="relative">
						<input
							id="reset-password-confirm"
							type="password"
							placeholder="••••••••"
							class="input input-bordered w-full pl-10"
							bind:value={confirmPassword}
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

				<!-- Update Password Button -->
				<div class="form-control mt-6">
					<button
						class="btn btn-primary w-full"
						on:click={updatePassword}
						disabled={isLoading || !password || !confirmPassword}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
							Updating...
						{:else}
							Update Password
						{/if}
					</button>
				</div>

				<!-- Back to Sign In Link -->
				<div class="divider text-sm opacity-70">or</div>

				<div class="text-center">
					<a href="/signin" class="link link-primary font-semibold hover:underline">
						Back to Sign In
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
	}

	.animate-slide-up {
		animation: slide-up 0.5s ease-out forwards;
		animation-delay: 0.1s;
		opacity: 0;
	}

	/* Respect user's motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.animate-fade-in,
		.animate-slide-up {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	/* Gradient text fallback for older browsers */
	@supports not (background-clip: text) {
		h1 {
			background: none;
			color: hsl(var(--p));
		}
	}
</style>
