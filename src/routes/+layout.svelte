<script lang="ts">
	import 'tailwindcss/tailwind.css';
	import { onDestroy, onMount } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import SignIn from '$lib/components/SignIn.svelte';
	import SignOut from '$lib/components/SignOut.svelte';

	import { pwaInfo } from 'virtual:pwa-info';
	import { pwaAssetsHead } from 'virtual:pwa-assets/head';

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

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

		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r) {
					// uncomment following code if you want check for updates
					// r && setInterval(() => {
					//    console.log('Checking for sw update')
					//    r.update()
					// }, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				}
			});
		}
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

<svelte:head>
	{#if pwaAssetsHead.themeColor}
		<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
	{#if pwaAssetsHead.description}
		<meta name="description" content={pwaAssetsHead.description.content} />
	{/if}
	{#each pwaAssetsHead.links as link}
		<link {...link} />
	{/each}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}

	<!-- <meta
		name="description"
		content="A free and open source web app to track completion of a living Pokédex, which works offline."
	/> -->
	<meta property="og:title" content="Living Dex Tracker - A free Pokédex completion tool" />
	<meta property="og:url" content="https://pokedex.jcreek.co.uk" />
	<meta
		property="og:description"
		content="A free and open source web app to track completion of a living Pokédex, which works offline."
	/>
	<link rel="canonical" href="https://pokedex.jcreek.co.uk" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<!-- <link rel="apple-touch-icon" href="%sveltekit.assets%/apple-touch-icon.png" /> -->
</svelte:head>

<header>
	<div class="navbar bg-neutral">
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
						<img alt="usericon" src="/OIG5.jpg" />
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

{#await import('$lib/components/pwa/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await}
