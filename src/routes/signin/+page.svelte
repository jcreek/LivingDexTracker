<script lang="ts">
	import { onDestroy } from 'svelte';
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

	async function getUser() {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (session) {
			localUser = session.user;
		} else {
			localUser = null;
		}

		user.set(localUser);
		goto('/mydex', { replace: true });
	}
</script>

<SignIn {supabase} on:signedIn={getUser} />
