<script lang="ts">
	import type { Pokedex } from '$lib/models/Pokedex';

	export let pokedex: Pokedex;
	export let onEdit: () => void;
	export let onDelete: () => void;
	export let onView: () => void;

	// Get active type badges
	$: typeBadges = [
		pokedex.isLivingDex && 'Living',
		pokedex.isShinyDex && 'Shiny',
		pokedex.isOriginDex && 'Origin',
		pokedex.isFormDex && 'Form'
	].filter(Boolean);
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">
			{pokedex.name}
		</h2>

		{#if pokedex.description}
			<p class="text-sm">{pokedex.description}</p>
		{/if}

		<div class="flex flex-wrap gap-2 my-2">
			{#each typeBadges as badge}
				<span class="badge badge-primary">{badge}</span>
			{/each}
		</div>

		{#if pokedex.gameScope}
			<div class="text-sm text-base-content/70">
				<span class="font-semibold">Game:</span>
				{pokedex.gameScope}
			</div>
			{#if pokedex.dexScopes?.length}
				<div class="text-sm text-base-content/70">
					<span class="font-semibold">Dexes:</span>
					{pokedex.dexScopes.length}
				</div>
			{/if}
		{:else}
			<div class="text-sm text-base-content/70">
				<span class="font-semibold">Scope:</span> All Games
			</div>
		{/if}

		<div class="card-actions justify-end mt-4">
			<button class="btn btn-sm btn-ghost" on:click={onEdit}>Edit</button>
			<button class="btn btn-sm btn-error btn-outline" on:click={onDelete}>Delete</button>
			<button class="btn btn-sm btn-primary" on:click={onView}>View</button>
		</div>
	</div>
</div>
