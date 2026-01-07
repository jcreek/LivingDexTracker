<script lang="ts">
	import { onMount } from 'svelte';
	import type { Pokedex } from '$lib/models/Pokedex';

	export let pokedex: Partial<Pokedex> = {
		name: '',
		description: '',
		isLivingDex: false,
		isShinyDex: false,
		isOriginDex: false,
		isFormDex: false,
		gameScope: null
	};
	export let mode: 'create' | 'edit' = 'create';
	export let onSubmit: () => void;
	export let onCancel: () => void;

	let games: string[] = [];
	let loadingGames = true;

	// Fetch available games from the database
	onMount(async () => {
		try {
			const response = await fetch('/api/games');
			if (response.ok) {
				const data = await response.json();
				games = data.games || [];
			} else {
				console.error('Failed to fetch games');
			}
		} catch (error) {
			console.error('Error fetching games:', error);
		} finally {
			loadingGames = false;
		}
	});

	// Validation
	$: hasAtLeastOneType =
		pokedex.isLivingDex || pokedex.isShinyDex || pokedex.isOriginDex || pokedex.isFormDex;
	$: canSubmit = pokedex.name && pokedex.name.trim() !== '' && hasAtLeastOneType;

	function handleSubmit() {
		if (canSubmit) {
			onSubmit();
		}
	}
</script>

<div class="form-control w-full">
	<label class="label" for="pokedex-name">
		<span class="label-text">Name</span>
	</label>
	<input
		id="pokedex-name"
		type="text"
		placeholder="My Living Dex"
		class="input input-bordered w-full"
		bind:value={pokedex.name}
		required
	/>
</div>

<div class="form-control w-full">
	<label class="label" for="pokedex-description">
		<span class="label-text">Description (optional)</span>
	</label>
	<textarea
		id="pokedex-description"
		class="textarea textarea-bordered h-24"
		placeholder="Describe your pokédex..."
		bind:value={pokedex.description}
	></textarea>
</div>

<div class="form-control w-full">
	<label class="label">
		<span class="label-text">Type(s)</span>
		<span class="label-text-alt text-error"
			>{!hasAtLeastOneType ? 'At least one type required' : ''}</span
		>
	</label>
	<div class="flex flex-col gap-2">
		<label class="label cursor-pointer justify-start gap-3">
			<input type="checkbox" class="checkbox" bind:checked={pokedex.isLivingDex} />
			<span class="label-text">Living Dex (one of each Pokémon)</span>
		</label>
		<label class="label cursor-pointer justify-start gap-3">
			<input type="checkbox" class="checkbox" bind:checked={pokedex.isShinyDex} />
			<span class="label-text">Shiny Dex (shiny variants only)</span>
		</label>
		<label class="label cursor-pointer justify-start gap-3">
			<input type="checkbox" class="checkbox" bind:checked={pokedex.isOriginDex} />
			<span class="label-text">Origin Dex (caught in native regions)</span>
		</label>
		<label class="label cursor-pointer justify-start gap-3">
			<input type="checkbox" class="checkbox" bind:checked={pokedex.isFormDex} />
			<span class="label-text">Form Dex (all forms included)</span>
		</label>
	</div>
</div>

<div class="form-control w-full">
	<label class="label" for="game-scope">
		<span class="label-text">Game Scope</span>
	</label>
	<select
		id="game-scope"
		class="select select-bordered"
		bind:value={pokedex.gameScope}
		disabled={loadingGames}
	>
		<option value={null}>All Games</option>
		{#if loadingGames}
			<option disabled>Loading games...</option>
		{:else}
			{#each games as game}
				<option value={game}>{game}</option>
			{/each}
		{/if}
	</select>
</div>

<div class="modal-action">
	<button class="btn btn-ghost" type="button" on:click={onCancel}>Cancel</button>
	<button class="btn btn-primary" type="button" on:click={handleSubmit} disabled={!canSubmit}>
		{mode === 'create' ? 'Create' : 'Save'}
	</button>
</div>
