<script lang="ts">
	import SignUp from '$lib/components/SignUp.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
</script>

<SignUp {supabase} />
