<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CatchRecord } from '$lib/models/CatchRecord';
	import { type CombinedData } from '$lib/models/CombinedData';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokedexSidebar from '$lib/components/pokedex/PokedexSidebar.svelte';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';

	let combinedData = null as CombinedData[] | null;
	let failedToLoad = false;

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showOrigins = true;
	let showForms = true;
	let drawerOpen = false;
	let catchRegion = '';
	let catchGame = '';
	let creatingRecords = false;

	function toggleOrigins() {
		showOrigins = !showOrigins;
	}

	async function toggleForms() {
		showForms = !showForms;
		await getData();
	}

	let showShiny = false;
	let currentPlacement = 'boxPlacementForms';
	let boxNumbers = Array<any>;

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

		const response = await fetch(
			`/api/combined-data/all?enableForms=${showForms}&region=${catchRegion}&game=${catchGame}`
		);
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

{#if !localUser}
	<p>Please <a href="/signin" class="underline text-primary hover:text-secondary">sign in</a></p>
{:else}
	<div class="drawer lg:drawer-open">
		<input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />
		<div class="drawer-content flex flex-col items-center justify-center md:ml-64">
			<label
				for="my-drawer"
				class="btn btn-secondary drawer-button lg:hidden fixed -left-10 top-1/2 -rotate-90"
			>
				{drawerOpen ? 'Close Filters' : 'Open Filters'}
			</label>
			<PokedexViewBoxes
				bind:showShiny
				bind:combinedData
				bind:boxNumbers
				bind:currentPlacement
				bind:creatingRecords
				bind:failedToLoad
				{markBoxAsNotCaught}
				{markBoxAsCaught}
				{markBoxAsNeedsToEvolve}
				{markBoxAsInHome}
				{markBoxAsNotInHome}
			/>
		</div>
		<div class="drawer-side lg:relative">
			<label for="my-drawer" class="drawer-overlay lg:hidden"></label>
			<PokedexSidebar
				bind:showForms
				bind:showOrigins
				bind:showShiny
				bind:catchRegion
				bind:catchGame
				{getData}
				{toggleForms}
				{toggleOrigins}
				{toggleShiny}
			/>
		</div>
	</div>
{/if}
