<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { UserPokedex, PokedexStats } from '$lib/types';

	export let data: PageData;
	// data is used for type safety and SSR

	let pokedexes: UserPokedex[] = [];
	let pokedexStats: Map<string, PokedexStats> = new Map();
	let loading = true;
	let creating = false;
	let showCreateModal = false;

	onMount(async () => {
		await loadPokedexes();
	});

	async function loadPokedexes() {
		loading = true;
		try {
			const response = await fetch('/api/pokedexes');
			const result = await response.json();
			
			if (response.ok) {
				pokedexes = result.pokedexes;
				await loadStats();
			} else {
				console.error('Failed to load pokédexes:', result.error);
			}
		} catch (error) {
			console.error('Error loading pokédexes:', error);
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		const statsPromises = pokedexes.map(async (pokedex) => {
			try {
				const response = await fetch(`/api/pokedexes/${pokedex.id}/stats`);
				const result = await response.json();
				
				if (response.ok) {
					pokedexStats.set(pokedex.id, result.stats);
				}
			} catch (error) {
				console.error(`Error loading stats for ${pokedex.id}:`, error);
			}
		});

		await Promise.all(statsPromises);
		pokedexStats = pokedexStats; // Trigger reactivity
	}

	async function deletePokedex(id: string, name: string) {
		if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/pokedexes/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadPokedexes();
			} else {
				const result = await response.json();
				alert('Failed to delete pokédex: ' + result.error);
			}
		} catch (error) {
			console.error('Error deleting pokédex:', error);
			alert('Error deleting pokédex');
		}
	}

	function getRegionDisplayName(pokedex: UserPokedex): string {
		if (pokedex.regionalPokedexInfo) {
			return pokedex.regionalPokedexInfo.displayName;
		}
		return 'Custom Pokédex';
	}

	function getGamesList(pokedex: UserPokedex): string {
		if (pokedex.games && pokedex.games.length > 0) {
			return pokedex.games.join(', ');
		}
		if (pokedex.regionalPokedexInfo?.games) {
			return pokedex.regionalPokedexInfo.games.join(', ');
		}
		return 'All Games';
	}
</script>

<svelte:head>
	<title>My Pokédexes - Living Dex Tracker</title>
</svelte:head>

<div class="flex items-center justify-between mb-8">
	<h1 class="text-3xl font-bold" data-testid="pokedexes-title">My Pokédexes</h1>
	<a href="/pokedexes/create" class="btn btn-primary" data-testid="create-pokedex-button">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
		Create New Pokédex
	</a>
</div>

{#if loading}
	<div class="flex items-center justify-center h-64" data-testid="loading-spinner">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if pokedexes.length === 0}
	<div class="text-center py-16" data-testid="no-pokedexes-message">
		<div class="max-w-md mx-auto">
			<div class="mb-8">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-24 h-24 mx-auto text-base-content/30">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold mb-4">No Pokédexes Yet</h2>
			<p class="text-base-content/70 mb-8">
				Create your first Pokédex to start tracking your collection. Choose from National, 
				Regional, or create a custom tracker for your specific goals.
			</p>
			<a href="/pokedexes/create" class="btn btn-primary btn-lg" data-testid="create-first-pokedex-button">
				Create Your First Pokédex
			</a>
		</div>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="pokedex-grid">
		{#each pokedexes as pokedex}
			{@const stats = pokedexStats.get(pokedex.id)}
			<div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow" data-testid="pokedex-card">
				<div class="card-body">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h3 class="card-title text-lg mb-2">
								{pokedex.name}
								{#if pokedex.isShiny}
									<div class="badge badge-warning badge-sm">✨ Shiny</div>
								{/if}
							</h3>
							<p class="text-sm text-base-content/70 mb-3">
								{getRegionDisplayName(pokedex)}
							</p>
						</div>
						
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-ghost btn-sm" data-testid="pokedex-menu-button">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
								</svg>
							</div>
							<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" data-testid="pokedex-menu">
								<li><a href="/mydex?id={pokedex.id}" data-testid="view-pokedex-link">View Pokédex</a></li>
								<li><a href="/pokedexes/{pokedex.id}/edit" data-testid="edit-pokedex-link">Edit Settings</a></li>
								<li>
									<button class="text-error" on:click={() => deletePokedex(pokedex.id, pokedex.name)} data-testid="delete-pokedex-button">
										Delete
									</button>
								</li>
							</ul>
						</div>
					</div>

					{#if stats}
						<div class="mb-4">
							<div class="flex items-center justify-between text-sm mb-2">
								<span>Progress</span>
								<span class="font-semibold">{stats.caught}/{stats.total} ({stats.percentComplete}%)</span>
							</div>
							<div class="progress progress-success h-2">
								<div 
									class="progress-bar bg-success"
									style="width: {stats.percentComplete}%"
								></div>
							</div>
						</div>

						<div class="stats stats-vertical bg-base-200 text-xs">
							<div class="stat py-2 px-3">
								<div class="stat-title text-xs">Caught</div>
								<div class="stat-value text-sm text-success">{stats.caught}</div>
							</div>
							<div class="stat py-2 px-3">
								<div class="stat-title text-xs">Ready to Evolve</div>
								<div class="stat-value text-sm text-warning">{stats.readyToEvolve}</div>
							</div>
							<div class="stat py-2 px-3">
								<div class="stat-title text-xs">Remaining</div>
								<div class="stat-value text-sm">{stats.total - stats.caught}</div>
							</div>
						</div>
					{:else}
						<div class="skeleton h-20 mb-4"></div>
					{/if}

					<div class="card-actions justify-between mt-4">
						<div class="text-xs text-base-content/60">
							{getGamesList(pokedex)}
						</div>
						<a href="/mydex?id={pokedex.id}" class="btn btn-primary btn-sm" data-testid="open-pokedex-button">
							Open
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.progress {
		background: rgba(0, 0, 0, 0.1);
	}
	
	.progress-bar {
		height: 100%;
		border-radius: inherit;
		transition: width 0.3s ease;
	}
</style>