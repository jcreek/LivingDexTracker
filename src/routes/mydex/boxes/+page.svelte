<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CatchRecord } from '$lib/models/CatchRecord';
	import { type CombinedData } from '$lib/models/CombinedData';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { browser } from '$app/environment';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';

	let combinedData = null as CombinedData[] | null;
	let failedToLoad = false;

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showForms = true;
	let currentPlacement = 'boxPlacementForms';
	let boxNumbers = [];

	async function toggleForms() {
		showForms = !showForms;
		await getData();
	}

	async function getData() {
		combinedData = null;

		const response = await fetch(`/api/combined-data/all?enableForms=${showForms}`);
		const data = await response.json();

		if (data.error) {
			failedToLoad = true;
			return;
		}

		combinedData = data;
		boxNumbers = [
			...new Set(combinedData.map(({ pokedexEntry }) => pokedexEntry[currentPlacement].box))
		].filter(Boolean);
	}

	onMount(async () => {
		await getData();
	});

	$: currentPlacement = showForms ? 'boxPlacementForms' : 'boxPlacement';
</script>

<svelte:head>
	<title>Living Dex Tracker - My Boxes</title>
</svelte:head>

<!-- <PokemonSprite pokemonName={'Raichu'} pokedexNumber={26} form={'Alolan'} /> -->

<div class="container mx-auto">
	{#if !localUser}
		<p>Please <a href="/signin" class="underline text-primary hover:text-secondary">sign in</a></p>
	{:else if combinedData && combinedData.length > 0}
		<button class="btn" on:click={toggleForms}>
			{showForms ? 'Hide Forms' : 'Show Forms'}
		</button>

		<div class="flex flex-wrap -mx-2">
			{#each boxNumbers as boxNumber}
				<div class="mb-8 md:w-1/2 px-2">
					<h2 class="text-xl font-bold mb-4">Box {boxNumber}</h2>
					<div class="grid grid-cols-6">
						{#each combinedData as { pokedexEntry, catchRecord }}
							{#if pokedexEntry[currentPlacement].box === boxNumber}
								<div
									class="pokemon-box"
									style="grid-column-start: {pokedexEntry[currentPlacement]
										.column}; grid-row-start: {pokedexEntry[currentPlacement].row}"
								>
									<PokemonSprite
										pokemonName={pokedexEntry.pokemon}
										pokedexNumber={pokedexEntry.pokedexNumber}
										form={pokedexEntry.form}
									/>
									<!-- {pokedexEntry.form ? `(${pokedexEntry.form})` : ''} -->
									<!-- <div class="font-bold">
										{pokedexEntry.pokemon}
										{pokedexEntry.form ? `(${pokedexEntry.form})` : ''}
									</div> -->
									<!-- <div>{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</div> -->
									<!-- <div>
										Caught: {catchRecord.caught ? 'Yes' : 'No'} <br />
										Needs to Evolve: {catchRecord.haveToEvolve ? 'Yes' : 'No'} <br />
										In Home: {catchRecord.inHome ? 'Yes' : 'No'}
									</div> -->
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else if failedToLoad}
		<h1>Failed to load</h1>
		<p>
			If you're seeing this, you probably haven't created your Pokédex data yet. Please do so by
			visiting the <a href="/mydex" class="underline text-primary hover:text-secondary">My Dex</a> page.
		</p>
	{:else}
		<div class="min-w-max mx-auto">
			<h1>Loading Pokédex</h1>
			<span class="loading loading-spinner loading-xl"></span>
		</div>
	{/if}
</div>

<style>
	.pokemon-box {
		border: 1px solid #ddd;
		padding: 1rem;
		background-color: #f9f9f9;
	}

	.pokemon-box:nth-child(even) {
		background-color: #ffffff;
	}
</style>
