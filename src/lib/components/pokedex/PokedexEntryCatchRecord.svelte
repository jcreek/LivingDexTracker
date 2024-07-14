<script lang="ts">
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '../PokemonSprite.svelte';
	import { createEventDispatcher } from 'svelte';

	export let pokedexEntry: PokedexEntry;
	export let catchRecord: CatchRecord;
	export let showOrigins: boolean;
	export let showForms: boolean;

	const dispatch = createEventDispatcher();

	function save() {
		dispatch('updateCatch', { pokedexEntry, catchRecord });
	}
</script>

<div
	class="dex-entry bg-primary/90 text-primary-content rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4 mb-4"
>
	<div class="dex-column pokedex-entry-container">
		<div class="flex mb-2">
			<div class="sprite-container flex justify-center items-center bg-white rounded-lg p-2">
				<!-- <PokemonSprite
					pokedexNumber={pokedexEntry.pokedexNumber.toString().padStart(3, '0')}
					form={pokedexEntry.form
						.replace(/[^a-zA-Z ]/g, '')
						.trim()
						.replace(/ /g, '-')}
				/> -->
			</div>
			<div class="pl-2">
				<h3 class="text-xl font-bold pt-1 text-secondary">{pokedexEntry.pokemon}</h3>
				<sub class="text-gray-200">#{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</sub>
			</div>
		</div>

		{#if showForms}
			<div class="bg-white text-black rounded-lg p-4 mb-2">
				<p><strong>Form:</strong> {pokedexEntry.form ? pokedexEntry.form : '-'}</p>
			</div>
		{/if}

		<div class="bg-white text-black rounded-lg p-4">
			<p><strong>Box:</strong> {pokedexEntry.boxPlacement.box}</p>
			<p><strong>Row:</strong> {pokedexEntry.boxPlacement.row}</p>
			<p><strong>Column:</strong> {pokedexEntry.boxPlacement.column}</p>
			{#if showForms}
				<p><strong>Can Gigantamax:</strong> {pokedexEntry.canGigantamax ? 'Yes' : 'No'}</p>
			{/if}
			{#if pokedexEntry.notes}
				<p><strong>Notes:</strong> {pokedexEntry.notes}</p>
			{/if}
		</div>
	</div>

	<div class="dex-column catch-record-container bg-white text-black rounded-lg p-4 mb-4 md:mb-0">
		<div class="flex items-center">
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="block font-bold mr-2">Caught:</span>
					<input
						type="checkbox"
						bind:checked={catchRecord.caught}
						class="checkbox checkbox-primary border-black"
					/>
				</label>
			</div>
		</div>
		<div class="flex items-center">
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="block font-bold mr-2">Needs to evolve:</span>
					<input
						type="checkbox"
						bind:checked={catchRecord.haveToEvolve}
						class="checkbox checkbox-primary border-black"
					/>
				</label>
			</div>
		</div>
		<div class="flex items-center">
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="block font-bold mr-2">In home:</span>
					<input
						type="checkbox"
						bind:checked={catchRecord.inHome}
						class="checkbox checkbox-primary border-black"
					/>
				</label>
			</div>
		</div>
		{#if pokedexEntry.canGigantamax && showForms}
			<div class="flex items-center">
				<div class="form-control">
					<label class="cursor-pointer label">
						<span class="block font-bold mr-2">Has Gigantamaxed:</span>
						<input
							type="checkbox"
							bind:checked={catchRecord.hasGigantamaxed}
							class="checkbox checkbox-primary border-black"
						/>
					</label>
				</div>
			</div>
		{/if}
		<p>
			<label class="block font-bold mb-1" for={`personalNotesInput-${catchRecord._id}`}
				>Notes:</label
			>
			<textarea
				bind:value={catchRecord.personalNotes}
				id={`personalNotesInput-${catchRecord._id}`}
				class="form-textarea w-full p-2 border rounded"
			></textarea>
		</p>
	</div>

	<div class="dex-column additional-details-container">
		{#if showOrigins}
			<div class="bg-white text-black rounded-lg p-4 mb-2">
				<p><strong>Region to Catch In:</strong> {pokedexEntry.regionToCatchIn}</p>
				<p><strong>Games to catch in:</strong></p>
				<ul class="list-disc list-inside">
					{#each pokedexEntry.gamesToCatchIn as game}
						<li>{game}</li>
					{/each}
				</ul>
				{#if pokedexEntry.regionToEvolveIn}
					<p><strong>Region to Evolve In:</strong> {pokedexEntry.regionToEvolveIn}</p>
				{/if}
			</div>
		{/if}
		<div class="bg-white text-black rounded-lg p-4">
			<button on:click={save}>Save</button>
		</div>
	</div>
</div>

<style>
	.dex-column {
		width: 300px;
	}

	.sprite-container {
		width: 68px;
		height: 68px;
	}

	.form-checkbox {
		appearance: none;
		background-color: #fff;
		border: 2px solid #000;
		border-radius: 0.25rem;
		width: 1.5rem;
		height: 1.5rem;
		display: inline-block;
		position: relative;
	}

	.form-checkbox:checked {
		background-color: #00bfff;
		background-size: 100% 100%;
		background-position: center center;
		background-repeat: no-repeat;
	}

	.form-textarea {
		min-height: 3rem;
		background-color: #fff;
	}
</style>
