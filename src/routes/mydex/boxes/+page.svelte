<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CatchRecord } from '$lib/models/CatchRecord';
	import { type CombinedData } from '$lib/models/CombinedData';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	let combinedData = null as CombinedData[] | null;
	let failedToLoad = false;

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showForms = true;
	let showShiny = false;
	let currentPlacement = 'boxPlacementForms';
	let boxNumbers = Array<any>;

	async function toggleForms() {
		showForms = !showForms;
		await getData();
	}

	async function toggleShiny() {
		showShiny = !showShiny;
		if (showShiny) {
			showForms = false;
		}

		await getData();
	}

	async function getData(setCombinedDataToNull = true) {
		if (setCombinedDataToNull) {
			combinedData = null;
		}

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

	function cellBackgroundColourClass(catchRecord: CatchRecord) {
		if (catchRecord.caught) {
			return 'bg-green-100/50';
		} else if (catchRecord.haveToEvolve) {
			return 'bg-yellow-100/50';
		} else {
			return '';
		}
	}

	function cellBackgroundColourStyle(pokedexEntry: PokedexEntry, catchRecord: CatchRecord) {
		if (catchRecord.caught || catchRecord.haveToEvolve) {
			return '';
		} else {
			if (pokedexEntry.boxPlacementForms.column % 2 === 0) {
				return 'background-color: #ffffff';
			} else {
				return 'background-color: #f9f9f9;';
			}
		}
	}
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

		<button class="btn" on:click={toggleShiny}>
			{showShiny ? 'Hide Shiny' : 'Show Shiny'}
		</button>

		<div class="flex flex-wrap -mx-2">
			{#each boxNumbers as boxNumber}
				<div class="mb-8 md:w-1/2 px-2">
					<h2 class="text-xl font-bold mb-4">Box {boxNumber}</h2>
					<div class="grid grid-cols-6">
						{#each combinedData as { pokedexEntry, catchRecord }}
							{#if pokedexEntry[currentPlacement].box === boxNumber}
								<div
									class="pokemon-box {cellBackgroundColourClass(catchRecord)}"
									style="grid-column-start: {pokedexEntry[currentPlacement]
										.column}; grid-row-start: {pokedexEntry[currentPlacement].row};
                                        {cellBackgroundColourStyle(pokedexEntry, catchRecord)}"
								>
									<Tooltip>
										<div slot="hover-target">
											<PokemonSprite
												pokemonName={pokedexEntry.pokemon}
												pokedexNumber={pokedexEntry.pokedexNumber}
												form={pokedexEntry.form}
												shiny={showShiny}
											/>
											<span class="md:hidden">&#9432;</span>
										</div>
										<div slot="tooltip">
											<div class="font-bold">
												{pokedexEntry.pokemon}
												{pokedexEntry.form ? `(${pokedexEntry.form})` : ''}
											</div>
											<div>{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</div>
											<div>
												Caught: {catchRecord.caught ? 'Yes' : 'No'} <br />
												Needs to Evolve: {catchRecord.haveToEvolve ? 'Yes' : 'No'} <br />
												In Home: {catchRecord.inHome ? 'Yes' : 'No'}
											</div>
										</div>
									</Tooltip>
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
	}
</style>
