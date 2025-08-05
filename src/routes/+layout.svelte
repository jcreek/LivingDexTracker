<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import Navigation from '$lib/components/Navigation.svelte';
	import { userStore } from '$lib/stores/user';
	
	export let data: LayoutData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	// Update user store when session changes
	$: userStore.set(session?.user || null);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="min-h-screen bg-base-100">
	<Navigation user={session?.user} />
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>