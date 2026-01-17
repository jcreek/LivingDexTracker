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
		gameScope: null,
		dexScopes: []
	};
	export let mode: 'create' | 'edit' = 'create';
	export let onSubmit: () => void;
	export let onCancel: () => void;

	type GameDex = {
		id: string;
		displayName: string;
		sortOrder: number;
		isDlc: boolean;
		parentDexId: string | null;
	};
	type GameSummary = {
		displayName: string;
		releaseYear: number;
	};

	let gameDexes: Record<string, GameDex[]> = {};
	let gameOrder: string[] = [];
	let gameList: GameSummary[] = [];
	let availableDexes: GameDex[] = [];
	let loadingDexes = true;
	let lastGameScope: string | null = null;
	let dexScopesInitialized = false;
	let hasSeenGameScope = false;

	// Fetch available game dexes from the database
	onMount(async () => {
		try {
			const response = await fetch('/api/game-dexes');
			if (response.ok) {
				const data = await response.json();
				gameDexes = data.gameDexes || {};
				gameOrder = data.gameOrder || Object.keys(gameDexes);
				gameList = data.games || [];
			} else {
				console.error('Failed to fetch game dexes');
			}
		} catch (error) {
			console.error('Error fetching game dexes:', error);
		} finally {
			loadingDexes = false;
		}
	});

	// Validation
	$: hasAtLeastOneType =
		pokedex.isLivingDex || pokedex.isShinyDex || pokedex.isOriginDex || pokedex.isFormDex;
	$: hasDexScope =
		!pokedex.gameScope || (pokedex.dexScopes && pokedex.dexScopes.length > 0);
	$: canSubmit =
		pokedex.name && pokedex.name.trim() !== '' && hasAtLeastOneType && hasDexScope;

	$: if (pokedex.gameScope !== lastGameScope) {
		const shouldResetDexes = mode === 'create' || hasSeenGameScope;
		lastGameScope = pokedex.gameScope || null;
		dexScopesInitialized = false;
		if (shouldResetDexes) {
			pokedex.dexScopes = [];
		}
		if (!pokedex.gameScope) {
			availableDexes = [];
		}
		hasSeenGameScope = true;
	}

	$: if (!loadingDexes && pokedex.gameScope) {
		availableDexes = gameDexes[pokedex.gameScope] || [];
		if (!dexScopesInitialized) {
			if (!pokedex.dexScopes || pokedex.dexScopes.length === 0) {
				pokedex.dexScopes = availableDexes.map((dex) => dex.id);
			}
			dexScopesInitialized = true;
		}
	}

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
	<fieldset class="w-full">
		<legend class="label">
			<span class="label-text">Type(s)</span>
			<span class="label-text-alt text-error"
				>{!hasAtLeastOneType ? 'At least one type required' : ''}</span
			>
		</legend>
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
	</fieldset>
</div>

<div class="form-control w-full">
	<label class="label" for="game-scope">
		<span class="label-text">Game Scope</span>
	</label>
	<select
		id="game-scope"
		class="select select-bordered"
		bind:value={pokedex.gameScope}
		disabled={loadingDexes}
	>
		<option value={null}>All Games</option>
		{#if loadingDexes}
			<option disabled>Loading games...</option>
		{:else}
			{#if gameList.length > 0}
				{#each gameList as game}
					<option value={game.displayName}>{game.displayName}</option>
				{/each}
			{:else}
				{#each gameOrder.length > 0 ? gameOrder : Object.keys(gameDexes) as game}
					<option value={game}>{game}</option>
				{/each}
			{/if}
		{/if}
	</select>
</div>

{#if pokedex.gameScope}
	<div class="form-control w-full">
		<fieldset class="w-full">
			<legend class="label">
				<span class="label-text">Dex Scope</span>
				<span class="label-text-alt text-error">{!hasDexScope ? 'Select at least one dex' : ''}</span>
			</legend>
			{#if availableDexes.length === 0}
				<p class="text-sm text-error">No dexes found for this game.</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each availableDexes as dex}
						<label class="label cursor-pointer justify-start gap-3">
							<input
								type="checkbox"
								class="checkbox"
								value={dex.id}
								bind:group={pokedex.dexScopes}
							/>
							<span class="label-text">{dex.displayName}</span>
						</label>
					{/each}
				</div>
			{/if}
		</fieldset>
	</div>
{/if}

<div class="modal-action">
	<button class="btn btn-ghost" type="button" on:click={onCancel}>Cancel</button>
	<button class="btn btn-primary" type="button" on:click={handleSubmit} disabled={!canSubmit}>
		{mode === 'create' ? 'Create' : 'Save'}
	</button>
</div>
