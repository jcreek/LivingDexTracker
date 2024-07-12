<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user } from '$lib/stores/user.js';
	import { type User } from '@supabase/auth-js';
	import mongoose, { Types } from 'mongoose';
	import { type PokedexEntry } from '$lib/models/PokedexEntry';
	import CatchRecordModel, { type CatchRecord } from '$lib/models/CatchRecord';
	import { type CombinedData } from '$lib/models/CombinedData';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';

	let localUser: User | null;
	const unsubscribe = user.subscribe((value) => {
		localUser = value;
	});
	onDestroy(unsubscribe);

	let pokedexEntries = null as PokedexEntry[] | null;
	let catchRecords = null as CatchRecord[] | null;
	let combinedData = null as CombinedData[] | null;

	let creatingRecords = false;
	let totalRecordsCreated = 0;

	async function fetchPokeDexEntries() {
		console.log('Fetching updated Pokedex entry data');
		const response = await fetch('/api/pokedexentries');
		if (!response.ok) {
			throw new Error('Failed to fetch Pokémon data');
		}

		pokedexEntries = await response.json();
	}

	async function fetchCatchRecords() {
		const response = await fetch('/api/catch-records');
		if (!response.ok) {
			throw new Error('Failed to fetch catch record data');
		}

		catchRecords = await response.json();

		// If there are no catch records, make one for each pokedex entry
		if (catchRecords?.length === 0 && localUser?.id) {
			creatingRecords = true;
			const newCatchRecords = pokedexEntries.map((entry) => ({
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

			await fetchCatchRecords();
			console.log('Created catch records for each pokedex entry');
			creatingRecords = false;
		}
	}

	const fetchLastModifiedDate = async () => {
		const response = await fetch('/api/pokedex-metadata');
		const { lastModified } = await response.json();
		return new Date(lastModified);
	};

	const cacheData = () => {
		localStorage.setItem('pokeDexEntries', JSON.stringify(pokedexEntries));
		localStorage.setItem('pokeDexLastUpdated', new Date().toISOString());
	};

	const checkForUpdates = async () => {
		const cachedData = localStorage.getItem('pokeDexEntries');
		const cachedDate = localStorage.getItem('pokeDexLastUpdated');

		if (cachedData && cachedDate) {
			const lastModified = await fetchLastModifiedDate();
			const lastUpdated = new Date(cachedDate);

			if (lastModified <= lastUpdated) {
				pokedexEntries = JSON.parse(cachedData);
				return;
			}
		}

		await fetchPokeDexEntries();
		cacheData();
	};

	onMount(async () => {
		await checkForUpdates()
			.then(async () => {
				await fetchCatchRecords();
			})
			.then(async () => {
				combinedData = [];

				// Combine pokedex entries with their corresponding catch records
				pokedexEntries.forEach((entry) => {
					let catchRecord = catchRecords.find((record) => record.pokedexEntryId === entry._id);
					if (catchRecord) {
						combinedData.push({ pokedexEntry: entry, catchRecord });
					}
				});
			});
	});

	async function updateACatch(catchRecord: CatchRecord) {
		alert('here');
		// if (!localUser?.id) {
		// 	alert('User not signed in');
		// 	return;
		// }

		// const requestOptions = {
		// 	method: 'PUT',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify(catchRecord)
		// };

		// try {
		// 	const response = await fetch('/api/catch-records', requestOptions);
		// 	if (!response.ok) {
		// 		throw new Error('Failed to update catch record');
		// 	}

		// 	const updatedRecord = await response.json();
		// 	console.log('Updated catch record:', updatedRecord);
		// } catch (error) {
		// 	console.error('Error updating catch record:', error);
		// }
	}
</script>

<div class="container mx-auto">
	{#if combinedData}
		<div>
			<button>Toggle Forms</button>
			<button>Toggle Origins</button>
		</div>

		<!-- <p>
		<button on:click={() => updateACatch(catchRecord)}>Save</button>
	</p> -->
		{#each combinedData as { pokedexEntry, catchRecord }}
			<div>
				<PokedexEntryCatchRecord
					{pokedexEntry}
					bind:catchRecord
					on:updateCatch={() => updateACatch(catchRecord)}
				/>
			</div>
		{/each}
	{:else}
		<span class="loading loading-spinner loading-xl"></span>
		<h1>Loading Pokédex</h1>
		<p>Please be patient, this can take some time on the first load.</p>
		{#if totalRecordsCreated > 0}
			<p>Processing {totalRecordsCreated}/{pokedexEntries?.length}</p>
		{:else if creatingRecords}
			<p>Processing...</p>
		{/if}
	{/if}
</div>
