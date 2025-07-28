<script lang="ts">
	import type { MultiRegionalPokedex } from '$lib/models/RegionalPokedex';
	import { createEventDispatcher } from 'svelte';

	export let config: MultiRegionalPokedex;
	export let activeRegion: string;

	const dispatch = createEventDispatcher<{
		regionChange: { regionName: string };
	}>();

	function handleTabClick(regionName: string) {
		if (regionName !== activeRegion) {
			dispatch('regionChange', { regionName });
		}
	}
</script>

<div class="tabs tabs-boxed mb-4 bg-white" role="tablist">
	{#each config.regions as region}
		<button
			class="tab {activeRegion === region.name ? 'tab-active' : ''}"
			class:tab-active={activeRegion === region.name}
			role="tab"
			aria-selected={activeRegion === region.name}
			on:click={() => handleTabClick(region.name)}
		>
			{region.displayName}
		</button>
	{/each}
</div>

<style>
	.tabs {
		justify-content: center;
	}

	.tab {
		@apply text-gray-700 font-medium;
	}

	.tab:hover {
		@apply bg-gray-100;
	}

	.tab-active {
		@apply bg-primary text-primary-content;
	}

	.tab-active:hover {
		@apply bg-primary;
		opacity: 0.9;
	}
</style>
