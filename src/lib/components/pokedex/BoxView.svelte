<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';
	import { getSpriteUrl, getPlaceholderSpriteUrl } from '$lib/utils/sprites';
	import PokemonSlot from './PokemonSlot.svelte';
	import CatchManagementModal from './CatchManagementModal.svelte';

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
		pokemonUpdate: {
			pokemon: PokemonWithCatchStatus;
			catchStatus: string;
			catchLocation: string;
			isGigantamax: boolean;
			originRegion: string;
			gameCaught: string;
			notes: string;
		};
	}>();

	let modalOpen = false;
	let selectedPokemon: PokemonWithCatchStatus | null = null;

	// Box View displays exactly 30 Pokémon (6 columns × 5 rows)
	const POKEMON_PER_BOX = 30;
	const COLUMNS = 6;
	const ROWS = 5;

	$: currentBoxPokemon = getCurrentBoxPokemon(pokemon, currentBox);

	function getCurrentBoxPokemon(
		allPokemon: (PokemonWithCatchStatus | null)[],
		boxNumber: number
	): (PokemonWithCatchStatus | null)[] {
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

	function handlePokemonRightClick(pokemon: PokemonWithCatchStatus) {
		selectedPokemon = pokemon;
		modalOpen = true;
	}

	function handleModalSave(event: CustomEvent) {
		dispatch('pokemonUpdate', event.detail);
		modalOpen = false;
		selectedPokemon = null;
	}

	function handleModalClose() {
		modalOpen = false;
		selectedPokemon = null;
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

	// For testing purposes, add selection functionality
	let selectedSlots = new Set<number>();

	function toggleSlotSelection(index: number) {
		if (selectedSlots.has(index)) {
			selectedSlots.delete(index);
		} else {
			selectedSlots.add(index);
		}
		selectedSlots = selectedSlots; // Trigger reactivity
	}

	function selectAllInBox() {
		for (let i = 0; i < POKEMON_PER_BOX; i++) {
			if (currentBoxPokemon[i] !== null) {
				selectedSlots.add(i);
			}
		}
		selectedSlots = selectedSlots;
	}

	$: hasSelection = selectedSlots.size > 0;

	// Calculate box statistics
	$: boxStats = (() => {
		const validPokemon = currentBoxPokemon.filter((p) => p !== null) as PokemonWithCatchStatus[];
		const caughtCount = validPokemon.filter((p) => p.catchRecord?.caught).length;
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

	<!-- Instructions and Status Legend -->
	<div class="mb-6 bg-base-200 rounded-lg p-4">
		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Instructions -->
			<div class="flex-1">
				<h3 class="font-semibold text-sm mb-2 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
					</svg>
					How to Use
				</h3>
				<ul class="text-sm text-base-content/80 space-y-1">
					<li>• <strong>Left-click</strong> any Pokémon to quickly toggle caught status</li>
					<li>• <strong>Right-click</strong> for detailed catch information and notes</li>
					<li>• Use bulk actions above to mark entire boxes at once</li>
				</ul>
			</div>

			<!-- Status Legend -->
			<div class="flex-1">
				<h3 class="font-semibold text-sm mb-2 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
					</svg>
					Status Legend
				</h3>
				<div class="flex flex-wrap gap-3 text-sm">
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 bg-base-300 rounded border-2 border-base-content/20"></div>
						<span>Not Caught</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 bg-success/20 rounded border-2 border-success"></div>
						<span>Caught</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 bg-warning/20 rounded border-2 border-warning"></div>
						<span>Ready to Evolve</span>
					</div>
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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-4 h-4"
			>
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
				Mark as Caught
			</button>
			<button
				class="btn btn-sm join-item btn-warning"
				on:click={() => {}}
				disabled={loading || boxStats.total === 0}
				title="Mark all Pokémon in this box as ready to evolve"
				data-testid="ready-to-evolve-button"
			>
				Mark as Ready to Evolve
			</button>
			<button
				class="btn btn-sm join-item btn-outline"
				on:click={handleBulkUncatch}
				disabled={loading || boxStats.caught === 0}
				title="Mark all Pokémon in this box as not caught"
				data-testid="clear-all-button"
			>
				Mark as Uncaught
			</button>
		</div>

		<button
			class="btn btn-sm btn-outline"
			on:click={nextBox}
			disabled={currentBox >= totalBoxes || loading}
			data-testid="next-box-button"
		>
			Next
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-4 h-4"
			>
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
						on:rightclick={() => pokemon && handlePokemonRightClick(pokemon)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Box Information -->
	<div class="mt-4 text-sm text-base-content/70 text-center" data-testid="box-info">
		Showing positions {(currentBox - 1) * POKEMON_PER_BOX + 1} - {Math.min(
			currentBox * POKEMON_PER_BOX,
			pokemon.length
		)}
		of {pokemon.filter((p) => p !== null).length} total Pokémon
	</div>
</div>

<!-- Catch Management Modal -->
<CatchManagementModal
	pokemon={selectedPokemon}
	isOpen={modalOpen}
	{isShiny}
	on:save={handleModalSave}
	on:close={handleModalClose}
/>
