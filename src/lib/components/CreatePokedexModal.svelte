<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { POKEMON_GENERATIONS } from '$lib/models/UserPokedex';
	import type { CreatePokedexRequest } from '$lib/models/UserPokedex';

	const dispatch = createEventDispatcher();

	// Map generations to their default regional pokédexes
	const generationToRegionalPokedex: Record<string, string> = {
		gen1: 'kanto',
		gen2: 'johto',
		gen3: 'hoenn',
		gen4: 'sinnoh',
		gen5: 'unova',
		gen6: 'kalos-central', // Default to central for Kalos
		gen7: 'alola',
		gen8: 'galar',
		gen9: 'paldea'
	};

	let formData: CreatePokedexRequest = {
		name: '',
		gameScope: 'all_games',
		generation: undefined,
		regionalPokedexName: 'national',
		isShiny: false,
		requireOrigin: false,
		includeForms: false
	};

	let isSubmitting = false;

	async function handleSubmit() {
		if (!formData.name.trim()) return;

		if (formData.gameScope === 'specific_generation' && !formData.generation) {
			alert('Please select a generation');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/pokedexes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const { pokedex } = await response.json();
				dispatch('create', pokedex);
			} else {
				const { error } = await response.json();
				alert(error || 'Failed to create pokédex');
			}
		} catch (error) {
			alert('Failed to create pokédex');
		} finally {
			isSubmitting = false;
		}
	}

	$: if (formData.gameScope === 'specific_generation') {
		formData.requireOrigin = false; // Reset origin when switching to specific generation
		// Set regional pokédex based on generation
		if (formData.generation && generationToRegionalPokedex[formData.generation]) {
			formData.regionalPokedexName = generationToRegionalPokedex[formData.generation];
		}
	} else {
		// Reset to national dex when switching to all games
		formData.regionalPokedexName = 'national';
	}
</script>

<div class="modal modal-open" on:click={() => dispatch('cancel')}>
	<div class="modal-box" on:click|stopPropagation>
		<h3 class="font-bold text-lg mb-4">Create New Pokédex</h3>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<!-- Name Input -->
			<div class="form-control">
				<label class="label" for="name">
					<span class="label-text">Pokédex Name</span>
				</label>
				<input
					id="name"
					type="text"
					class="input input-bordered"
					bind:value={formData.name}
					placeholder="e.g., My Shiny Living Dex"
					required
				/>
			</div>

			<!-- Game Scope -->
			<div class="form-control">
				<label class="label" for="gameScope">
					<span class="label-text">Game Scope</span>
				</label>
				<select id="gameScope" class="select select-bordered" bind:value={formData.gameScope}>
					<option value="all_games">All Games</option>
					<option value="specific_generation">Specific Generation</option>
				</select>
			</div>

			<!-- Generation Selection (conditional) -->
			{#if formData.gameScope === 'specific_generation'}
				<div class="form-control">
					<label class="label" for="generation">
						<span class="label-text">Generation</span>
					</label>
					<select id="generation" class="select select-bordered" bind:value={formData.generation}>
						<option value="">Select Generation</option>
						{#each POKEMON_GENERATIONS as gen}
							<option value={gen.value}>{gen.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Checkboxes -->
			<div class="space-y-2">
				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Shiny Pokémon</span>
						<input type="checkbox" class="checkbox" bind:checked={formData.isShiny} />
					</label>
				</div>

				{#if formData.gameScope === 'all_games'}
					<div class="form-control">
						<label class="label cursor-pointer">
							<span class="label-text">Origin Requirement</span>
							<input type="checkbox" class="checkbox" bind:checked={formData.requireOrigin} />
						</label>
						<div class="label">
							<span class="label-text-alt">Pokémon must be caught in their original regions</span>
						</div>
					</div>
				{/if}

				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Include Forms</span>
						<input type="checkbox" class="checkbox" bind:checked={formData.includeForms} />
					</label>
					<div class="label">
						<span class="label-text-alt">Include regional forms, Mega evolutions, etc.</span>
					</div>
				</div>
			</div>

			<!-- Buttons -->
			<div class="modal-action">
				<button
					type="button"
					class="btn"
					on:click={() => dispatch('cancel')}
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={isSubmitting || !formData.name.trim()}
				>
					{isSubmitting ? 'Creating...' : 'Create Pokédex'}
				</button>
			</div>
		</form>
	</div>
</div>
