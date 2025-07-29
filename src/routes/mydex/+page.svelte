<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import {
		currentPokedex,
		userPokedexes,
		loadUserPokedexes
	} from '$lib/stores/currentPokedexStore';
	import { type User } from '@supabase/auth-js';
	import { type CombinedData } from '$lib/models/CombinedData';
	import { browser } from '$app/environment';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import type { UserPokedex } from '$lib/models/UserPokedex';
	import ResponsiveNavigation from '$lib/components/ResponsiveNavigation.svelte';
	import PokedexViewList from '$lib/components/pokedex/PokedexViewList.svelte';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';
	import MultiRegionalTabs from '$lib/components/MultiRegionalTabs.svelte';
	import {
		getMultiRegionalConfig,
		isMultiRegional,
		type MultiRegionalPokedex
	} from '$lib/models/RegionalPokedex';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ supabase, session, pokedexId } = data);

	let combinedData = null as CombinedData[] | null;
	let currentPage = 1 as number;
	let itemsPerPage = 20 as number;
	let totalPages = 0 as number;
	let creatingRecords = false;
	let totalRecordsCreated = 0;
	let failedToLoad = false;
	let selectedPokedex: UserPokedex | null = null;
	let catchRegion = '';
	let catchGame = '';
	let localUser: User | null;
	let showOrigins = false; // Hide origins by default since it's not user-configurable
	let showForms = true;   // Show forms by default
	let showShiny = false;  // Hide shiny by default
	let viewAsBoxes = false;
	let currentPlacement = 'boxPlacementForms';
	let boxNumbers: number[] = [];
	let activeRegion = '';
	let multiRegionalConfig: MultiRegionalPokedex | null = null;


	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	// Reactive statement to handle multi-regional configuration
	$: if (selectedPokedex) {
		const config = getMultiRegionalConfig(selectedPokedex.regionalPokedexName);
		multiRegionalConfig = config;

		// Set initial active region (default or current regional pokedex name)
		if (config) {
			const defaultRegion = config.regions.find((r) => r.isDefault);
			activeRegion = defaultRegion ? defaultRegion.name : config.regions[0].name;
		} else {
			activeRegion = selectedPokedex.regionalPokedexName;
		}
	}

	// Reactive statement to reload data when selected pokédx or active region changes
	$: if (selectedPokedex && activeRegion && browser) {
		getData();
	}

	// Reactive statement to update selectedPokedex when URL pokedexId changes
	$: if (pokedexId && $userPokedexes.length > 0 && browser) {
		const newSelectedPokedex = $userPokedexes.find((p) => p.id === pokedexId);
		if (newSelectedPokedex && newSelectedPokedex !== selectedPokedex) {
			selectedPokedex = newSelectedPokedex;
		}
	}

	// Load user pokedexes and set selected pokedex
	onMount(async () => {
		await loadUserPokedexes();

		// If pokedexId is provided in URL, find and set that pokedex
		if (pokedexId) {
			selectedPokedex = $userPokedexes.find((p) => p.id === pokedexId) || null;
		}

		// If no pokedex selected, use the first available one
		if (!selectedPokedex && $userPokedexes.length > 0) {
			selectedPokedex = $userPokedexes[0];
		}

		// If still no pokedex available, redirect to pokedexes management
		if (!selectedPokedex) {
			if (browser) {
				window.location.href = '/pokedexes';
			}
			return;
		}

		// Set current pokedex in store
		currentPokedex.set(selectedPokedex);
		await getData();
	});

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

	function handleRegionChange(event: CustomEvent<{ regionName: string }>) {
		activeRegion = event.detail.regionName;
		currentPage = 1; // Reset to first page when changing regions
	}

	function onPokedexChange(pokedex: UserPokedex) {
		// This could be expanded to handle pokédx switching from the navigation
		selectedPokedex = pokedex;
	}

	async function getData(setCombinedDataToNull = true) {
		if (setCombinedDataToNull) {
			combinedData = null;
		}

		// Add pokedexId parameter to filter data by selected pokédx
		const pokedexParam = selectedPokedex?.id ? `&pokedexId=${selectedPokedex.id}` : '';

		// Add pokédx settings parameters (use activeRegion for multi-regional support)
		const pokédxParams = selectedPokedex
			? `&regionalPokedexName=${activeRegion || selectedPokedex?.regionalPokedexName || 'national'}&gameScope=${selectedPokedex?.gameScope || 'all_games'}&generation=${selectedPokedex?.generation || ''}`
			: '';

		let endpoint = viewAsBoxes
			? `/api/combined-data/all?enableForms=${showForms}&region=${catchRegion}&game=${catchGame}${pokedexParam}${pokédxParams}`
			: `/api/combined-data?page=${currentPage}&limit=${itemsPerPage}&enableForms=${showForms}&region=${catchRegion}&game=${catchGame}${pokedexParam}${pokédxParams}`;
		const response = await fetch(endpoint);
		const data = await response.json();
		if (data.error) {
			failedToLoad = true;
			return;
		}
		combinedData = viewAsBoxes ? data : data.combinedData;
		totalPages = data.totalPages || 0;
		if (viewAsBoxes) {
			// Let the PokedexViewBoxes component calculate dynamic box numbers
			// This is handled by dynamicBoxNumbers in that component
			boxNumbers = [];
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
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(catchRecord),
			credentials: 'include' as RequestCredentials
		};

		try {
			const response = await fetch('/api/catch-records', requestOptions);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Server response:', response.status, errorText);
				alert('Failed to update catch record');
				throw new Error('Failed to update catch record');
			}

			// Refresh the data to reflect changes from server
			await getData(false);
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
			.map(({ pokedexEntry, catchRecord }) => {
				// Create default record if null
				const baseRecord = catchRecord || {
					_id: '',
					userId: localUser?.id || '',
					pokedexEntryId: pokedexEntry._id,
					pokedexId: selectedPokedex?.id, // Use selected pokedex ID, undefined if none selected
					haveToEvolve: false,
					caught: false,
					inHome: false,
					hasGigantamaxed: false,
					personalNotes: ''
				};

				// Ensure pokedexId is always set to current selection (for legacy records)
				if (!baseRecord.pokedexId && selectedPokedex?.id) {
					baseRecord.pokedexId = selectedPokedex.id;
				}

				let updatedRecord = { ...baseRecord };
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

			// Backend now handles filtering, so we use all returned entries
			const newCatchRecords = pokedexEntries.map((entry: PokedexEntry) => ({
				userId: localUser?.id,
				pokedexEntryId: entry._id,
				pokedexId: '', // Will be set to default pokédex by the API
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
				} catch (error) {
					console.error('Error creating catch records:', error);
				}
			}

			creatingRecords = false;
			failedToLoad = false;
			await getData();
		});
	}

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
	<p class="text-center p-8">
		Please <a href="/signin" class="underline text-primary hover:text-secondary">sign in</a>
	</p>
{:else}
	<div class="flex flex-col min-h-screen">
		<!-- Responsive Navigation -->
		<ResponsiveNavigation
			bind:viewAsBoxes
			bind:currentPage
			bind:itemsPerPage
			bind:totalPages
			bind:catchGame
			{getData}
			{toggleViewAsBoxes}
		/>

		<!-- Multi-regional tabs for games with multiple regions -->
		{#if multiRegionalConfig}
			<div class="w-full max-w-6xl mx-auto px-4 pt-4">
				<MultiRegionalTabs
					config={multiRegionalConfig}
					{activeRegion}
					on:regionChange={handleRegionChange}
				/>
			</div>
		{/if}

		<!-- Main Content Area -->
		<div class="flex-1 w-full max-w-6xl mx-auto px-4">
			{#if viewAsBoxes}
				<PokedexViewBoxes
					bind:showShiny
					bind:combinedData
					bind:boxNumbers
					bind:currentPlacement
					bind:creatingRecords
					bind:failedToLoad
					regionalPokedexName={activeRegion || 'national'}
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
					userId={localUser?.id}
					regionalPokedexName={activeRegion || 'national'}
					{updateACatch}
					{createCatchRecords}
				/>
			{/if}
		</div>
	</div>
{/if}
