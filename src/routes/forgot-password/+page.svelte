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

	onMount(() => {
		// Redirect if already logged in
		if (localUser) {
			goto('/my-pokedexes');
		}

		// Start animation
		setTimeout(() => {
			showAnimation = true;
		}, 100);
	});

	let email = '';
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	async function sendResetEmail() {
		isLoading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`
			});

			if (error) {
				console.error('Reset password error:', error);
				errorMessage = error.message;
				return;
			}

			successMessage = 'Check your email for the password reset link';
			email = '';
		} catch (err) {
			console.error('Reset password error:', err);
			errorMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendResetEmail();
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - Living Dex Tracker</title>
	<meta name="description" content="Reset your password for Living Dex Tracker." />
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
							d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
						/>
					</svg>
				</div>
			</div>
			<h1
				class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
			>
				Forgot Password?
			</h1>
			<p class="text-base-content/70">Enter your email to receive a password reset link</p>
		</div>

		<!-- Forgot Password Card -->
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

				<!-- Email Input -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Email</span>
					</label>
					<div class="relative">
						<input
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

				<!-- Send Reset Link Button -->
				<div class="form-control mt-6">
					<button
						class="btn btn-primary w-full"
						on:click={sendResetEmail}
						disabled={isLoading || !email}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
							Sending...
						{:else}
							Send Reset Link
						{/if}
					</button>
				</div>

				<!-- Back to Sign In Link -->
				<div class="divider text-sm opacity-70">or</div>

				<div class="text-center">
					<p class="text-sm opacity-70 mb-2">Remember your password?</p>
					<a href="/signin" class="link link-primary font-semibold hover:underline"> Sign In </a>
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
