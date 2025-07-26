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
		try {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (session) {
				localUser = session.user;
				user.set(localUser);
				await goto('/mydex', { replace: true });
			} else {
				localUser = null;
				user.set(localUser);
			}
		} catch (error) {
			console.error('Error getting user session:', error);
		}
	}
</script>

<SignIn {supabase} on:signedIn={getUser} />
