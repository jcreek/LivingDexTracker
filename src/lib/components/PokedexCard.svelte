<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { UserPokedex } from '$lib/models/UserPokedex';

	export let pokedex: UserPokedex;
	export let canDelete: boolean = true;

	const dispatch = createEventDispatcher();

	function handleDelete() {
		if (
			confirm(`Are you sure you want to delete "${pokedex.name}"? This action cannot be undone.`)
		) {
			dispatch('delete', pokedex.id);
		}
	}

	function getPokedexTypeDescription(pokedex: UserPokedex): string {
		const parts = [];

		if (pokedex.gameScope === 'all_games') {
			parts.push('All Games');
		} else {
			parts.push(pokedex.generation?.toUpperCase() || 'Specific Generation');
		}

		if (pokedex.isShiny) parts.push('Shiny');
		if (pokedex.requireOrigin) parts.push('Origin');
		if (pokedex.includeForms) parts.push('Forms');

		return parts.join(' • ');
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{pokedex.name}</h2>
		<p class="text-sm text-base-content/70">{getPokedexTypeDescription(pokedex)}</p>

		<div class="card-actions justify-end mt-4">
			<button class="btn btn-primary btn-sm"> Select </button>
			{#if canDelete}
				<button class="btn btn-error btn-sm" on:click={handleDelete}> Delete </button>
			{/if}
		</div>
	</div>
</div>
