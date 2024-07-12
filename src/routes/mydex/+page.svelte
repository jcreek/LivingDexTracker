<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CatchRecord } from '$lib/models/CatchRecord';
	import { type CombinedData } from '$lib/models/CombinedData';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { browser } from '$app/environment';

	let combinedData = null as CombinedData[] | null;
	let currentPage = 1 as number;
	let itemsPerPage = 20 as number;
	let totalPages = 0 as number;

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showOrigins = true;
	let showForms = true;

	function toggleOrigins() {
		showOrigins = !showOrigins;
	}

	function toggleForms() {
		showForms = !showForms;
	}

	async function getData() {
		const response = await fetch(`/api/combined-data?page=${currentPage}&limit=${itemsPerPage}`);
		const data = await response.json();

		combinedData = data.combinedData;
		totalPages = data.totalPages;
	}

	onMount(async () => {
		await getData();
	});

	$: {
		if (browser) {
			currentPage, itemsPerPage, getData();
		}
	}

	async function updateACatch(catchRecord: CatchRecord) {
		alert('here');
		// if (!localUser?.id) {
		// 	alert('User not signed in');
		// 	return;
		// }

		// const requestOptions = {
		// 	method: 'PUT',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify(catchRecord)
		// };

		// try {
		// 	const response = await fetch('/api/catch-records', requestOptions);
		// 	if (!response.ok) {
		// 		throw new Error('Failed to update catch record');
		// 	}

		// 	const updatedRecord = await response.json();
		// 	console.log('Updated catch record:', updatedRecord);
		// } catch (error) {
		// 	console.error('Error updating catch record:', error);
		// }
	}
</script>

<div class="container mx-auto">
	{#if combinedData}
		<div>
			<button on:click={() => toggleForms()}>Toggle Forms</button>
			<button on:click={() => toggleOrigins()}>Toggle Origins</button>
		</div>

		<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
		{currentPage}

		{#each combinedData as { pokedexEntry, catchRecord }}
			<div>
				<PokedexEntryCatchRecord
					{pokedexEntry}
					{showOrigins}
					{showForms}
					bind:catchRecord
					on:updateCatch={() => updateACatch(catchRecord)}
				/>
			</div>
		{/each}

		<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
		{currentPage}
	{:else}
		<h1>Loading Pokédex</h1>
		<span class="loading loading-spinner loading-xl"></span>
	{/if}
</div>
