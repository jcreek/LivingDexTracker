<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import { type CombinedData } from '$lib/models/CombinedData';
	import { browser } from '$app/environment';
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import { calculateBoxNumbers, calculateBoxPlacement } from '$lib/utils/boxPlacement';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';
	import PokedexModal from '$lib/components/pokedex/PokedexModal.svelte';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';
	import type { Pokedex } from '$lib/models/Pokedex';
	import type { PageData } from './$types';

	export let data: PageData;

	// Get pokédex from server load (guarded for transient undefined during navigation/HMR)
	let pokedex: Pokedex | undefined;
	let pokedexId = '';
	$: pokedex = data?.pokedex;
	$: pokedexId = pokedex?._id ?? '';

	let combinedData = null as CombinedData[] | null;
	let currentPage = 1 as number;
	// Box view requires the full dataset for correct box numbering/placement.
	// If/when a paginated list view is introduced, this can be lowered and paired with UI controls.
	let itemsPerPage = 9999 as number;
	let totalPages = 0 as number;
	let creatingRecords = false;
	let totalRecordsCreated = 0;
	let failedToLoad = false;
	let localUser: User | null;
	let boxNumbers: number[] = [];
	let showModal = false;
	let selectedPokemon: CombinedData | null = null;

	// Derive from pokedex config
	$: showOrigins = !!pokedex?.isOriginDex;
	$: showShiny = !!pokedex?.isShinyDex;

	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	function openPokemonModal(pokemon: CombinedData) {
		selectedPokemon = pokemon;
		showModal = true;
	}

	function closePokemonModal() {
		showModal = false;
		selectedPokemon = null;
	}

	async function handleModalCatchUpdate(event: any) {
		await updateACatch(event); // Existing handler
		// Sync modal with refreshed data
		if (selectedPokemon && combinedData) {
			const updated = combinedData.find(
				(cd) => cd.pokedexEntry._id === selectedPokemon!.pokedexEntry._id
			);
			if (updated) {
				selectedPokemon = updated;
			}
		}
	}

	type GetDataOptions = {
		page?: number;
		perPage?: number;
		setCombinedDataToNull?: boolean;
	};

	async function getData({
		page = currentPage,
		perPage = itemsPerPage,
		setCombinedDataToNull = true
	}: GetDataOptions = {}) {
		if (!pokedex || !pokedexId) return;
		if (setCombinedDataToNull) {
			combinedData = null;
		}
		const effectivePage = Math.max(1, page);
		const effectivePerPage = Math.max(1, perPage);
		// Use new pokédex-scoped endpoint
		const endpoint = `/api/pokedexes/${pokedexId}/combined-data?page=${effectivePage}&limit=${effectivePerPage}&enableForms=${pokedex.isFormDex}`;

		const response = await fetch(endpoint);
		const fetchedData = await response.json();
		if (fetchedData.error) {
			failedToLoad = true;
			return;
		}
		combinedData = fetchedData.combinedData;
		totalPages = fetchedData.totalPages || 0;
		// Always extract box numbers for box view
		if (combinedData) {
			boxNumbers = calculateBoxNumbers(combinedData.length);
		}
	}

	async function updateACatch(event: any) {
		if (!pokedexId) return;
		const { catchRecord } = event.detail;
		// Enforce mutual exclusivity (should be impossible to have both true).
		const sanitizedCatchRecord: CatchRecord = { ...catchRecord };
		if (sanitizedCatchRecord.caught) {
			sanitizedCatchRecord.haveToEvolve = false;
		}
		if (sanitizedCatchRecord.haveToEvolve) {
			sanitizedCatchRecord.caught = false;
		}
		if (!localUser?.id) {
			alert('User not signed in');
			return;
		}

		const requestOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(sanitizedCatchRecord),
			credentials: 'include' as RequestCredentials
		};

		try {
			// Use new pokédex-scoped endpoint
			const response = await fetch(`/api/pokedexes/${pokedexId}/catch-records`, requestOptions);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Server response:', response.status, errorText);
				alert('Failed to update catch record');
				throw new Error('Failed to update catch record');
			}

			// Refresh the data to reflect changes from server
			await getData({ page: currentPage, perPage: itemsPerPage, setCombinedDataToNull: false });
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
		if (!combinedData) return;
		if (!pokedexId) return;

		const catchRecordsToUpdate: CatchRecord[] = combinedData
			.filter((_, index) => calculateBoxPlacement(index).box === boxNumber)
			.map(({ pokedexEntry, catchRecord }) => {
				// Create default record if null
				const baseRecord: CatchRecord = catchRecord ?? {
					_id: '',
					userId: localUser?.id || '',
					pokedexEntryId: pokedexEntry._id,
					pokedexId: pokedexId,
					haveToEvolve: false,
					caught: false,
					inHome: false,
					hasGigantamaxed: false,
					personalNotes: ''
				};

				let updatedRecord: CatchRecord = { ...baseRecord };
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
		// Use new pokédex-scoped endpoint
		try {
			const response = await fetch(`/api/pokedexes/${pokedexId}/catch-records`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(catchRecordsToUpdate)
			});
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Server response:', response.status, errorText);
				alert(
					`Failed to update catch records: ${response.status} ${response.statusText}\n${errorText}`
				);
				return;
			}

			await getData({ page: currentPage, perPage: itemsPerPage, setCombinedDataToNull: false });
		} catch (error) {
			console.error('Error updating catch records:', error);
			alert(
				`Network error updating catch records: ${error instanceof Error ? error.message : String(error)}`
			);
		}
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
		if (!pokedexId) return;
		// this user doesn't have any catch records, so we need to create them
		await getPokedexEntries().then(async (pokedexEntries) => {
			// If there are no catch records, make one for each pokedex entry
			creatingRecords = true;
			const newCatchRecords = pokedexEntries.map((entry: PokedexEntry) => ({
				userId: localUser?.id,
				pokedexEntryId: entry._id,
				pokedexId: pokedexId,
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
					// Use new pokédex-scoped endpoint
					const response = await fetch(`/api/pokedexes/${pokedexId}/catch-records`, requestOptions);
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
			await getData({ page: currentPage, perPage: itemsPerPage });
		});
	}

	// Fetch data whenever pagination controls change (client-side only)
	$: if (browser && pokedexId) getData({ page: currentPage, perPage: itemsPerPage });
</script>

<svelte:head>
	<title>{pokedex ? `${pokedex.name} - Living Dex Tracker` : 'Pokédex - Living Dex Tracker'}</title>
</svelte:head>

{#if !localUser}
	<p>Please <a href="/signin" class="underline text-primary hover:text-secondary">sign in</a></p>
{:else if !pokedex}
	<p>Loading...</p>
{:else}
	<div class="container mx-auto p-4 max-w-screen-2xl">
		<!-- Pokédex Header -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<!-- Left side: Title and metadata -->
					<div class="flex-1">
						<h1 class="card-title text-3xl mb-3">{pokedex.name}</h1>

						<div class="flex flex-wrap items-center gap-3">
							<!-- Type badges -->
							{#if pokedex.isLivingDex}
								<div class="badge badge-primary badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
									Living
								</div>
							{/if}
							{#if pokedex.isShinyDex}
								<div class="badge badge-secondary badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
									Shiny
								</div>
							{/if}
							{#if pokedex.isOriginDex}
								<div class="badge badge-accent badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
											clip-rule="evenodd"
										/>
									</svg>
									Origin
								</div>
							{/if}
							{#if pokedex.isFormDex}
								<div class="badge badge-info badge-lg gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
										/>
									</svg>
									Form
								</div>
							{/if}

							<!-- Game scope -->
							{#if pokedex.gameScope}
								<div class="divider divider-horizontal mx-0"></div>
								<div class="flex items-center gap-2 text-base-content/70">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
										<path
											fill-rule="evenodd"
											d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="font-semibold">{pokedex.gameScope}</span>
								</div>
							{:else}
								<div class="divider divider-horizontal mx-0"></div>
								<div class="flex items-center gap-2 text-base-content/70">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="font-semibold">All Games</span>
								</div>
							{/if}
						</div>

						{#if pokedex.description}
							<p class="text-sm text-base-content/70 mt-3">{pokedex.description}</p>
						{/if}
					</div>

					<!-- Right side: Actions -->
					<div class="flex flex-row lg:flex-col gap-2">
						<a href="/my-pokedexes" class="btn btn-outline btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
								/>
							</svg>
							My Pokédexes
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Box View -->
		<PokedexViewBoxes
			{showShiny}
			bind:combinedData
			bind:boxNumbers
			bind:creatingRecords
			bind:failedToLoad
			{markBoxAsNotCaught}
			{markBoxAsCaught}
			{markBoxAsNeedsToEvolve}
			{markBoxAsInHome}
			{markBoxAsNotInHome}
			{createCatchRecords}
			onPokemonClick={openPokemonModal}
		/>
	</div>

	{#if showModal && selectedPokemon}
		<PokedexModal isOpen={showModal} onClose={closePokemonModal}>
			<PokedexEntryCatchRecord
				pokedexEntry={selectedPokemon.pokedexEntry}
				bind:catchRecord={selectedPokemon.catchRecord}
				{showOrigins}
				showForms={pokedex.isFormDex}
				{showShiny}
				userId={localUser?.id}
				{pokedexId}
				on:updateCatch={handleModalCatchUpdate}
			/>
		</PokedexModal>
	{/if}
{/if}
