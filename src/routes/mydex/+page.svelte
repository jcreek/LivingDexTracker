<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { UserPokedex, PokemonWithCatchStatus } from '$lib/types';
	import BoxView from '$lib/components/pokedex/BoxView.svelte';
	import ListView from '$lib/components/pokedex/ListView.svelte';
	import { authFetch, handleAuthError, isAuthError } from '$lib/utils/auth';

	export let data: PageData;
	// data is used for type safety and SSR
	
	$: supabase = data.supabase;

	let pokedex: UserPokedex | null = null;
	let allPokemon: (PokemonWithCatchStatus | null)[] = [];
	let listPokemon: PokemonWithCatchStatus[] = [];
	let loading = true;
	let viewMode: 'box' | 'list' = 'box';
	let currentBox = 1;
	let totalBoxes = 1;
	let currentPage = 1;
	let totalPages = 1;
	let searchQuery = '';
	let filterStatus: 'all' | 'caught' | 'not_caught' | 'ready_to_evolve' = 'all';

	$: pokedexId = $page.url.searchParams.get('id');

	onMount(async () => {
		if (!pokedexId) {
			goto('/pokedexes');
			return;
		}

		await loadPokedex();
		await loadData();
	});

	async function loadPokedex() {
		try {
			const response = await authFetch(`/api/pokedexes/${pokedexId}`, {}, supabase);
			const result = await response.json();

			if (response.ok) {
				pokedex = result.pokedex;
			} else if (response.status === 401 || response.status === 403) {
				console.log('Auth error loading pokédex:', result.error);
				await handleAuthError(result.error, supabase);
			} else {
				console.error('Failed to load pokédex:', result.error);
				goto('/pokedexes');
			}
		} catch (error) {
			console.error('Error loading pokédex:', error);
			if (isAuthError(error)) {
				await handleAuthError(error, supabase);
			} else {
				goto('/pokedexes');
			}
		}
	}

	async function loadData() {
		loading = true;

		if (viewMode === 'box') {
			await loadBoxData();
		} else {
			await loadListData();
		}

		loading = false;
	}

	async function loadBoxData() {
		try {
			const response = await authFetch(`/api/combined-data/all?pokedex_id=${pokedexId}`, {}, supabase);
			const result = await response.json();

			if (response.ok) {
				allPokemon = result.pokemon;
				totalBoxes = result.totalBoxes;
			} else if (response.status === 401 || response.status === 403) {
				console.log('Auth error loading box data:', result.error);
				await handleAuthError(result.error, supabase);
			} else {
				console.error('Failed to load box data:', result.error);
			}
		} catch (error) {
			console.error('Error loading box data:', error);
			if (isAuthError(error)) {
				await handleAuthError(error, supabase);
			}
		}
	}

	async function loadListData() {
		try {
			const params = new URLSearchParams({
				pokedex_id: pokedexId!,
				page: currentPage.toString(),
				limit: '20'
			});

			if (searchQuery) params.set('search', searchQuery);
			if (filterStatus !== 'all') params.set('filter', filterStatus);

			const response = await fetch(`/api/combined-data?${params}`);
			const result = await response.json();

			if (response.ok) {
				listPokemon = result.pokemon;
				totalPages = result.pagination.totalPages;
			} else {
				console.error('Failed to load list data:', result.error);
			}
		} catch (error) {
			console.error('Error loading list data:', error);
		}
	}

	async function handleViewModeChange(newMode: 'box' | 'list') {
		viewMode = newMode;
		currentPage = 1;
		searchQuery = '';
		filterStatus = 'all';
		await loadData();
	}

	async function handleBoxChange(event: CustomEvent<{ boxNumber: number }>) {
		currentBox = event.detail.boxNumber;
	}

	async function handlePokemonClick(event: CustomEvent<{ pokemon: PokemonWithCatchStatus }>) {
		const pokemon = event.detail.pokemon;

		// Cycle through catch statuses: not_caught -> caught -> ready_to_evolve -> not_caught
		try {
			let newCaught = false;
			let newHaveToEvolve = false;
			
			const currentCaught = pokemon.catchRecord?.caught || false;
			const currentHaveToEvolve = pokemon.catchRecord?.haveToEvolve || false;
			
			if (!currentCaught && !currentHaveToEvolve) {
				// not_caught -> caught
				newCaught = true;
				newHaveToEvolve = false;
			} else if (currentCaught && !currentHaveToEvolve) {
				// caught -> ready_to_evolve
				newCaught = true;
				newHaveToEvolve = true;
			} else {
				// ready_to_evolve -> not_caught
				newCaught = false;
				newHaveToEvolve = false;
			}

			const response = await authFetch('/api/catch-records', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userPokedexId: pokedexId,
					pokedexEntryId: pokemon.id,
					caught: newCaught,
					haveToEvolve: newHaveToEvolve
				})
			}, supabase);

			if (response.ok) {
				await loadData();
			} else if (response.status === 401 || response.status === 403) {
				const errorData = await response.json();
				console.log('Auth error in handlePokemonClick:', errorData.error);
				await handleAuthError(errorData.error, supabase);
			}
		} catch (error) {
			console.error('Error updating catch status:', error);
			if (isAuthError(error)) {
				await handleAuthError(error, supabase);
			}
		}
	}

	async function handleBulkCatch(event: CustomEvent<{ boxNumber: number }>) {
		const boxNumber = event.detail.boxNumber;
		const startIndex = (boxNumber - 1) * 30;
		const endIndex = startIndex + 30;
		const boxPokemon = allPokemon.slice(startIndex, endIndex).filter((p) => p !== null);

		try {
			const response = await fetch('/api/catch-records/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userPokedexId: pokedexId,
					operation: 'bulk_catch',
					updates: boxPokemon.map((p) => p!.id)
				})
			});

			if (response.ok) {
				await loadData();
			}
		} catch (error) {
			console.error('Error bulk catching:', error);
		}
	}

	async function handleBulkUncatch(event: CustomEvent<{ boxNumber: number }>) {
		const boxNumber = event.detail.boxNumber;
		const startIndex = (boxNumber - 1) * 30;
		const endIndex = startIndex + 30;
		const boxPokemon = allPokemon.slice(startIndex, endIndex).filter((p) => p !== null);

		try {
			const response = await fetch('/api/catch-records/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userPokedexId: pokedexId,
					operation: 'bulk_uncatch',
					updates: boxPokemon.map((p) => p!.id)
				})
			});

			if (response.ok) {
				await loadData();
			}
		} catch (error) {
			console.error('Error bulk uncatching:', error);
		}
	}
	
	async function handlePokemonUpdate(event: CustomEvent) {
		const { pokemon, catchStatus, catchLocation, isGigantamax, originRegion, gameCaught, notes } = event.detail;
		
		try {
			// Map the status to the appropriate fields
			let caught = false;
			let haveToEvolve = false;
			
			if (catchStatus === 'caught') {
				caught = true;
				haveToEvolve = false;
			} else if (catchStatus === 'ready_to_evolve') {
				caught = true;
				haveToEvolve = true;
			}
			
			const response = await authFetch('/api/catch-records', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userPokedexId: pokedexId,
					pokedexEntryId: pokemon.id,
					caught,
					haveToEvolve,
					hasGigantamaxed: isGigantamax,
					personalNotes: notes
				})
			}, supabase);
			
			if (response.ok) {
				await loadData();
			} else {
				console.error('Failed to update pokemon:', await response.text());
			}
		} catch (error) {
			console.error('Error updating pokemon:', error);
		}
	}

	async function handlePageChange(event: CustomEvent<{ page: number }>) {
		currentPage = event.detail.page;
		await loadListData();
	}

	async function handleSearchChange(event: CustomEvent<{ query: string }>) {
		searchQuery = event.detail.query;
		currentPage = 1;
		await loadListData();
	}

	async function handleFilterChange(
		event: CustomEvent<{ filter: 'all' | 'caught' | 'not_caught' | 'ready_to_evolve' }>
	) {
		filterStatus = event.detail.filter;
		currentPage = 1;
		await loadListData();
	}
</script>

<svelte:head>
	<title>{pokedex?.name || 'Pokédex'} - Living Dex Tracker</title>
</svelte:head>

{#if pokedex}
	<!-- Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold mb-2">
				{pokedex.name}
				{#if pokedex.isShiny}
					<span class="badge badge-warning ml-2">✨ Shiny</span>
				{/if}
			</h1>
			<p class="text-base-content/70">
				{pokedex.regionalPokedexInfo?.displayName || 'Custom Pokédex'}
				{#if pokedex.regionalPokedexInfo?.games}
					• {pokedex.regionalPokedexInfo.games.join(', ')}
				{/if}
			</p>
		</div>

		<div class="flex gap-2">
			<a href="/pokedexes" class="btn btn-outline btn-sm"> ← Back to Pokédexes </a>
		</div>
	</div>

	<!-- View Mode Toggle -->
	<div class="flex items-center justify-center mb-8" data-testid="view-mode-toggle">
		<div class="join">
			<button
				class="join-item btn btn-sm"
				class:btn-active={viewMode === 'box'}
				on:click={() => handleViewModeChange('box')}
				disabled={loading}
				data-testid="box-view-button"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-4 h-4 mr-1"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
					/>
				</svg>
				Box View
			</button>
			<button
				class="join-item btn btn-sm"
				class:btn-active={viewMode === 'list'}
				on:click={() => handleViewModeChange('list')}
				disabled={loading}
				data-testid="list-view-button"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-4 h-4 mr-1"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
					/>
				</svg>
				List View
			</button>
		</div>
	</div>

	<!-- Content -->
	{#if viewMode === 'box'}
		<BoxView
			pokemon={allPokemon}
			{currentBox}
			{totalBoxes}
			isShiny={pokedex.isShiny}
			{loading}
			on:boxChange={handleBoxChange}
			on:pokemonClick={handlePokemonClick}
			on:bulkCatch={handleBulkCatch}
			on:bulkUncatch={handleBulkUncatch}
			on:pokemonUpdate={handlePokemonUpdate}
		/>
	{:else}
		<ListView
			pokemon={listPokemon}
			{currentPage}
			{totalPages}
			isShiny={pokedex.isShiny}
			{loading}
			{searchQuery}
			{filterStatus}
			regionalColumnName={pokedex.regionalPokedexInfo?.columnName || null}
			on:pageChange={handlePageChange}
			on:pokemonClick={handlePokemonClick}
			on:searchChange={handleSearchChange}
			on:filterChange={handleFilterChange}
		/>
	{/if}
{:else}
	<div class="flex items-center justify-center h-64">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}
