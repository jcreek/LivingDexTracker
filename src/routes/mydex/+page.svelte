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
		combinedData = null;
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
		if (!localUser?.id) {
			alert('User not signed in');
			return;
		}

		const requestOptions = {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(catchRecord)
		};

		try {
			const response = await fetch('/api/catch-records', requestOptions);
			if (!response.ok) {
				throw new Error('Failed to update catch record');
			}

			const updatedRecord = await response.json();
			console.log('Updated catch record:', updatedRecord);
		} catch (error) {
			console.error('Error updating catch record:', error);
		}
	}
</script>

<svelte:head>
	<title>Living Dex Tracker - My Dex</title>
</svelte:head>

<div class="flex">
	<aside class="w-64 bg-gray-800 text-white p-4 fixed h-5/6">
		<h2 class="text-2xl font-semibold mb-4">Filters</h2>
		<!-- <ul>
			<li class="mb-2"><a href="#" class="block p-2 hover:bg-gray-700 rounded">Dashboard</a></li>
			<li class="mb-2"><a href="#" class="block p-2 hover:bg-gray-700 rounded">Profile</a></li>
			<li class="mb-2"><a href="#" class="block p-2 hover:bg-gray-700 rounded">Settings</a></li>
			<li class="mb-2"><a href="#" class="block p-2 hover:bg-gray-700 rounded">Logout</a></li>
		</ul> -->
		<div class="mb-4">
			<button class="btn btn-sm" on:click={() => toggleForms()}>Toggle Forms</button>
			<button class="btn btn-sm" on:click={() => toggleOrigins()}>Toggle Origins</button>
		</div>

		<div>
			<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
		</div>
	</aside>

	<main class="flex-1 p-4 ml-64">
		<div class="max-w-min mx-auto">
			{#if combinedData}
				{#each combinedData as { pokedexEntry, catchRecord }}
					<PokedexEntryCatchRecord
						{pokedexEntry}
						{showOrigins}
						{showForms}
						bind:catchRecord
						on:updateCatch={() => updateACatch(catchRecord)}
					/>
				{/each}
			{:else}
				<div class="min-w-max mx-auto">
					<h1>Loading Pokédex</h1>
					<span class="loading loading-spinner loading-xl"></span>
				</div>
			{/if}
		</div>
	</main>
</div>
