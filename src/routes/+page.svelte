<script lang="ts">
	import { onMount } from 'svelte';
	import SignUp from '$lib/components/SignUp.svelte';
	import SignIn from '$lib/components/SignIn.svelte';
	import SignOut from '$lib/components/SignOut.svelte';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let userEmail = null as string | null | undefined;

	onMount(async () => {
		await setUserEmail();
	});

	async function getUser() {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (session) {
			console.log(session.user);
			return session.user;
		}

		return null;
	}

	async function getUserEmail() {
		const user = await getUser();

		if (user) {
			return user.email;
		}

		return null;
	}

	async function setUserEmail() {
		userEmail = await getUserEmail();
	}
</script>

{#if userEmail}
	<span>Welcome back {userEmail}</span>
	<br />
{/if}
<br />
<SignIn {supabase} on:signedIn={setUserEmail} />
<br />
<SignOut {supabase} on:signedOut={setUserEmail} />

<div class="hero min-h-screen bg-base-300">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Start Your Pokemon Journey!</h1>
		</div>
		<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<SignUp {supabase} />
		</div>
	</div>
</div>

<div class="welcome-banner">
	<div class="font-bold max-w-xl mx-auto">
		<h2>
			Welcome to the Pokedex website, where you can delve into the vast world of Pokémon with ease.
		</h2>
	</div>

	<div class="colOne"></div>
	<div class="one font-bold">
		<p>
			We're more than just a Pokédex - we're a vibrant community of passionate Pokémon enthusiasts
			like you! Explore our extensive database, discover the unique traits of each Pokémon species,
			where you can connect with friends and share your Pokémon journey like never before.. okéAtlas
			isn't just about information; it's about exploration and discovery. With an intuitive search
			function and user-friendly interface, navigating the Pokédex is a breeze. Whether you're
			searching by name, type, region, or even specific attributes like height or weight, PokéAtlas
			makes it easy to find exactly what you're looking for.
		</p>
	</div>
	<div class="colTwo"></div>
	<div class="two font-bold">
		<p>
			dynamic community features. In addition to browsing the Pokédex, users can create their own
			profiles, customize their collections, and connect with fellow trainers from around the world.
			Whether you're sharing your latest catches, discussing strategy, or organizing trades and
			battles, PokéAtlas provides a vibrant platform for connecting with other Pokémon fans.
			<i>Ready to catch 'em all?</i>
		</p>
	</div>
	<img src="/template-welcome-pokedex.png" alt="welcome background" height="100%" width="100%" />
</div>

<div class="Join Us flex justify-center">
	<div class="text-4xl text-center font-mono p-8">
		<h3>Join Us!</h3>
	</div>

	<div class="card w-96 bg-base-100 shadow-xl p-16">
		<div class="card-body">
			<h4 class="card-title">
				We invite you to share your thoughts, ideas, and experiences with fellow Trainers from
				around the globe
			</h4>
			<p></p>
			<div class="card-actions justify-end">
				<a href="discord.com">Discord </a>
			</div>
		</div>
	</div>
</div>

<style>
	.welcome-banner {
		position: relative;
	}
	h2 {
		font-size: 40px;
		text-align: center;
		position: absolute;
		top: 25%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.one {
		position: absolute;
		font-size: 15px;
		top: 50%;
		left: 10%;
		transform: translate(-50%, -50%);
		padding-right: 20px; /* Add right padding */
		max-width: calc(50% - 210px); /* Adjust max-width */
		text-align: right; /* Align text to the right */
	}

	.two {
		position: absolute;
		top: 50%;
		right: 10%;
		transform: translate(50%, -50%);
		padding-left: 0px; /* Add left padding */
		max-width: calc(50% - 210px); /* Adjust max-width */
		text-align: right; /* Align text to the left */
	}

	.card {
	}
</style>
