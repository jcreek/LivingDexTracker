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

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Start Your Pokemon Journey!</h1>
		</div>
		<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<SignUp {supabase} />
		</div>
	</div>
</div>

<p></p>
