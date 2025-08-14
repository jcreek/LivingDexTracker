<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';
	import { getSpriteUrl, getRegionalPokedexNumber } from '$lib/utils/sprites';

	export let pokemon: PokemonWithCatchStatus[] = [];
	export let currentPage: number = 1;
	export let totalPages: number = 1;
	export let isShiny: boolean = false;
	export let loading: boolean = false;
	export let regionalColumnName: string | null = null;

	// Action to handle image errors
	function handleImgError(node: HTMLImageElement) {
		const handleError = () => {
			if (!node.src.endsWith('/0.png')) {
				node.src = '/sprites/home/0.png';
			}
		};

		node.addEventListener('error', handleError);

		return {
			destroy() {
				node.removeEventListener('error', handleError);
			}
		};
	}
	export let searchQuery: string = '';
	export let filterStatus: 'all' | 'caught' | 'not_caught' | 'ready_to_evolve' = 'all';

	const dispatch = createEventDispatcher<{
		pageChange: { page: number };
		pokemonClick: { pokemon: PokemonWithCatchStatus };
		searchChange: { query: string };
		filterChange: { filter: 'all' | 'caught' | 'not_caught' | 'ready_to_evolve' };
	}>();

	function handlePokemonClick(pkmn: PokemonWithCatchStatus) {
		dispatch('pokemonClick', { pokemon: pkmn });
	}

	function handleSearchChange(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('searchChange', { query: target.value });
	}

	function handleFilterChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('filterChange', { filter: target.value as any });
	}

	function previousPage() {
		if (currentPage > 1) {
			dispatch('pageChange', { page: currentPage - 1 });
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			dispatch('pageChange', { page: currentPage + 1 });
		}
	}

	function goToPage(page: number) {
		dispatch('pageChange', { page });
	}

	function getStatusBadge(catchStatus: string, isCaught: boolean) {
		if (!isCaught) {
			return { class: 'badge-outline', text: 'Not Caught' };
		}

		switch (catchStatus) {
			case 'ready_to_evolve':
				return { class: 'badge-warning', text: 'Ready to Evolve' };
			case 'caught':
				return { class: 'badge-success', text: 'Caught' };
			default:
				return { class: 'badge-outline', text: 'Not Caught' };
		}
	}

	function getLocationBadge(location: string) {
		switch (location) {
			case 'in_home':
				return 'In HOME';
			case 'in_game':
				return 'In Game';
			default:
				return '';
		}
	}

	// Generate page numbers for pagination
	$: pageNumbers = (() => {
		const pages = [];
		const startPage = Math.max(1, currentPage - 2);
		const endPage = Math.min(totalPages, currentPage + 2);

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		return pages;
	})();
</script>

<div class="bg-base-100 rounded-lg shadow-lg p-6 list-view" data-testid="list-view-container">
	<!-- Search and Filter Header -->
	<div class="flex flex-col sm:flex-row gap-4 mb-6">
		<div class="flex-1">
			<input
				type="text"
				placeholder="Search Pokémon..."
				class="input input-bordered w-full"
				value={searchQuery}
				on:input={handleSearchChange}
				data-testid="pokemon-search-input"
			/>
		</div>

		<div class="flex gap-2">
			<select class="select select-bordered" value={filterStatus} on:change={handleFilterChange} data-testid="pokemon-filter-select">
				<option value="all">All Status</option>
				<option value="caught">Caught</option>
				<option value="not_caught">Not Caught</option>
				<option value="ready_to_evolve">Ready to Evolve</option>
			</select>
		</div>
	</div>

	<!-- Pokemon List -->
	{#if loading}
		<div class="flex items-center justify-center h-96">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if pokemon.length === 0}
		<div class="text-center py-12">
			<p class="text-base-content/70">No Pokémon found matching your criteria.</p>
		</div>
	{:else}
		<div class="space-y-2 table" data-testid="pokemon-list">
			{#each pokemon as pkmn}
				{@const catchRecord = pkmn.catchRecord}
				{@const statusBadge = getStatusBadge(
					catchRecord?.catchStatus || 'not_caught',
					catchRecord?.isCaught || false
				)}
				{@const displayNumber = getRegionalPokedexNumber(pkmn, regionalColumnName)}
				<div
					class="card card-side bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-base-300 hover:border-primary/50 pokemon-item"
					role="button"
					tabindex="0"
					on:click={() => handlePokemonClick(pkmn)}
					on:keydown={(e) => e.key === 'Enter' && handlePokemonClick(pkmn)}
					data-testid="pokemon-list-item"
				>
					<figure class="w-20 h-20 p-2">
						<img
							src={getSpriteUrl(pkmn.pokedexNumber, pkmn.form, isShiny)}
							alt={pkmn.pokemon}
							class="pokemon-sprite"
							use:handleImgError
							loading="lazy"
						/>
					</figure>

					<div class="card-body py-4 px-4 flex-1">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="font-semibold text-lg">
									{pkmn.pokemon}
									{#if pkmn.form && pkmn.form !== 'default'}
										<span class="text-sm text-base-content/70">({pkmn.form})</span>
									{/if}
								</h3>
								<p class="text-sm text-base-content/70">#{displayNumber}</p>
							</div>

							<div class="flex flex-col items-end gap-1">
								<span class="badge {statusBadge.class}">{statusBadge.text}</span>
								{#if catchRecord?.catchLocation && catchRecord.catchLocation !== 'none'}
									<span class="badge badge-outline badge-sm">
										{getLocationBadge(catchRecord.catchLocation)}
									</span>
								{/if}
								{#if catchRecord?.isGigantamax}
									<span class="badge badge-error badge-sm">Gigantamax</span>
								{/if}
							</div>
						</div>

						{#if catchRecord?.notes}
							<p class="text-sm text-base-content/60 mt-1 line-clamp-2">
								{catchRecord.notes}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-center mt-8" data-testid="pagination-controls">
			<div class="join">
				<button
					class="join-item btn btn-sm"
					class:btn-disabled={currentPage <= 1}
					on:click={previousPage}
					disabled={currentPage <= 1}
				>
					«
				</button>

				{#if pageNumbers[0] > 1}
					<button class="join-item btn btn-sm" on:click={() => goToPage(1)}>1</button>
					{#if pageNumbers[0] > 2}
						<button class="join-item btn btn-sm btn-disabled">...</button>
					{/if}
				{/if}

				{#each pageNumbers as pageNum}
					<button
						class="join-item btn btn-sm"
						class:btn-active={pageNum === currentPage}
						on:click={() => goToPage(pageNum)}
					>
						{pageNum}
					</button>
				{/each}

				{#if pageNumbers[pageNumbers.length - 1] < totalPages}
					{#if pageNumbers[pageNumbers.length - 1] < totalPages - 1}
						<button class="join-item btn btn-sm btn-disabled">...</button>
					{/if}
					<button class="join-item btn btn-sm" on:click={() => goToPage(totalPages)}
						>{totalPages}</button
					>
				{/if}

				<button
					class="join-item btn btn-sm"
					class:btn-disabled={currentPage >= totalPages}
					on:click={nextPage}
					disabled={currentPage >= totalPages}
				>
					»
				</button>
			</div>
		</div>

		<div class="text-center text-sm text-base-content/70 mt-2">
			Page {currentPage} of {totalPages}
		</div>
	{/if}
</div>
