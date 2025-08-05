<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { RegionalPokedexInfo } from '$lib/types';

	export let data: PageData;
	// data is used for type safety and SSR

	let regionalPokedexes: RegionalPokedexInfo[] = [];
	let loading = false;
	let creating = false;

	// Form fields
	let name = '';
	let gameScope: 'all_games' | 'specific_generation' = 'all_games';
	let regionalPokedexId: number | null = null;
	let isShiny = false;
	let requiresOrigin = false;
	let includeForms = false;
	let region: string | null = null;
	let games: string[] = [];
	let generation: string | null = null;

	let errors: Record<string, string> = {};

	onMount(async () => {
		await loadRegionalPokedexes();
	});

	async function loadRegionalPokedexes() {
		loading = true;
		try {
			const response = await fetch('/api/regional-pokedexes');
			const result = await response.json();

			if (response.ok) {
				regionalPokedexes = result.pokedexes;
			} else {
				console.error('Failed to load regional pokédexes:', result.error);
			}
		} catch (error) {
			console.error('Error loading regional pokédexes:', error);
		} finally {
			loading = false;
		}
	}

	function handleRegionalPokedexChange() {
		if (regionalPokedexId) {
			const selected = regionalPokedexes.find((p) => p.id === regionalPokedexId);
			if (selected) {
				region = selected.region;
				generation = selected.generation;
				games = selected.games || [];
			}
		} else {
			region = null;
			generation = null;
			games = [];
		}
	}

	function validateForm(): boolean {
		errors = {};

		if (!name.trim()) {
			errors.name = 'Name is required';
		}

		if (gameScope === 'specific_generation' && !regionalPokedexId) {
			errors.regionalPokedexId = 'Please select a regional pokédex';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		creating = true;
		try {
			const response = await fetch('/api/pokedexes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					gameScope,
					regionalPokedexId: gameScope === 'specific_generation' ? regionalPokedexId : null,
					isShiny,
					requiresOrigin,
					includeForms,
					region,
					games,
					generation
				})
			});

			const result = await response.json();

			if (response.ok) {
				goto('/pokedexes');
			} else {
				console.error('Failed to create pokédex:', result.error);
				alert('Failed to create pokédex: ' + result.error);
			}
		} catch (error) {
			console.error('Error creating pokédex:', error);
			alert('Error creating pokédex');
		} finally {
			creating = false;
		}
	}

	$: groupedPokedexes = regionalPokedexes.reduce(
		(groups, pokedex) => {
			const group = pokedex.region || 'Other';
			if (!groups[group]) groups[group] = [];
			groups[group].push(pokedex);
			return groups;
		},
		{} as Record<string, RegionalPokedexInfo[]>
	);
</script>

<svelte:head>
	<title>Create Pokédex - Living Dex Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<a href="/pokedexes" class="btn btn-outline"> ← Back to Pokédexes </a>
		<h1 class="text-3xl font-bold">Create New Pokédex</h1>
	</div>

	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Name -->
				<div class="form-control">
					<label class="label" for="name">
						<span class="label-text">Pokédex Name *</span>
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						class="input input-bordered"
						class:input-error={errors.name}
						placeholder="My Living Dex"
						required
						disabled={creating}
					/>
					{#if errors.name}
						<label class="label">
							<span class="label-text-alt text-error">{errors.name}</span>
						</label>
					{/if}
				</div>

				<!-- Game Scope -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Pokédex Scope</span>
					</label>
					<div class="flex flex-col gap-2">
						<label class="cursor-pointer label justify-start gap-3">
							<input
								type="radio"
								bind:group={gameScope}
								value="all_games"
								class="radio radio-primary"
								disabled={creating}
							/>
							<div>
								<div class="font-medium">National Pokédex (All Games)</div>
								<div class="text-sm text-base-content/70">
									Complete collection across all generations
								</div>
							</div>
						</label>
						<label class="cursor-pointer label justify-start gap-3">
							<input
								type="radio"
								bind:group={gameScope}
								value="specific_generation"
								class="radio radio-primary"
								disabled={creating}
							/>
							<div>
								<div class="font-medium">Regional Pokédex</div>
								<div class="text-sm text-base-content/70">
									Focus on a specific region or generation
								</div>
							</div>
						</label>
					</div>
				</div>

				<!-- Regional Pokédex Selection -->
				{#if gameScope === 'specific_generation'}
					<div class="form-control">
						<label class="label" for="regionalPokedex">
							<span class="label-text">Regional Pokédex *</span>
						</label>
						<select
							id="regionalPokedex"
							bind:value={regionalPokedexId}
							on:change={handleRegionalPokedexChange}
							class="select select-bordered"
							class:select-error={errors.regionalPokedexId}
							required
							disabled={creating || loading}
						>
							<option value={null}>Select a regional pokédex...</option>
							{#each Object.entries(groupedPokedexes) as [regionName, pokedexes]}
								<optgroup label={regionName.charAt(0).toUpperCase() + regionName.slice(1)}>
									{#each pokedexes as pokedex}
										<option value={pokedex.id}>
											{pokedex.displayName}
											{#if pokedex.totalPokemon}
												({pokedex.totalPokemon} Pokémon)
											{/if}
										</option>
									{/each}
								</optgroup>
							{/each}
						</select>
						{#if errors.regionalPokedexId}
							<label class="label">
								<span class="label-text-alt text-error">{errors.regionalPokedexId}</span>
							</label>
						{/if}
					</div>
				{/if}

				<!-- Challenge Options -->
				<div class="divider">Challenge Options</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="cursor-pointer label">
							<span class="label-text">
								<div class="font-medium">Shiny Hunt</div>
								<div class="text-sm text-base-content/70">Track shiny variants</div>
							</span>
							<input
								type="checkbox"
								bind:checked={isShiny}
								class="checkbox checkbox-primary"
								disabled={creating}
							/>
						</label>
					</div>

					<div class="form-control">
						<label class="cursor-pointer label">
							<span class="label-text">
								<div class="font-medium">Origin Required</div>
								<div class="text-sm text-base-content/70">Must be from original region</div>
							</span>
							<input
								type="checkbox"
								bind:checked={requiresOrigin}
								class="checkbox checkbox-primary"
								disabled={creating}
							/>
						</label>
					</div>

					<div class="form-control md:col-span-2">
						<label class="cursor-pointer label">
							<span class="label-text">
								<div class="font-medium">Include Forms</div>
								<div class="text-sm text-base-content/70">
									Track alternate forms and regional variants
								</div>
							</span>
							<input
								type="checkbox"
								bind:checked={includeForms}
								class="checkbox checkbox-primary"
								disabled={creating}
							/>
						</label>
					</div>
				</div>

				<!-- Summary -->
				{#if regionalPokedexId && gameScope === 'specific_generation'}
					{@const selectedPokedex = regionalPokedexes.find((p) => p.id === regionalPokedexId)}
					{#if selectedPokedex}
						<div class="alert alert-info">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="stroke-current shrink-0 w-6 h-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<div>
								<div class="font-semibold">{selectedPokedex.displayName}</div>
								<div class="text-sm">
									{#if selectedPokedex.totalPokemon}
										{selectedPokedex.totalPokemon} Pokémon
									{/if}
									{#if selectedPokedex.games && selectedPokedex.games.length > 0}
										• {selectedPokedex.games.join(', ')}
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/if}

				<!-- Actions -->
				<div class="card-actions justify-end pt-4">
					<a href="/pokedexes" class="btn btn-outline" class:btn-disabled={creating}> Cancel </a>
					<button type="submit" class="btn btn-primary" disabled={creating}>
						{#if creating}
							<span class="loading loading-spinner"></span>
						{/if}
						Create Pokédex
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
