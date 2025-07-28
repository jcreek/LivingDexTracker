<script lang="ts">
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { CombinedData } from '$lib/models/CombinedData';
	import type { PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { getRegionalNumber } from '$lib/models/RegionalPokedex';

	export let showShiny = false;
	export let combinedData: CombinedData[] | null;
	export let boxNumbers = Array<number>;
	export let currentPlacement = 'boxPlacementForms';
	export let creatingRecords = false;
	export let totalRecordsCreated = 0;
	export let failedToLoad = false;
	export let markBoxAsNotCaught = (boxNumber: number) => {};
	export let markBoxAsCaught = (boxNumber: number) => {};
	export let markBoxAsNeedsToEvolve = (boxNumber: number) => {};
	export let markBoxAsInHome = (boxNumber: number) => {};
	export let markBoxAsNotInHome = (boxNumber: number) => {};
	export let createCatchRecords = () => {};
	export let regionalPokedexName = 'national';

	// Function to get the appropriate display number
	function getDisplayNumber(pokedexEntry: PokedexEntry): number {
		return regionalPokedexName === 'national'
			? pokedexEntry.pokedexNumber
			: getRegionalNumber(pokedexEntry, regionalPokedexName) || pokedexEntry.pokedexNumber;
	}

	function cellBackgroundColourClass(catchRecord: CatchRecord | null) {
		if (catchRecord?.caught) {
			return 'bg-green-100/50';
		} else if (catchRecord?.haveToEvolve) {
			return 'bg-yellow-100/50';
		} else {
			return '';
		}
	}

	function cellBackgroundColourStyle(pokedexEntry: PokedexEntry, catchRecord: CatchRecord | null) {
		if (catchRecord?.caught || catchRecord?.haveToEvolve) {
			return '';
		} else {
			if (pokedexEntry[currentPlacement].column % 2 === 0) {
				return 'background-color: #ffffff';
			} else {
				return 'background-color: #f9f9f9;';
			}
		}
	}
</script>

<main class="flex-1 p-4 w-full">
	<div class="max-w-fit mx-auto">
		{#if combinedData && combinedData.length > 0}
			<div class="container mx-auto">
				<div class="flex flex-wrap -mx-2">
					{#each boxNumbers as boxNumber}
						<div class="mb-8 md:w-1/2 px-2">
							<h2 class="text-xl font-bold mb-4">Box {boxNumber}</h2>
							<button class="btn" on:click={markBoxAsNotCaught(boxNumber)}>
								Mark box as not 'caught'
							</button>
							<button class="btn" on:click={markBoxAsCaught(boxNumber)}>
								Mark box as 'caught'
							</button>
							<button class="btn" on:click={markBoxAsNeedsToEvolve(boxNumber)}
								>Mark box as 'needs to evolve'</button
							>
							<button class="btn" on:click={markBoxAsInHome(boxNumber)}
								>Mark box as 'in Home'</button
							>
							<button class="btn" on:click={markBoxAsNotInHome(boxNumber)}
								>Mark box as not 'in Home'</button
							>
							<div class="grid grid-cols-6">
								{#each combinedData as { pokedexEntry, catchRecord }}
									{#if pokedexEntry[currentPlacement].box === boxNumber}
										<div
											class="pokemon-box {cellBackgroundColourClass(catchRecord)}"
											style="grid-column-start: {pokedexEntry[currentPlacement]
												.column}; grid-row-start: {pokedexEntry[currentPlacement].row};
                                        {cellBackgroundColourStyle(pokedexEntry, catchRecord)}"
										>
											<Tooltip>
												<div slot="hover-target">
													{#if catchRecord?.inHome}
														<span
															class="absolute -top-5 -right-4 z-2 p-1 text-secondary text-lg font-extrabold"
															>&#10003;</span
														>
													{/if}
													<PokemonSprite
														pokemonName={pokedexEntry.pokemon}
														pokedexNumber={getDisplayNumber(pokedexEntry)}
														form={pokedexEntry.form}
														shiny={showShiny}
													/>
													<span class="md:hidden">&#9432;</span>
												</div>
												<div slot="tooltip">
													<div class="font-bold">
														{pokedexEntry.pokemon}
														{pokedexEntry.form ? `(${pokedexEntry.form})` : ''}
													</div>
													<div>{getDisplayNumber(pokedexEntry).toString().padStart(3, '0')}</div>
													<div>
														Caught: {catchRecord?.caught ? 'Yes' : 'No'} <br />
														Needs to Evolve: {catchRecord?.haveToEvolve ? 'Yes' : 'No'} <br />
														In Home: {catchRecord?.inHome ? 'Yes' : 'No'}
													</div>
												</div>
											</Tooltip>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
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
					If you're seeing this, you probably haven't created your Pokédex data yet. Please do so by
					clicking this button.
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

<style>
	.pokemon-box {
		border: 1px solid #ddd;
		padding: 1rem;
	}
</style>
