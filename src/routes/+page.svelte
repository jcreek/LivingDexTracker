<script lang="ts">
	import SignUp from '$lib/components/SignUp.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
</script>

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
