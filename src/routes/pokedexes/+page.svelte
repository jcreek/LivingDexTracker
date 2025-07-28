<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userPokedexes, loadUserPokedexes } from '$lib/stores/currentPokedexStore';
	import CreatePokedexModal from '$lib/components/CreatePokedexModal.svelte';
	import PokedexCard from '$lib/components/PokedexCard.svelte';
	import type { PageData } from './$types';
	import type { UserPokedex } from '$lib/models/UserPokedex';

	export let data: PageData;

	let showCreateModal = false;
	let isDeleting = false;
	let sortBy: 'name' | 'completion' | 'created' = 'name';
	let sortDirection: 'asc' | 'desc' = 'asc';
	let completionStats: Record<
		string,
		{ caught: number; total: number; readyToEvolve: number } | null
	> = {};
	let loadingStats = false;

	// Initialize the store with data from the server
	$userPokedexes = data.pokedexes;

	function openCreateModal() {
		showCreateModal = true;
	}

	function closeCreateModal() {
		showCreateModal = false;
	}

	async function handleCreatePokedex() {
		closeCreateModal();
		// Reload the pokedexes after creation
		await loadUserPokedexes();
		// Load stats for new pokédxes
		await loadCompletionStats();
	}

	async function loadCompletionStats() {
		if ($userPokedexes.length === 0) return;

		loadingStats = true;
		completionStats = {};

		const statsPromises = $userPokedexes.map(async (pokedex) => {
			try {
				const response = await fetch(`/api/pokedexes/${pokedex.id}/stats`);
				if (response.ok) {
					const stats = await response.json();
					completionStats[pokedex.id] = stats;
				} else {
					completionStats[pokedex.id] = null;
				}
			} catch (error) {
				console.error(`Error loading stats for pokédx ${pokedex.id}:`, error);
				completionStats[pokedex.id] = null;
			}
		});

		await Promise.all(statsPromises);
		completionStats = { ...completionStats }; // Trigger reactivity
		loadingStats = false;
	}

	function getSortedPokedexes(): UserPokedex[] {
		const sorted = [...$userPokedexes].sort((a, b) => {
			let compareValue = 0;

			switch (sortBy) {
				case 'name':
					compareValue = a.name.localeCompare(b.name);
					break;
				case 'completion':
					const aStats = completionStats[a.id];
					const bStats = completionStats[b.id];
					const aPercentage = aStats
						? aStats.total > 0
							? (aStats.caught / aStats.total) * 100
							: 0
						: 0;
					const bPercentage = bStats
						? bStats.total > 0
							? (bStats.caught / bStats.total) * 100
							: 0
						: 0;
					compareValue = aPercentage - bPercentage;
					break;
				case 'created':
					compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}

			return sortDirection === 'asc' ? compareValue : -compareValue;
		});

		return sorted;
	}

	function handleSort(newSortBy: 'name' | 'completion' | 'created') {
		if (sortBy === newSortBy) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = newSortBy;
			sortDirection = 'asc';
		}
	}

	async function handleDeletePokedex(pokedexId: string) {
		if (isDeleting) return;

		if (!confirm('Are you sure you want to delete this pokedex? This action cannot be undone.')) {
			return;
		}

		isDeleting = true;
		try {
			const response = await fetch(`/api/pokedexes/${pokedexId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete pokedex');
			}

			// Reload the pokedexes after deletion
			await loadUserPokedexes();
			await loadCompletionStats();
		} catch (error) {
			console.error('Error deleting pokedex:', error);
			alert(error instanceof Error ? error.message : 'Failed to delete pokedex');
		} finally {
			isDeleting = false;
		}
	}

	function handleSelectPokedex(pokedexId: string) {
		goto(`/mydex?pokedexId=${pokedexId}`);
	}

	// Load completion stats when the page loads
	onMount(async () => {
		if ($userPokedexes.length > 0) {
			await loadCompletionStats();
		}
	});

	// Reactive statement to load stats when pokedexes change
	$: if ($userPokedexes.length > 0 && Object.keys(completionStats).length === 0 && !loadingStats) {
		loadCompletionStats();
	}
</script>

<svelte:head>
	<title>My Pokedexes - Living Dex Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Pokedexes</h1>
			<p class="text-gray-600 dark:text-gray-300">
				Manage your different pokedex challenges and track your progress.
			</p>
		</div>
		<button class="btn btn-primary mt-4 md:mt-0" on:click={openCreateModal} disabled={isDeleting}>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Create New Pokedex
		</button>
	</div>

	{#if $userPokedexes.length === 0}
		<div class="text-center py-12">
			<div class="max-w-md mx-auto">
				<div
					class="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
				>
					<svg
						class="w-12 h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Pokedexes Yet</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-6">
					Create your first pokedex to start tracking your Pokemon collection!
				</p>
				<button class="btn btn-primary" on:click={openCreateModal}>
					Create Your First Pokedex
				</button>
			</div>
		</div>
	{:else}
		<!-- Sorting Controls -->
		<div class="flex flex-wrap items-center justify-between mb-6 gap-4">
			<div class="flex items-center space-x-2">
				<span class="text-sm font-medium text-base-content/70">Sort by:</span>
				<div class="join">
					<button
						class="btn btn-sm join-item {sortBy === 'name' ? 'btn-active' : 'btn-outline'}"
						on:click={() => handleSort('name')}
					>
						Name
						{#if sortBy === 'name'}
							<span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</button>
					<button
						class="btn btn-sm join-item {sortBy === 'completion' ? 'btn-active' : 'btn-outline'}"
						on:click={() => handleSort('completion')}
					>
						Completion
						{#if sortBy === 'completion'}
							<span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</button>
					<button
						class="btn btn-sm join-item {sortBy === 'created' ? 'btn-active' : 'btn-outline'}"
						on:click={() => handleSort('created')}
					>
						Created
						{#if sortBy === 'created'}
							<span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</button>
				</div>
			</div>

			{#if loadingStats}
				<div class="flex items-center space-x-2 text-sm text-base-content/60">
					<span class="loading loading-spinner loading-sm"></span>
					<span>Loading statistics...</span>
				</div>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each getSortedPokedexes() as pokedex (pokedex.id)}
				<PokedexCard
					{pokedex}
					canDelete={!isDeleting}
					completionStats={completionStats[pokedex.id]}
					on:select={() => handleSelectPokedex(pokedex.id)}
					on:delete={() => handleDeletePokedex(pokedex.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if showCreateModal}
	<CreatePokedexModal on:close={closeCreateModal} on:created={handleCreatePokedex} />
{/if}
