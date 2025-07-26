<script lang="ts">
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '../PokemonSprite.svelte';
	import { createEventDispatcher } from 'svelte';

	export let pokedexEntry: PokedexEntry;
	export let catchRecord: CatchRecord | null;
	export let showOrigins: boolean;
	export let showForms: boolean;
	export let showShiny: boolean;

	// Create a working copy for editing
	$: workingCatchRecord = catchRecord || {
		_id: '',
		userId: '',
		pokedexEntryId: pokedexEntry._id,
		haveToEvolve: false,
		caught: false,
		inHome: false,
		hasGigantamaxed: false,
		personalNotes: ''
	};

	const dispatch = createEventDispatcher();

	function updateCatchRecord() {
		dispatch('updateCatch', { pokedexEntry, catchRecord: workingCatchRecord });
	}
</script>

<div
	class="dex-entry bg-primary/90 text-primary-content rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4 mb-4"
>
	<div class="dex-column pokedex-entry-container">
		<div class="flex mb-2">
			<div class="sprite-container flex justify-center items-center bg-white rounded-lg p-2">
				<PokemonSprite
					pokemonName={pokedexEntry.pokemon}
					pokedexNumber={pokedexEntry.pokedexNumber}
					form={pokedexEntry.form}
					shiny={showShiny}
				/>
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
			{#if showForms}
				<p><strong>Box:</strong> {pokedexEntry.boxPlacementForms.box}</p>
				<p><strong>Row:</strong> {pokedexEntry.boxPlacementForms.row}</p>
				<p><strong>Column:</strong> {pokedexEntry.boxPlacementForms.column}</p>
				<p><strong>Can Gigantamax:</strong> {pokedexEntry.canGigantamax ? 'Yes' : 'No'}</p>
			{:else}
				<p><strong>Box:</strong> {pokedexEntry.boxPlacement.box}</p>
				<p><strong>Row:</strong> {pokedexEntry.boxPlacement.row}</p>
				<p><strong>Column:</strong> {pokedexEntry.boxPlacement.column}</p>
			{/if}

			{#if pokedexEntry.evolutionInformation}
				<p><strong>How to evolve: </strong>{pokedexEntry.evolutionInformation}</p>
			{:else}
				<p>
					<strong>How to evolve: </strong>Currently missing - can you
					<a
						href="https://github.com/jcreek/LivingDexTracker"
						class="underline text-primary hover:text-secondary">help contribute</a
					>?
				</p>
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
						bind:checked={workingCatchRecord.caught}
						class="checkbox checkbox-primary border-black"
						on:change={updateCatchRecord}
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
						bind:checked={workingCatchRecord.haveToEvolve}
						class="checkbox checkbox-primary border-black"
						on:change={updateCatchRecord}
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
						bind:checked={workingCatchRecord.inHome}
						class="checkbox checkbox-primary border-black"
						on:change={updateCatchRecord}
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
							bind:checked={workingCatchRecord.hasGigantamaxed}
							class="checkbox checkbox-primary border-black"
							on:change={updateCatchRecord}
						/>
					</label>
				</div>
			</div>
		{/if}
		<p>
			<label class="block font-bold mb-1" for={`personalNotesInput-${catchRecord?._id || pokedexEntry._id}`}
				>Notes:</label
			>
			<textarea
				bind:value={workingCatchRecord.personalNotes}
				id={`personalNotesInput-${catchRecord?._id || pokedexEntry._id}`}
				class="form-textarea w-full p-2 border rounded"
				on:change={updateCatchRecord}
			></textarea>
		</p>
	</div>

	<div class="dex-column additional-details-container">
		{#if showOrigins}
			<div class="bg-white text-black rounded-lg p-4 mb-2">
				<h3 class="text-xl font-semibold mb-4">Origin Dex Requirements</h3>
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
		{#if pokedexEntry.catchInformation.length > 0}
			<div class="bg-white text-black rounded-lg p-4 mb-2">
				<p><strong>Where to catch: </strong></p>
				<ul class="list-disc list-inside">
					{#each pokedexEntry.catchInformation as info}
						<li>
							<ul>
								<li><strong>Game:</strong> {info.game}</li>
								<li><strong>Location:</strong> {info.location}</li>
								<li><strong>Notes:</strong> {info.notes}</li>
							</ul>
						</li>
					{/each}
				</ul>
				<p>
					<strong>Missing a game?</strong> - can you
					<a
						href="https://github.com/jcreek/LivingDexTracker"
						class="underline text-primary hover:text-secondary">help contribute</a
					>?
				</p>
			</div>
		{:else}
			<div class="bg-white text-black rounded-lg p-4 mb-2">
				<p>
					<strong>Where to catch: </strong>Currently missing - can you
					<a
						href="https://github.com/jcreek/LivingDexTracker"
						class="underline text-primary hover:text-secondary">help contribute</a
					>?
				</p>
			</div>
		{/if}
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
