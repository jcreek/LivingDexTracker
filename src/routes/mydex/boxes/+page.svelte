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

	async function updateCatchRecords(
		boxNumber: number,
		caught: boolean,
		needsToEvolve: boolean,
		inHome: boolean | null = null
	) {
		let catchRecordsToUpdate = combinedData
			.filter(({ pokedexEntry }) => pokedexEntry[currentPlacement].box === boxNumber)
			.map(({ catchRecord }) => {
				// Create the base object with existing properties
				let updatedRecord = { ...catchRecord };

				if (inHome !== null) {
					updatedRecord = {
						...updatedRecord,
						inHome
					};
				} else {
					updatedRecord = {
						...updatedRecord,
						caught,
						haveToEvolve: needsToEvolve
					};
				}

				return updatedRecord;
			});

		await fetch('/api/catch-records', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(catchRecordsToUpdate)
		}).then(async () => {
			// TODO - Notify the user that data is being updated
			await getData(false);
			// TODO - Remove the notification
		});
	}

	async function markBoxAsNotCaught(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false);
	}

	async function markBoxAsCaught(boxNumber: number) {
		await updateCatchRecords(boxNumber, true, false);
	}

	async function markBoxAsNeedsToEvolve(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, true);
	}

	async function markBoxAsInHome(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false, true);
	}

	async function markBoxAsNotInHome(boxNumber: number) {
		await updateCatchRecords(boxNumber, false, false, false);
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
					<button class="btn" on:click={markBoxAsNotCaught(boxNumber)}>
						Mark box as not 'caught'
					</button>
					<button class="btn" on:click={markBoxAsCaught(boxNumber)}> Mark box as 'caught' </button>
					<button class="btn" on:click={markBoxAsNeedsToEvolve(boxNumber)}
						>Mark box as 'needs to evolve'</button
					>
					<button class="btn" on:click={markBoxAsInHome(boxNumber)}>Mark box as 'in Home'</button>
					<button class="btn" on:click={markBoxAsNotInHome(boxNumber)}
						>Mark box as not 'in Home'</button
					>
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
											{#if catchRecord.inHome}
												<span
													class="absolute -top-5 -right-4 z-2 p-1 text-secondary text-lg font-extrabold"
													>&#10003;</span
												>
											{/if}
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
