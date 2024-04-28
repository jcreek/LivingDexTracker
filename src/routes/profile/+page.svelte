<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);
</script>

<div class="h-screen">
	{#if localUser}
		<div id="banner">
			<div id="avatar">
				<div
					class="avatar mt-10 ml-20 w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
				>
					<div class="rounded-full"><img src="/OIG5.jpg" alt="profile icon" /></div>
				</div>
				<button class="btn btn-outline btn-primary">Upload new avatar</button>
			</div>
			<div id="personal-information">
				<p class="text-white font-mono text-3xl font-bold">{localUser?.email}</p>
				<p class="text-white font-mono text-3xl font-bold">Title</p>
				<p class="text-white font-mono text-3xl font-bold">Level</p>
			</div>
		</div>
		<div id="profile-content">
			<div id="pokemon-collection-summary">
				<div class="radial-progress top-0 left-0" style="--value:70;" role="progressbar">70%</div>
				<div class="caught-text top-20 left-30 font-mono text-xl">
					<p>Total Pokemon Caught</p>
				</div>

				<h2 class="">Types Collected</h2>
				<ul>
					<li class="type-list-item font-mono">Fire</li>
				</ul>
				<br />
				any other relevant statistics or achievements
			</div>
			<div id="customisation-options">
				theme selection
				<br />
				profile background
				<br />
				any other features that enhance user experience and personalisation
			</div>
			<div id="social-sharing">
				options for users to share their profile or achievements on social media platforms,
				encouraging engagement and interaction with other users
			</div>
		</div>
	{:else}
		<p>Please log in to view this page</p>
	{/if}
</div>

<style>
	#banner {
		background: rgb(41, 106, 170);
		background: linear-gradient(0deg, rgba(41, 106, 170, 1) 0%, rgba(123, 225, 255, 1) 100%);
	}

	#profile-content {
		background-color: rgb(255, 247, 238);
		color: black;
	}
	.ring {
		box-shadow: 0 0 0 4px rgb(149, 175, 230);
	}
</style>
