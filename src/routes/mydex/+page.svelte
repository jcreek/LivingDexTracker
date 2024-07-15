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
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let showOrigins = true;
	let showForms = true;
	let drawerOpen = false;

	function toggleOrigins() {
		showOrigins = !showOrigins;
	}

	async function toggleForms() {
		showForms = !showForms;
		await getData();
	}

	async function getData() {
		combinedData = null;

		const response = await fetch(
			`/api/combined-data?page=${currentPage}&limit=${itemsPerPage}&enableForms=${showForms}&region=${catchRegion}&game=${catchGame}`
		);
		const data = await response.json();

		if (data.error) {
			failedToLoad = true;
			return;
		}

		combinedData = data.combinedData;
		totalPages = data.totalPages;
	}

	$: {
		if (browser) {
			currentPage, itemsPerPage, getData();
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
			<main class="flex-1 p-4 w-full">
				<div class="max-w-min mx-auto">
					{#if combinedData && combinedData.length > 0}
						{#each combinedData as { pokedexEntry, catchRecord }}
							<PokedexEntryCatchRecord
								{pokedexEntry}
								{showOrigins}
								{showForms}
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
								If you're seeing this, you probably haven't created your Pokédex data yet. Please do
								so by clicking this button.
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
		</div>
		<div class="drawer-side lg:relative">
			<label for="my-drawer" class="drawer-overlay lg:hidden"></label>
			<aside
				class="menu bg-gray-800 text-white min-h-full w-64 p-4 lg:fixed xs:top-0 lg:left-0 h-full lg:h-5/6"
			>
				<h2 class="text-2xl font-semibold mb-4">Filters</h2>
				<ul>
					<li class="mb-2">
						<button class="block p-2 hover:bg-gray-700 rounded" on:click={() => toggleForms()}>
							Toggle Forms (Currently {showForms ? 'On' : 'Off'})
						</button>
					</li>
					<li class="mb-2">
						<button class="block p-2 hover:bg-gray-700 rounded" on:click={() => toggleOrigins()}>
							Toggle Origins (Currently {showOrigins ? 'On' : 'Off'})
						</button>
					</li>
				</ul>
				<div class="mb-4">
					<label for="catchRegionSelect">Region to catch in:</label>
					<select
						id="catchRegionSelect"
						class="select select-bordered w-full max-w-xs text-black"
						bind:value={catchRegion}
						on:change={getData}
					>
						<option value="">All</option>
						<option value="Kanto">Kanto (Red, Blue, Yellow, LG: Pikachu, LG: Eevee)</option>
						<option value="Johto">Johto (Gold, Silver, Crystal, HG, SS)</option>
						<option value="Hoenn">Hoenn (Ruby, Sapphire, Emerald, OR, AS)</option>
						<option value="Sinnoh">Sinnoh (Diamond, Pearl, Platinum, BD, SP)</option>
						<option value="Unova">Unova (Black, White, Black2, White2, Dream Radar)</option>
						<option value="Kalos">Kalos (X, Y)</option>
						<option value="Alola">Alola (Sun, Moon, Moon Demo, US, UM)</option>
						<option value="Galar">Galar (Sword, Shield)</option>
						<option value="Hisui">Hisui (PLA)</option>
						<option value="Paldea">Paldea (Scarlet, Violet)</option>
						<option value="Unknown">Unknown (Home, Go)</option>
					</select>
				</div>

				<div class="mb-4">
					<label for="catchGameSelect">Game to catch in: {catchGame}</label>
					<select
						id="catchGameSelect"
						class="select select-bordered w-full max-w-xs text-black"
						bind:value={catchGame}
						on:change={getData}
					>
						<option value="">All</option>
						<option value="Red">Red (Kanto)</option>
						<option value="Blue">Blue (Kanto)</option>
						<option value="Yellow">Yellow (Kanto)</option>
						<option value="LG: Pikachu">LG: Pikachu (Kanto)</option>
						<option value="LG: Eevee">LG: Eevee (Kanto)</option>
						<option value="Gold">Gold (Johto)</option>
						<option value="Silver">Silver (Johto)</option>
						<option value="Crystal">Crystal (Johto)</option>
						<option value="HG">HG (Johto)</option>
						<option value="SS">SS (Johto)</option>
						<option value="Ruby">Ruby (Hoenn)</option>
						<option value="Sapphire">Sapphire (Hoenn)</option>
						<option value="Emerald">Emerald (Hoenn)</option>
						<option value="OR">OR (Hoenn)</option>
						<option value="AS">AS (Hoenn)</option>
						<option value="Diamond">Diamond (Sinnoh)</option>
						<option value="Pearl">Pearl (Sinnoh)</option>
						<option value="Platinum">Platinum (Sinnoh)</option>
						<option value="BD">BD (Sinnoh)</option>
						<option value="SP">SP (Sinnoh)</option>
						<option value="Black">Black (Unova)</option>
						<option value="White">White (Unova)</option>
						<option value="Black2">Black2 (Unova)</option>
						<option value="White2">White2 (Unova)</option>
						<option value="Dream Radar">Dream Radar (Unova)</option>
						<option value="X">X (Kalos)</option>
						<option value="Y">Y (Kalos)</option>
						<option value="Sun">Sun (Alola)</option>
						<option value="Moon">Moon (Alola)</option>
						<option value="Moon Demo">Moon Demo (Alola)</option>
						<option value="US">US (Alola)</option>
						<option value="UM">UM (Alola)</option>
						<option value="Sword">Sword (Galar)</option>
						<option value="Shield">Shield (Galar)</option>
						<option value="PLA">PLA (Hisui)</option>
						<option value="Scarlet">Scarlet (Paldea)</option>
						<option value="Violet">Violet (Paldea)</option>
						<option value="Home">Home (Unknown)</option>
						<option value="Go">Go (Unknown)</option>
					</select>
				</div>

				<h2 class="text-2xl font-semibold mb-4">Paging</h2>
				<div>
					<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
				</div>
			</aside>
		</div>
	</div>
{/if}
