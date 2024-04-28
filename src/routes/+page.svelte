<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import SignUp from '$lib/components/SignUp.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);
</script>

<div class="hero bg-base-100 my-36">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Start Your Pokédex Journey!</h1>
		</div>
		<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-neutral">
			<SignUp {supabase} />
		</div>
	</div>
</div>

<div
	class="md:container md:mx-auto justify-self-center flex justify-center items-center h-full flex-col mb-10"
>
	<div class="stats stats-vertical lg:stats-horizontal shadow bg-neutral text-center">
		<div class="stat">
			<div class="stat-title">Pokémon caught</div>
			<div class="stat-value">310K</div>
			<div class="stat-desc">Since January 2024</div>
		</div>

		<div class="stat">
			<div class="stat-title">New Users</div>
			<div class="stat-value">4,200</div>
			<div class="stat-desc">↗︎ 400 (22%)</div>
		</div>

		<div class="stat">
			<div class="stat-title">Living Dexes Completed</div>
			<div class="stat-value">1,200</div>
			<div class="stat-desc">↘︎ 90 (14%)</div>
		</div>
	</div>

	<div class="features mt-8">
		<h1 class="flex justify-center text-4xl font-bold mb-5">Features</h1>

		<ul class="space-y-6">
			<li class="p-6 rounded-lg shadow-md bg-neutral">
				<div class="flex items-start space-x-4">
					<svg
						class="w-8 h-8 text-green-500 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					<div>
						<h2 class="text-lg font-semibold">Social</h2>
						<p>
							Easily share your Pokédex journey with friends, or find theirs. If you'd rather go it
							alone, that's okay too!
						</p>
					</div>
				</div>
			</li>
			<li class="p-6 rounded-lg shadow-md bg-neutral">
				<div class="flex items-start space-x-4">
					<svg
						class="w-8 h-8 text-green-500 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					<div>
						<h2 class="text-lg font-semibold">Free & Open Source</h2>
						<p>
							Completely open source and free to use, enabling the community to contribute updates
							as soon as new Pokémon are released.
						</p>
					</div>
				</div>
			</li>
			<li class="p-6 rounded-lg shadow-md bg-neutral">
				<div class="flex items-start space-x-4">
					<svg
						class="w-8 h-8 text-green-500 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					<div>
						<h2 class="text-lg font-semibold">Easy to use with advanced filtering</h2>
						<p>
							If you just want to track your progress completing your Pokédex, you can do that. But
							if you are attempting a harder variant, like a Living Origin Forme Dex, you might find
							our advanced filtering options helpful for tracking target Pokémon for specific
							catching sessions.
						</p>
					</div>
				</div>
			</li>
			<li class="p-6 rounded-lg shadow-md bg-neutral">
				<div class="flex items-start space-x-4">
					<svg
						class="w-8 h-8 text-green-500 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					<div>
						<h2 class="text-lg font-semibold">100% free</h2>
						<p>Did we mention it's completely free to use? Oh, we did? Good. Because it is.</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</div>
