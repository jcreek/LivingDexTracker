<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import SignIn from '$lib/components/SignIn.svelte';
	import { goto } from '$app/navigation';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showAnimation = false;
	let animationTimer: ReturnType<typeof setTimeout>;

	onMount(() => {
		animationTimer = setTimeout(() => {
			showAnimation = true;
		}, 100);
	});

	onDestroy(() => {
		clearTimeout(animationTimer);
	});

	async function getUser() {
		try {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (session) {
				localUser = session.user;
				user.set(localUser);
				await goto('/my-pokedexes');
			} else {
				localUser = null;
				user.set(localUser);
			}
		} catch (error) {
			console.error('Error getting user session:', error);
		}
	}
</script>

<svelte:head>
	<title>Sign In - Living Dex Tracker</title>
	<meta
		name="description"
		content="Sign in to Living Dex Tracker to track your Pokédex progress."
	/>
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
							d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
						/>
					</svg>
				</div>
			</div>
			<h1
				class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
			>
				Welcome Back
			</h1>
			<p class="text-base-content/70">Sign in to continue tracking your Pokédex progress</p>
		</div>

		<!-- Sign In Card -->
		<div class="card bg-base-200 shadow-xl {showAnimation ? 'animate-slide-up' : ''}">
			<div class="card-body p-6 md:p-8">
				<SignIn {supabase} on:signedIn={getUser} />

				<!-- Sign Up Link -->
				<div class="divider text-sm opacity-70">or</div>

				<div class="text-center">
					<p class="text-sm opacity-70 mb-2">Don't have an account?</p>
					<a href="/" class="link link-primary font-semibold hover:underline">
						Register for free
					</a>
				</div>
			</div>
		</div>

		<!-- Help Section -->
		<div class="mt-6 text-center text-sm opacity-60">
			<a href="/forgot-password" class="link link-primary hover:underline">
				Forgot your password?
			</a>
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
