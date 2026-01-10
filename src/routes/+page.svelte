<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import SignUp from '$lib/components/SignUp.svelte';

	export let data;
	let { supabase, stats } = data;
	$: ({ supabase, stats } = data);

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	// Format large numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/.0$/, '') + 'M';
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(0) + 'K';
		}
		return num.toString();
	}

	// Get formatted stats or fallback to 0
	let pokemonCaught = '0';
	let users = '0';
	let livingDexesCompleted = '0';
	$: {
		pokemonCaught = stats ? formatNumber(stats.pokemonCaught) : '0';
		users = stats ? formatNumber(stats.users) : '0';
		livingDexesCompleted = stats ? formatNumber(stats.livingDexesCompleted) : '0';
	}
</script>

<svelte:head>
	<title>Living Dex Tracker - Track Your Pokédex Journey</title>
	<meta
		name="description"
		content="A free, open source tool to track your Living Pokédex progress. Join thousands of trainers worldwide in completing their collection."
	/>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-100 my-36">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<div class="flex flex-wrap gap-2 mb-4">
				<div class="badge badge-primary badge-lg gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Free
				</div>
				<div class="badge badge-secondary badge-lg gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
					Open Source
				</div>
				<div class="badge badge-accent badge-lg gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
							clip-rule="evenodd"
						/>
					</svg>
					Offline-friendly
				</div>
			</div>
			<h1 class="text-5xl font-bold mb-6">Start Your Pokédex Journey!</h1>
			<p class="text-xl mb-6 text-base-content/80">
				Track your progress towards a complete Living Pokédex — one of every Pokémon, actively
				maintained across your boxes. Join thousands of trainers worldwide.
			</p>
			<div class="flex flex-wrap gap-3 justify-center lg:justify-start">
				<a
					href="https://discord.gg/2ytj4pkUPY"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary btn-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
						/>
					</svg>
					Join Discord
				</a>
				<a
					href="https://github.com/jcreek/LivingDexTracker"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-outline btn-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					Contribute on GitHub
				</a>
			</div>
		</div>
		<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-neutral">
			<div class="card-body">
				<h2 class="card-title text-2xl mb-4">Get Started Free</h2>
				<SignUp {supabase} />
			</div>
		</div>
	</div>
</div>

<!-- Stats Section -->
<div class="bg-base-200 py-16">
	<div class="container mx-auto px-4">
		<div class="stats stats-vertical lg:stats-horizontal shadow bg-neutral text-center w-full">
			<div class="stat">
				<div class="stat-title">Pokémon caught</div>
				<div class="stat-value text-primary">{pokemonCaught}</div>
				<div class="stat-desc">Since January 2026</div>
			</div>
			<div class="stat">
				<div class="stat-title">Users</div>
				<div class="stat-value text-primary">{users}</div>
				<div class="stat-desc">↗︎ 400 (22%)</div>
			</div>
			<div class="stat">
				<div class="stat-title">Living Dexes Completed</div>
				<div class="stat-value text-primary">{livingDexesCompleted}</div>
				<div class="stat-desc">Trainers worldwide</div>
			</div>
		</div>
	</div>
</div>

<!-- What is a Living Dex Section -->
<div class="py-16 bg-base-100">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-3xl mb-4">What is a Living Dex?</h2>
				<p class="text-lg text-base-content/80">
					A Living Dex is a complete Pokédex where you keep one of every Pokémon in your boxes
					(often including forms/variants). Living Dex Tracker helps you build and maintain that
					collection with filters, notes, and progress tracking.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="py-16 bg-base-200">
	<div class="container mx-auto px-4 max-w-6xl">
		<h1 class="text-4xl font-bold mb-12 text-center">Why Choose Living Dex Tracker?</h1>

		<div class="grid md:grid-cols-2 gap-6">
			<div class="card bg-neutral shadow-xl">
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								></path>
							</svg>
						</div>
						<div>
							<h2 class="card-title text-xl mb-2">Social & Shareable</h2>
							<p class="text-base-content/80">
								Easily share your Pokédex journey with friends, or find theirs. If you'd rather go
								it alone, that's okay too!
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-neutral shadow-xl">
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
								></path>
							</svg>
						</div>
						<div>
							<h2 class="card-title text-xl mb-2">Free & Open Source</h2>
							<p class="text-base-content/80">
								Completely open source and free to use, enabling the community to contribute updates
								as soon as new Pokémon are released.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-neutral shadow-xl">
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								></path>
							</svg>
						</div>
						<div>
							<h2 class="card-title text-xl mb-2">Advanced Filtering</h2>
							<p class="text-base-content/80">
								Track simple progress or tackle harder variants like a Living Origin Form Dex with
								our powerful filtering options for targeted catching sessions.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card bg-neutral shadow-xl">
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div>
							<h2 class="card-title text-xl mb-2">100% free</h2>
							<p class="text-base-content/80">
								Did we mention it's completely free to use? Oh, we did? Good. Because it is.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- CTA Section -->
<div class="py-16 bg-base-100">
	<div class="container mx-auto px-4 text-center">
		<h2 class="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
		<p class="text-xl mb-8 text-base-content/80 max-w-2xl mx-auto">
			Get started today with tracking you Living Pokédex progress. It's free, open source, and built
			with love for the Pokémon community.
		</p>
		<div class="flex flex-wrap gap-4 justify-center">
			<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-neutral">
				<div class="card-body">
					<h3 class="card-title text-xl mb-4">Sign Up Now</h3>
					<SignUp {supabase} />
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Legal Section -->
<div class="py-8 bg-base-200">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-lg mb-2">Legal Disclaimer</h2>
				<p class="text-sm text-base-content/70">
					Living Dex Tracker is a fan-made project. We do not claim ownership of any Pokémon
					characters, images, or other content featured on this website. This project is not
					affiliated with, endorsed, sponsored, or specifically approved by Nintendo, Game Freak, or
					The Pokémon Company.
				</p>
			</div>
		</div>
	</div>
</div>
