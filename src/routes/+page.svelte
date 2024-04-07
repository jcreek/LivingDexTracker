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
<SignUp {supabase} />
<br />
<SignIn {supabase} on:signedIn={setUserEmail} />
<br />
<SignOut {supabase} on:signedOut={setUserEmail} />

<div>
	<PokemonSprite pokedexNumber={666} form={'poke-ball'} />
	<PokemonSprite pokedexNumber={666} form={''} />
	<PokemonSprite pokedexNumber={'003'} form={''} />
</div>

<div class="bg-blue-500 text-white p-4">This is a component styled with Tailwind CSS</div>
