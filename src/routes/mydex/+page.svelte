<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CombinedData } from '$lib/models/CombinedData';
	import { browser } from '$app/environment';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokedexSidebar from '$lib/components/pokedex/PokedexSidebar.svelte';
	import PokedexViewList from '$lib/components/pokedex/PokedexViewList.svelte';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';

	let combinedData = null as CombinedData[] | null;
	let currentPage = 1 as number;
	let itemsPerPage = 20 as number;
	let totalPages = 0 as number;
	let creatingRecords = false;
	let totalRecordsCreated = 0;
	let failedToLoad = false;
	let catchRegion = '';
	let catchGame = '';
	let localUser: User | null;
	let showOrigins = true;
	let showForms = true;
	let showShiny = false;
	let drawerOpen = false;
	let viewAsBoxes = false;
	let currentPlacement = 'boxPlacementForms';
	let boxNumbers = Array<any>;

	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	function toggleOrigins() {
		showOrigins = !showOrigins;
	}

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

	async function toggleViewAsBoxes() {
		viewAsBoxes = !viewAsBoxes;
		await getData();
	}

	async function getData(setCombinedDataToNull = true) {
		if (setCombinedDataToNull) {
			combinedData = null;
		}
		let endpoint = viewAsBoxes
			? `/api/combined-data/all?enableForms=${showForms}&region=${catchRegion}&game=${catchGame}`
			: `/api/combined-data?page=${currentPage}&limit=${itemsPerPage}&enableForms=${showForms}&region=${catchRegion}&game=${catchGame}`;
		const response = await fetch(endpoint);
		const data = await response.json();
		if (data.error) {
			failedToLoad = true;
			return;
		}
		combinedData = viewAsBoxes ? data : data.combinedData;
		totalPages = data.totalPages || 0;
		if (viewAsBoxes) {
			boxNumbers = [
				...new Set(combinedData.map(({ pokedexEntry }) => pokedexEntry[currentPlacement].box))
			].filter(Boolean);
		}
	}

	async function updateACatch(event: any) {
		const { catchRecord } = event.detail;
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
				alert('Failed to update catch record');
				throw new Error('Failed to update catch record');
			}
		} catch (error) {
			console.error('Error updating catch record:', error);
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
			await getData(false);
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

	async function getPokedexEntries() {
		const response = await fetch('/api/pokedexentries');
		if (!response.ok) {
			throw new Error('Failed to fetch Pokémon data');
		}

		return await response.json();
	}

	async function createCatchRecords() {
		// this user doesn't have any catch records, so we need to create them
		await getPokedexEntries().then(async (pokedexEntries) => {
			// If there are no catch records, make one for each pokedex entry
			creatingRecords = true;
			const newCatchRecords = pokedexEntries.map((entry: PokedexEntry) => ({
				userId: localUser?.id,
				pokedexEntryId: entry._id,
				haveToEvolve: false,
				caught: false,
				inHome: false,
				hasGigantamaxed: false,
				personalNotes: ''
			}));

			if (newCatchRecords.length === 0) {
				alert('No pokedex entries to create catch records for');
				return;
			}

			const batchSize = 500;
			for (let i = 0; i < newCatchRecords.length; i += batchSize) {
				const batch = newCatchRecords.slice(i, i + batchSize);

				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(batch)
				};

				try {
					const response = await fetch('/api/catch-records', requestOptions);
					if (!response.ok) {
						throw new Error('Failed to create catch records');
					}

					const createdRecords = await response.json();
					totalRecordsCreated += createdRecords.length;
					console.log(`Created ${createdRecords.length} catch records`);
				} catch (error) {
					console.error('Error creating catch records:', error);
				}
			}

			console.log('Created catch records for each pokedex entry');
			creatingRecords = false;
			failedToLoad = false;
			await getData();
		});
	}

	onMount(async () => {
		await getData();
	});

	$: {
		if (browser) {
			currentPage, itemsPerPage, getData();
		}
	}

	$: currentPlacement = showForms ? 'boxPlacementForms' : 'boxPlacement';
</script>

<svelte:head>
	<title>Living Dex Tracker - My Dex</title>
</svelte:head>

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
			<button class="btn btn-primary" on:click={toggleViewAsBoxes}>
				{viewAsBoxes ? 'Switch to List View' : 'Switch to Box View'}
			</button>
			{#if viewAsBoxes}
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
			{:else}
				<PokedexViewList
					bind:showOrigins
					bind:showForms
					bind:showShiny
					bind:combinedData
					bind:creatingRecords
					bind:totalRecordsCreated
					bind:failedToLoad
					{updateACatch}
					{createCatchRecords}
				/>
			{/if}
		</div>
		<div class="drawer-side lg:relative">
			<label for="my-drawer" class="drawer-overlay lg:hidden"></label>
			<PokedexSidebar
				bind:viewAsBoxes
				bind:currentPage
				bind:itemsPerPage
				bind:totalPages
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
