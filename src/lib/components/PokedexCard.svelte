<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { UserPokedex } from '$lib/models/UserPokedex';
	import { getMultiRegionalConfig } from '$lib/models/RegionalPokedex';

	export let pokedex: UserPokedex;
	export let canDelete: boolean = true;
	export let completionStats: {
		caught: number;
		total: number;
		readyToEvolve: number;
	} | null = null;

	const dispatch = createEventDispatcher();

	function handleDelete() {
		dispatch('delete', pokedex.id);
	}

	function handleSelect() {
		dispatch('select', pokedex.id);
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

	function getRegionDisplayName(regionalPokedexName: string | undefined): string {
		if (!regionalPokedexName) return 'National Dex';
		
		const regionMap: Record<string, string> = {
			national: 'National Dex',
			kanto: 'Kanto',
			johto: 'Johto',
			hoenn: 'Hoenn',
			sinnoh: 'Sinnoh',
			'sinnoh-extended': 'Sinnoh (Extended)',
			unova: 'Unova',
			'unova-updated': 'Unova (Updated)',
			'kalos-central': 'Kalos Central',
			'kalos-coastal': 'Kalos Coastal',
			'kalos-mountain': 'Kalos Mountain',
			'hoenn-updated': 'Hoenn (Updated)',
			alola: 'Alola',
			'alola-updated': 'Alola (Updated)',
			melemele: 'Melemele',
			akala: 'Akala',
			ulaula: 'Ulaula',
			poni: 'Poni',
			galar: 'Galar',
			'isle-armor': 'Isle of Armor',
			'crown-tundra': 'Crown Tundra',
			hisui: 'Hisui',
			paldea: 'Paldea',
			kitakami: 'Kitakami',
			blueberry: 'Blueberry Academy'
		};
		return regionMap[regionalPokedexName] || regionalPokedexName;
	}

	function getCompletionPercentage(): number {
		if (!completionStats || completionStats.total === 0) return 0;
		return Math.round((completionStats.caught / completionStats.total) * 100);
	}

	function isMultiRegional(): boolean {
		if (!pokedex.regionalPokedexName) return false;
		return getMultiRegionalConfig(pokedex.regionalPokedexName) !== null;
	}
</script>

<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-200">
	<div class="card-body">
		<!-- Header with name and region -->
		<div class="flex items-start justify-between mb-2">
			<div>
				<h2 class="card-title text-lg">{pokedex.name}</h2>
				<div class="flex items-center gap-2 mt-1">
					<span class="badge badge-primary badge-sm">
						{getRegionDisplayName(pokedex.regionalPokedexName)}
					</span>
					{#if isMultiRegional()}
						<span class="badge badge-secondary badge-sm">Multi-Region</span>
					{/if}
				</div>
			</div>

			<!-- Completion percentage -->
			{#if completionStats}
				<div class="text-right">
					<div class="text-2xl font-bold text-primary">{getCompletionPercentage()}%</div>
					<div class="text-xs text-base-content/60">Complete</div>
				</div>
			{/if}
		</div>

		<!-- Challenge type description -->
		<p class="text-sm text-base-content/70 mb-3">{getPokedexTypeDescription(pokedex)}</p>

		<!-- Progress bar and stats -->
		{#if completionStats}
			<div class="space-y-2 mb-4">
				<div class="flex justify-between text-sm">
					<span>Progress</span>
					<span>{completionStats.caught}/{completionStats.total} caught</span>
				</div>
				<progress
					class="progress progress-primary w-full"
					value={completionStats.caught}
					max={completionStats.total}
				></progress>

				{#if completionStats.readyToEvolve > 0}
					<div class="flex items-center gap-2 text-sm text-warning">
						<span>⚡</span>
						<span>{completionStats.readyToEvolve} ready to evolve</span>
					</div>
				{/if}
			</div>
		{:else}
			<div class="space-y-2 mb-4">
				<div class="skeleton h-2 w-full"></div>
				<div class="text-sm text-base-content/50">Loading stats...</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="card-actions justify-end">
			<button class="btn btn-primary btn-sm" on:click={handleSelect}>
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
				Open
			</button>
			{#if canDelete}
				<button class="btn btn-error btn-sm btn-outline" on:click={handleDelete}>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>
