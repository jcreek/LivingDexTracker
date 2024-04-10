<script lang="ts">
	import 'tailwindcss/tailwind.css';
	import { onDestroy, onMount } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import SignIn from '$lib/components/SignIn.svelte';
	import SignOut from '$lib/components/SignOut.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let localUser = null as User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	onMount(async () => {
		await getUser();
	});

	async function getUser() {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (session) {
			console.log(session.user);
			localUser = session.user;
		} else {
			localUser = null;
		}

		// Update the store so that user is available to all components
		user.set(localUser);
	}
</script>

<header>
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl" href="/">Living Dex Tracker</a>
		</div>
		<div class="flex-none gap-2">
			<div class="form-control">
				<input
					type="text"
					placeholder="Search for a Dex"
					class="input input-bordered w-32 md:w-auto"
				/>
			</div>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img
							alt="Tailwind CSS Navbar component"
							src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
						/>
					</div>
				</div>
				<ul
					tabindex="-1"
					class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box min-w-[13rem] w-auto"
				>
					{#if localUser}
						<li>
							<a href="/profile"> Profile </a>
						</li>
						<li><a href="/settings">Settings</a></li>
						<li><SignOut {supabase} on:signedOut={getUser} /></li>
					{:else}
						<li><SignIn {supabase} on:signedIn={getUser} /></li>
					{/if}
				</ul>
			</div>
		</div>
	</div>
</header>

<main>
	<slot />
</main>

<footer class="footer p-10 bg-neutral text-neutral-content">
	<nav>
		<h6 class="footer-title">Services</h6>
		<a class="link link-hover">Branding</a>
		<a class="link link-hover">Design</a>
		<a class="link link-hover">Marketing</a>
		<a class="link link-hover">Advertisement</a>
	</nav>
	<nav>
		<h6 class="footer-title">Company</h6>
		<a class="link link-hover">About us</a>
		<a class="link link-hover">Contact</a>
		<a class="link link-hover">Jobs</a>
		<a class="link link-hover">Press kit</a>
	</nav>
	<nav>
		<h6 class="footer-title">Legal</h6>
		<a class="link link-hover">Terms of use</a>
		<a class="link link-hover">Privacy policy</a>
		<a class="link link-hover">Cookie policy</a>
	</nav>
</footer>
