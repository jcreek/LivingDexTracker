<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';
	import { getSpriteUrl, getPlaceholderSpriteUrl } from '$lib/utils/sprites';
	import PokemonSlot from './PokemonSlot.svelte';

	export let pokemon: (PokemonWithCatchStatus | null)[] = [];
	export let currentBox: number = 1;
	export let totalBoxes: number = 1;
	export let isShiny: boolean = false;
	export let loading: boolean = false;

	const dispatch = createEventDispatcher<{
		boxChange: { boxNumber: number };
		pokemonClick: { pokemon: PokemonWithCatchStatus };
		bulkCatch: { boxNumber: number };
		bulkUncatch: { boxNumber: number };
	}>();

	// Box View displays exactly 30 Pokémon (6 columns × 5 rows)
	const POKEMON_PER_BOX = 30;
	const COLUMNS = 6;
	const ROWS = 5;

	$: currentBoxPokemon = getCurrentBoxPokemon(pokemon, currentBox);

	function getCurrentBoxPokemon(allPokemon: (PokemonWithCatchStatus | null)[], boxNumber: number): (PokemonWithCatchStatus | null)[] {
		const startIndex = (boxNumber - 1) * POKEMON_PER_BOX;
		const endIndex = startIndex + POKEMON_PER_BOX;
		
		const boxPokemon = allPokemon.slice(startIndex, endIndex);
		
		// Fill remaining slots with null to maintain 30 slots
		while (boxPokemon.length < POKEMON_PER_BOX) {
			boxPokemon.push(null);
		}
		
		return boxPokemon;
	}

	function handlePokemonClick(pokemon: PokemonWithCatchStatus) {
		dispatch('pokemonClick', { pokemon });
	}

	function previousBox() {
		if (currentBox > 1) {
			dispatch('boxChange', { boxNumber: currentBox - 1 });
		}
	}

	function nextBox() {
		if (currentBox < totalBoxes) {
			dispatch('boxChange', { boxNumber: currentBox + 1 });
		}
	}

	function handleBulkCatch() {
		dispatch('bulkCatch', { boxNumber: currentBox });
	}

	function handleBulkUncatch() {
		dispatch('bulkUncatch', { boxNumber: currentBox });
	}

	// Calculate box statistics
	$: boxStats = (() => {
		const validPokemon = currentBoxPokemon.filter(p => p !== null) as PokemonWithCatchStatus[];
		const caughtCount = validPokemon.filter(p => p.catchRecord?.isCaught).length;
		return {
			total: validPokemon.length,
			caught: caughtCount,
			remaining: validPokemon.length - caughtCount
		};
	})();
</script>

<div class="bg-base-100 rounded-lg shadow-lg p-6" data-testid="box-view-container">
	<!-- Box Header -->
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-bold" data-testid="box-title">Box {currentBox} of {totalBoxes}</h2>
		
		<div class="flex gap-2">
			<div class="stats stats-horizontal bg-base-200 text-xs" data-testid="box-stats">
				<div class="stat py-2 px-3">
					<div class="stat-title text-xs">Total</div>
					<div class="stat-value text-sm">{boxStats.total}</div>
				</div>
				<div class="stat py-2 px-3">
					<div class="stat-title text-xs">Caught</div>
					<div class="stat-value text-sm text-success">{boxStats.caught}</div>
				</div>
				<div class="stat py-2 px-3">
					<div class="stat-title text-xs">Remaining</div>
					<div class="stat-value text-sm text-warning">{boxStats.remaining}</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Box Navigation -->
	<div class="flex items-center justify-between mb-6" data-testid="box-navigation">
		<button 
			class="btn btn-sm btn-outline"
			on:click={previousBox}
			disabled={currentBox <= 1 || loading}
			data-testid="previous-box-button"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
			Previous
		</button>

		<div class="join" data-testid="bulk-actions">
			<button 
				class="btn btn-sm join-item btn-success"
				on:click={handleBulkCatch}
				disabled={loading || boxStats.total === 0}
				title="Mark all Pokémon in this box as caught"
				data-testid="catch-all-button"
			>
				Catch All
			</button>
			<button 
				class="btn btn-sm join-item btn-outline"
				on:click={handleBulkUncatch}
				disabled={loading || boxStats.caught === 0}
				title="Mark all Pokémon in this box as not caught"
				data-testid="clear-all-button"
			>
				Clear All
			</button>
		</div>

		<button 
			class="btn btn-sm btn-outline"
			on:click={nextBox}
			disabled={currentBox >= totalBoxes || loading}
			data-testid="next-box-button"
		>
			Next
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
			</svg>
		</button>
	</div>

	<!-- Box Grid -->
	{#if loading}
		<div class="flex items-center justify-center h-96" data-testid="box-loading">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<div class="grid grid-cols-6 gap-2 bg-base-200 p-4 rounded-lg" data-testid="pokemon-grid">
			{#each currentBoxPokemon as pokemon, index}
				<div class="relative aspect-square">
					<PokemonSlot
						{pokemon}
						{isShiny}
						position={index + 1}
						on:click={() => pokemon && handlePokemonClick(pokemon)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Box Information -->
	<div class="mt-4 text-sm text-base-content/70 text-center" data-testid="box-info">
		Showing positions {((currentBox - 1) * POKEMON_PER_BOX) + 1} - {Math.min(currentBox * POKEMON_PER_BOX, pokemon.length)} 
		of {pokemon.filter(p => p !== null).length} total Pokémon
	</div>
</div>