<script lang="ts">
	import PokedexEntryCatchRecord from './PokedexEntryCatchRecord.svelte';
	import type { CombinedData } from '$lib/models/CombinedData';

	export let showOrigins = true;
	export let showForms = true;
	export let showShiny = false;
	export let combinedData: CombinedData[] | null;
	export let creatingRecords = false;
	export let totalRecordsCreated = 0;
	export let failedToLoad = false;
	export let updateACatch = (event: any) => {};
	export let createCatchRecords = () => {};
	export let userId: string | null = null;
</script>

<main class="flex-1 p-4 w-full">
	<div class="max-w-min mx-auto">
		{#if combinedData && combinedData.length > 0}
			{#each combinedData as { pokedexEntry, catchRecord }}
				<PokedexEntryCatchRecord
					{pokedexEntry}
					{showOrigins}
					{showForms}
					{showShiny}
					{userId}
					bind:catchRecord
					on:updateCatch={updateACatch}
				/>
			{/each}
		{:else if failedToLoad}
			{#if creatingRecords && totalRecordsCreated > 0}
				<p>Processed {totalRecordsCreated} Pokédex entries so far...</p>
				<p>Please be patient, this may take some time.</p>
			{:else if creatingRecords}
				<p>Processing...</p>
				<p>Please be patient, this may take some time.</p>
			{:else}
				<h1>Failed to load</h1>
				<p>
					If you're seeing this, you probably haven't created your Pokédex data yet. Please do so by
					clicking this button.
				</p>
				<button class="btn" on:click={createCatchRecords}>Create Pokédex data</button>
			{/if}
		{:else}
			<div class="min-w-max mx-auto">
				<h1>Loading Pokédex</h1>
				<span class="loading loading-spinner loading-xl"></span>
			</div>
		{/if}
	</div>
</main>
