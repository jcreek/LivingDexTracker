<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { UserPokedex, PokedexStats } from '$lib/types';

	export let data: PageData;
	// data is used for type safety and SSR

	let pokedexes: UserPokedex[] = [];
	let totalStats = {
		totalPokedexes: 0,
		totalPokemon: 0,
		totalCaught: 0,
		overallPercentage: 0
	};
	let loading = true;

	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		loading = true;
		try {
			const response = await fetch('/api/pokedexes');
			const result = await response.json();
			
			if (response.ok) {
				pokedexes = result.pokedexes;
				await calculateTotalStats();
			} else {
				console.error('Failed to load pokédexes:', result.error);
			}
		} catch (error) {
			console.error('Error loading profile:', error);
		} finally {
			loading = false;
		}
	}

	async function calculateTotalStats() {
		let totalPokemon = 0;
		let totalCaught = 0;

		const statsPromises = pokedexes.map(async (pokedex) => {
			try {
				const response = await fetch(`/api/pokedexes/${pokedex.id}/stats`);
				const result = await response.json();
				
				if (response.ok) {
					totalPokemon += result.stats.total;
					totalCaught += result.stats.caught;
				}
			} catch (error) {
				console.error(`Error loading stats for ${pokedex.id}:`, error);
			}
		});

		await Promise.all(statsPromises);

		totalStats = {
			totalPokedexes: pokedexes.length,
			totalPokemon,
			totalCaught,
			overallPercentage: totalPokemon > 0 ? Math.round((totalCaught / totalPokemon) * 100) : 0
		};
	}
</script>

<svelte:head>
	<title>Profile - Living Dex Tracker</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-bold mb-4">Profile</h1>
	<p class="text-base-content/70">Manage your account and view your collection statistics</p>
</div>

{#if loading}
	<div class="flex items-center justify-center h-64">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else}
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- User Info -->
		<div class="lg:col-span-1">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title">Account Information</h2>
					
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-base-content/70">Email</label>
							<p class="text-lg">{data.session?.user?.email || 'Not available'}</p>
						</div>
						
						<div>
							<label class="text-sm font-medium text-base-content/70">Member Since</label>
							<p class="text-lg">
								{#if data.session?.user?.created_at}
									{new Date(data.session.user.created_at).toLocaleDateString()}
								{:else}
									Not available
								{/if}
							</p>
						</div>
					</div>

					<div class="card-actions justify-end mt-6">
						<form method="POST" action="/auth/signout">
							<button type="submit" class="btn btn-outline btn-error">
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- Collection Stats -->
		<div class="lg:col-span-2">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title">Collection Statistics</h2>
					
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						<div class="stat bg-base-200 rounded-lg">
							<div class="stat-title text-xs">Pokédexes</div>
							<div class="stat-value text-2xl text-primary">{totalStats.totalPokedexes}</div>
						</div>
						
						<div class="stat bg-base-200 rounded-lg">
							<div class="stat-title text-xs">Total Pokémon</div>
							<div class="stat-value text-2xl">{totalStats.totalPokemon}</div>
						</div>
						
						<div class="stat bg-base-200 rounded-lg">
							<div class="stat-title text-xs">Caught</div>
							<div class="stat-value text-2xl text-success">{totalStats.totalCaught}</div>
						</div>
						
						<div class="stat bg-base-200 rounded-lg">
							<div class="stat-title text-xs">Overall Progress</div>
							<div class="stat-value text-2xl text-accent">{totalStats.overallPercentage}%</div>
						</div>
					</div>

					<div class="mb-4">
						<div class="flex items-center justify-between text-sm mb-2">
							<span>Overall Progress</span>
							<span class="font-semibold">{totalStats.totalCaught}/{totalStats.totalPokemon}</span>
						</div>
						<div class="progress progress-accent h-3">
							<div 
								class="progress-bar bg-accent"
								style="width: {totalStats.overallPercentage}%"
							></div>
						</div>
					</div>

					<div class="card-actions justify-between">
						<div class="text-sm text-base-content/70">
							{#if totalStats.totalPokedexes === 0}
								No pokédexes created yet. <a href="/pokedexes/create" class="link link-primary">Create your first one!</a>
							{:else if totalStats.overallPercentage === 100}
								🎉 Congratulations! You've completed all your pokédexes!
							{:else}
								Keep going! You're making great progress on your Living Dex collection.
							{/if}
						</div>
						<a href="/pokedexes" class="btn btn-primary">
							View Pokédexes
						</a>
					</div>
				</div>
			</div>

			<!-- Recent Activity / Tips -->
			<div class="card bg-base-100 shadow-lg mt-6">
				<div class="card-body">
					<h2 class="card-title">Tips & Features</h2>
					
					<div class="space-y-4">
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
								</svg>
							</div>
							<div>
								<h4 class="font-semibold">Box View</h4>
								<p class="text-sm text-base-content/70">Use Box View to see exactly where each Pokémon belongs in your PC, with 30 slots per box just like in the games.</p>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="flex-shrink-0 w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-warning">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
								</svg>
							</div>
							<div>
								<h4 class="font-semibold">Shiny Hunting</h4>
								<p class="text-sm text-base-content/70">Create dedicated shiny pokédexes to track your shiny collection separately from your regular Living Dex.</p>
							</div>
						</div>

						<div class="flex gap-3">
							<div class="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-success">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
								</svg>
							</div>
							<div>
								<h4 class="font-semibold">Bulk Operations</h4>
								<p class="text-sm text-base-content/70">Use bulk catch/uncatch operations in Box View to quickly update entire boxes when transferring Pokémon.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
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