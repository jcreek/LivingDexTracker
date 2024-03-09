<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { db, type PokedexEntry } from '$lib/db';
	import { pokemonData } from '$lib/pokemonData';

	let pokedexEntries = [] as PokedexEntry[];

	async function fetchPokedexEntriesFromDB() {
		if (!browser) return;
		try {
			pokedexEntries = await db.pokedex.toArray();
		} catch (error) {
			console.error('Error fetching data from IndexedDB:', error);
		}
	}

	async function updatePokedexEntry(pokedexEntry: PokedexEntry) {
		try {
			const count = await db.pokedex
				.where('pokedexNumber')
				.equals(pokedexEntry.pokedexNumber)
				.count();
			if (count === 0) {
				console.log(`No record found with pokedexNumber: ${pokedexEntry.pokedexNumber}`);
				return;
			}

			const updatedCount = await db.pokedex.update(pokedexEntry.pokedexNumber, pokedexEntry);
			if (updatedCount === 0) {
				console.log(`No fields were updated for pokedexNumber: ${pokedexEntry.pokedexNumber}`);
			}
		} catch (error) {
			console.error('Error updating record:', error);
		}
	}

	onMount(async () => {
		if (!browser) return;
		// Check if data already exists in IndexedDB
		try {
			const existingData = await db.pokedex.toArray();
			if (existingData.length === 0) {
				// If no data exists, populate IndexedDB with pokemonData
				await db.pokedex.bulkAdd(pokemonData);
			}
		} catch (error) {
			console.error('Error checking existing data from IndexedDB:', error);
		}

		fetchPokedexEntriesFromDB();
	});
</script>

<div class="input-container">
	{#each pokedexEntries as pokedexEntry}
		<div>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-order`}
				name={`${pokedexEntry.pokedexNumber}-order`}
				bind:value={pokedexEntry.order}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-box-box`}
				name={`${pokedexEntry.pokedexNumber}-box-box`}
				bind:value={pokedexEntry.boxPlacement.box}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-box-row`}
				name={`${pokedexEntry.pokedexNumber}-box-row`}
				bind:value={pokedexEntry.boxPlacement.row}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-box-column`}
				name={`${pokedexEntry.pokedexNumber}-box-column`}
				bind:value={pokedexEntry.boxPlacement.column}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-pokedex`}
				name={`${pokedexEntry.pokedexNumber}-pokedex`}
				bind:value={pokedexEntry.pokedexNumber}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="text"
				id={`${pokedexEntry.pokedexNumber}-pokemon`}
				name={`${pokedexEntry.pokedexNumber}-pokemon`}
				bind:value={pokedexEntry.pokemon}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="checkbox"
				id={`${pokedexEntry.pokedexNumber}-haveToEvolve`}
				name={`${pokedexEntry.pokedexNumber}-haveToEvolve`}
				bind:value={pokedexEntry.haveToEvolve}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="checkbox"
				id={`${pokedexEntry.pokedexNumber}-caught`}
				name={`${pokedexEntry.pokedexNumber}-caught`}
				bind:value={pokedexEntry.caught}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="checkbox"
				id={`${pokedexEntry.pokedexNumber}-inHome`}
				name={`${pokedexEntry.pokedexNumber}-inHome`}
				bind:value={pokedexEntry.inHome}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="text"
				id={`${pokedexEntry.pokedexNumber}-form`}
				name={`${pokedexEntry.pokedexNumber}-form`}
				bind:value={pokedexEntry.form}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="number"
				id={`${pokedexEntry.pokedexNumber}-generation`}
				name={`${pokedexEntry.pokedexNumber}-generation`}
				bind:value={pokedexEntry.generation}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="text"
				id={`${pokedexEntry.pokedexNumber}-originGame`}
				name={`${pokedexEntry.pokedexNumber}-originGame`}
				bind:value={pokedexEntry.originGame}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="text"
				id={`${pokedexEntry.pokedexNumber}-alternativeOrigin`}
				name={`${pokedexEntry.pokedexNumber}-alternativeOrigin`}
				bind:value={pokedexEntry.alternativeOrigin}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
			<input
				type="text"
				id={`${pokedexEntry.pokedexNumber}-howToObtain`}
				name={`${pokedexEntry.pokedexNumber}-howToObtain`}
				bind:value={pokedexEntry.howToObtain}
				on:blur={() => updatePokedexEntry(pokedexEntry)}
			/>
		</div>
	{/each}
</div>

<style>
	.input-container {
		display: flex;
		flex-wrap: wrap;
	}

	.input-container > div {
		flex: 1 0 50%;
		margin: 5px;
	}

	input[type='text'] {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
	}

	@media (max-width: 768px) {
		.input-container > div {
			flex-basis: 100%;
		}
	}
</style>
