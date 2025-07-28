<script lang="ts">
	import type { CatchRecord, CatchStatus, LocationStatus } from '$lib/models/CatchRecord';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '../PokemonSprite.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getRegionalNumber } from '$lib/models/RegionalPokedex';
	import { showNationalNumbers } from '$lib/stores/currentPokedexStore';

	export let pokedexEntry: PokedexEntry;
	export let catchRecord: CatchRecord | null;
	export let showOrigins: boolean;
	export let showForms: boolean;
	export let showShiny: boolean;
	export let userId: string | null = null;
	export let regionalPokedexName = 'national';

	// Get the appropriate number to display based on toggle
	$: displayNumber = $showNationalNumbers
		? pokedexEntry.pokedexNumber
		: regionalPokedexName === 'national'
			? pokedexEntry.pokedexNumber
			: getRegionalNumber(pokedexEntry, regionalPokedexName) || pokedexEntry.pokedexNumber;

	// Create a default catch record if none exists
	$: if (!catchRecord) {
		catchRecord = {
			_id: '', // Empty string, not temp ID - will be created by server
			userId: userId || '',
			pokedexEntryId: pokedexEntry._id,
			pokedexId: '', // Will be set by the parent component or API
			// Legacy fields
			haveToEvolve: false,
			caught: false,
			inHome: false,
			hasGigantamaxed: false,
			// Enhanced fields
			catchStatus: 'not_caught',
			locationStatus: 'none',
			personalNotes: ''
		};
	}

	// Sync enhanced status with legacy fields for backward compatibility
	$: if (catchRecord) {
		// Sync catch status
		if (catchRecord.catchStatus === 'caught' && !catchRecord.caught) {
			catchRecord.caught = true;
			catchRecord.haveToEvolve = false;
		} else if (catchRecord.catchStatus === 'ready_to_evolve' && !catchRecord.haveToEvolve) {
			catchRecord.haveToEvolve = true;
			catchRecord.caught = false;
		} else if (catchRecord.catchStatus === 'not_caught') {
			catchRecord.caught = false;
			catchRecord.haveToEvolve = false;
		}

		// Sync location status
		if (catchRecord.locationStatus === 'in_home' && !catchRecord.inHome) {
			catchRecord.inHome = true;
		} else if (catchRecord.locationStatus !== 'in_home' && catchRecord.inHome) {
			catchRecord.inHome = false;
		}
	}

	const dispatch = createEventDispatcher();

	function updateCatchRecord() {
		dispatch('updateCatch', { pokedexEntry, catchRecord });
	}

	function handleCatchStatusChange(newStatus: CatchStatus) {
		if (catchRecord) {
			catchRecord.catchStatus = newStatus;
			updateCatchRecord();
		}
	}

	function handleLocationStatusChange(newStatus: LocationStatus) {
		if (catchRecord) {
			catchRecord.locationStatus = newStatus;
			updateCatchRecord();
		}
	}

	// Simple evolution detection helper (could be expanded with full evolution chains)
	function isReadyToEvolve(pokemon: PokedexEntry): boolean {
		// Basic evolution detection based on evolution information
		// This is a simple implementation that could be enhanced later
		if (!pokemon.evolutionInformation) return false;

		// Check if evolution info contains common evolution triggers
		const evolutionInfo = pokemon.evolutionInformation.toLowerCase();
		return (
			evolutionInfo.includes('level') ||
			evolutionInfo.includes('stone') ||
			evolutionInfo.includes('trade') ||
			evolutionInfo.includes('friendship')
		);
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
					pokedexNumber={displayNumber}
					form={pokedexEntry.form}
					shiny={showShiny}
				/>
			</div>
			<div class="pl-2">
				<h3 class="text-xl font-bold pt-1 text-secondary">{pokedexEntry.pokemon}</h3>
				<sub class="text-gray-200">#{displayNumber.toString().padStart(3, '0')}</sub>
				{#if !$showNationalNumbers && regionalPokedexName !== 'national'}
					{@const regionalNum = getRegionalNumber(pokedexEntry, regionalPokedexName)}
					{#if regionalNum && regionalNum !== pokedexEntry.pokedexNumber}
						<sub class="text-gray-300 block text-xs"
							>National: #{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</sub
						>
					{/if}
				{:else if $showNationalNumbers && regionalPokedexName !== 'national'}
					{@const regionalNum = getRegionalNumber(pokedexEntry, regionalPokedexName)}
					{#if regionalNum}
						<sub class="text-gray-300 block text-xs"
							>{regionalPokedexName}: #{regionalNum.toString().padStart(3, '0')}</sub
						>
					{/if}
				{/if}
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
		<!-- Enhanced Catch Status -->
		<div class="mb-4">
			<h4 class="font-bold mb-2">Catch Status:</h4>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">Not Caught</span>
					<input
						type="radio"
						name="catch-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-primary"
						checked={catchRecord?.catchStatus === 'not_caught'}
						on:change={() => handleCatchStatusChange('not_caught')}
					/>
				</label>
			</div>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">
						Ready to Evolve
						{#if isReadyToEvolve(pokedexEntry)}
							<span class="text-xs text-green-600 font-semibold">(Can evolve!)</span>
						{/if}
					</span>
					<input
						type="radio"
						name="catch-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-primary"
						checked={catchRecord?.catchStatus === 'ready_to_evolve'}
						on:change={() => handleCatchStatusChange('ready_to_evolve')}
					/>
				</label>
			</div>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">Caught</span>
					<input
						type="radio"
						name="catch-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-primary"
						checked={catchRecord?.catchStatus === 'caught'}
						on:change={() => handleCatchStatusChange('caught')}
					/>
				</label>
			</div>
		</div>

		<!-- Enhanced Location Status -->
		<div class="mb-4">
			<h4 class="font-bold mb-2">Location:</h4>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">None</span>
					<input
						type="radio"
						name="location-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-secondary"
						checked={catchRecord?.locationStatus === 'none'}
						on:change={() => handleLocationStatusChange('none')}
					/>
				</label>
			</div>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">In Game</span>
					<input
						type="radio"
						name="location-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-secondary"
						checked={catchRecord?.locationStatus === 'in_game'}
						on:change={() => handleLocationStatusChange('in_game')}
					/>
				</label>
			</div>
			<div class="form-control">
				<label class="cursor-pointer label">
					<span class="label-text">In HOME</span>
					<input
						type="radio"
						name="location-status-{catchRecord?._id || pokedexEntry._id}"
						class="radio radio-secondary"
						checked={catchRecord?.locationStatus === 'in_home'}
						on:change={() => handleLocationStatusChange('in_home')}
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
							bind:checked={catchRecord?.hasGigantamaxed}
							class="checkbox checkbox-primary border-black"
							on:change={updateCatchRecord}
						/>
					</label>
				</div>
			</div>
		{/if}
		<p>
			<label
				class="block font-bold mb-1"
				for={`personalNotesInput-${catchRecord?._id || pokedexEntry._id}`}>Notes:</label
			>
			<textarea
				bind:value={catchRecord?.personalNotes}
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
