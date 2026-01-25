<script lang="ts">
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { CatchInformationItem, PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '../PokemonSprite.svelte';
	import { createEventDispatcher } from 'svelte';

	export let pokedexEntry: PokedexEntry;
	export let catchRecord: CatchRecord | null;
	export let showOrigins: boolean;
	export let showForms: boolean;
	export let showShiny: boolean;
	export let userId: string | null = null;
	export let pokedexId: string;

	// Create a default catch record if none exists
	$: if (!catchRecord) {
		catchRecord = {
			_id: '', // Empty string, not temp ID - will be created by server
			userId: userId || '',
			pokemonId: pokedexEntry._id,
			pokedexId: pokedexId,
			haveToEvolve: false,
			caught: false,
			inHome: false,
			hasGigantamaxed: false,
			personalNotes: ''
		};
	}

	const dispatch = createEventDispatcher();

	type UpdateCatchSource = 'toggle' | 'notes' | 'notes-blur';

	const isCatchInformationItem = (
		value: string | CatchInformationItem
	): value is CatchInformationItem => typeof value !== 'string';

	function updateCatchRecord(source: UpdateCatchSource) {
		dispatch('updateCatch', { pokedexEntry, catchRecord, source });
	}

	function onCaughtChange() {
		if (!catchRecord) return;
		// Mutually exclusive with "needs to evolve"
		if (catchRecord.caught) {
			catchRecord.haveToEvolve = false;
		}
		updateCatchRecord('toggle');
	}

	function onNeedsToEvolveChange() {
		if (!catchRecord) return;
		// Mutually exclusive with "caught"
		if (catchRecord.haveToEvolve) {
			catchRecord.caught = false;
		}
		updateCatchRecord('toggle');
	}

</script>

<div
	class="dex-entry bg-primary/90 text-primary-content rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4 mb-4"
>
	<div class="dex-column pokedex-entry-container">
		<div class="flex mb-2">
			<div class="pl-2">
				<h3 class="text-xl font-bold pt-1">{pokedexEntry.pokemon}</h3>
				<sub class="text-primary-content/80"
					>#{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</sub
				>
			</div>
		</div>
		<div class="flex mb-2">
			<div class="sprite-container flex justify-center items-center bg-base-100 rounded-lg p-2">
				<PokemonSprite
					pokemonName={pokedexEntry.pokemon}
					pokedexNumber={pokedexEntry.pokedexNumber}
					form={pokedexEntry.form}
					spriteKey={pokedexEntry.spriteKey}
					shiny={showShiny}
				/>
			</div>
		</div>

		{#if showForms}
			<div class="bg-base-100 text-base-content rounded-lg p-4 mb-2">
				<p><strong>Form:</strong> {pokedexEntry.form ? pokedexEntry.form : '-'}</p>
			</div>
		{/if}

		{#if pokedexEntry.evolutionInformation.trim().length > 0}
			<div class="bg-base-100 text-base-content rounded-lg p-4">
				<p><strong>How to evolve: </strong>{pokedexEntry.evolutionInformation}</p>
			</div>
		{/if}
	</div>

	{#if catchRecord}
		<div
			class="dex-column catch-record-container bg-base-100 text-base-content rounded-lg p-4 mb-4 md:mb-0"
		>
			<div class="flex items-center">
				<div class="form-control">
					<label class="cursor-pointer label">
						<span class="block font-bold mr-2">Caught:</span>
						<input
							type="checkbox"
							bind:checked={catchRecord.caught}
							class="checkbox checkbox-primary"
							on:change={onCaughtChange}
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
							class="checkbox checkbox-primary"
							on:change={onNeedsToEvolveChange}
						/>
					</label>
				</div>
			</div>
			<div class="flex items-center">
				<div class="form-control">
					<label class="cursor-pointer label">
						<span class="block font-bold mr-2">In Home:</span>
						<input
							type="checkbox"
							bind:checked={catchRecord.inHome}
							class="checkbox checkbox-primary"
							on:change={() => updateCatchRecord('toggle')}
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
								class="checkbox checkbox-primary"
								on:change={() => updateCatchRecord('toggle')}
							/>
						</label>
					</div>
				</div>
			{/if}
			<p>
				<label
					class="block font-bold mb-1"
					for={`personalNotesInput-${catchRecord._id || pokedexEntry._id}`}>Notes:</label
				>
				<textarea
					bind:value={catchRecord.personalNotes}
					id={`personalNotesInput-${catchRecord._id || pokedexEntry._id}`}
					class="textarea textarea-bordered w-full"
					style="min-height: 120px;"
					on:input={() => updateCatchRecord('notes')}
					on:change={() => updateCatchRecord('notes-blur')}
				></textarea>
			</p>
		</div>
	{/if}

	<div class="dex-column additional-details-container">
		{#if showOrigins}
			<div class="bg-base-100 text-base-content rounded-lg p-4 mb-2">
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
			<div class="bg-base-100 text-base-content rounded-lg p-4 mb-2">
				<p><strong>Where to catch: </strong></p>
				<ul class="list-disc list-inside">
					{#each pokedexEntry.catchInformation as info}
						<li>
							{#if isCatchInformationItem(info)}
								<ul>
									<li><strong>Game:</strong> {info.game}</li>
									<li><strong>Location:</strong> {info.location}</li>
									<li><strong>Notes:</strong> {info.notes}</li>
								</ul>
							{:else}
								{info}
							{/if}
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
			<div class="bg-base-100 text-base-content rounded-lg p-4 mb-2">
				<p>
					<strong>Where to catch: </strong>Currently missing - can you
					<a
						href="https://github.com/jcreek/LivingDexTracker"
						class="underline text-primary hover:text-secondary">help contribute</a
					>?
				</p>
			</div>
		{/if}
		{#if pokedexEntry.notes}
			<div class="bg-base-100 text-base-content rounded-lg p-4 mb-2">
				<p><strong>Dex Notes:</strong> {pokedexEntry.notes}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.dex-column {
		flex: 1;
		min-width: 250px;
	}

	.sprite-container {
		width: 100%;
		aspect-ratio: 1;
	}
</style>
