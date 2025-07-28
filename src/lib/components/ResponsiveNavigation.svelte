<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import { showNationalNumbers } from '$lib/stores/currentPokedexStore';
	import type { UserPokedex } from '$lib/models/UserPokedex';

	export let viewAsBoxes = false;
	export let currentPage = 1;
	export let itemsPerPage = 20;
	export let totalPages = 0;
	export let showForms = true;
	export let showOrigins = true;
	export let showShiny = false;
	export let catchRegion = '';
	export let catchGame = '';
	export let selectedPokedex: UserPokedex | null = null;
	export let toggleForms = () => {};
	export let toggleOrigins = () => {};
	export let toggleShiny = () => {};
	export let getData = () => {};
	export let toggleViewAsBoxes = () => {};
	export let onPokedexChange = (pokedex: UserPokedex) => {};

	let filtersExpanded = false;
	let advancedFiltersExpanded = false;

	function toggleNationalNumbers() {
		showNationalNumbers.update((value) => !value);
	}

	function toggleFilters() {
		filtersExpanded = !filtersExpanded;
	}

	function toggleAdvancedFilters() {
		advancedFiltersExpanded = !advancedFiltersExpanded;
	}
</script>

<!-- Mobile-first responsive navigation -->
<nav class="bg-gray-100 border-b border-gray-300 p-4 space-y-4">
	<!-- Top row: View toggle and main filters toggle -->
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<!-- View Toggle -->
			<button class="btn btn-sm btn-outline" on:click={toggleViewAsBoxes}>
				{viewAsBoxes ? '📋 List' : '📦 Box'}
			</button>

			<!-- Quick Filters Toggle -->
			<button class="btn btn-sm btn-ghost" on:click={toggleFilters}>
				🔍 Filters
				<span class="ml-1 text-xs">
					{filtersExpanded ? '▼' : '▶'}
				</span>
			</button>
		</div>

		<!-- Pagination (mobile compact) -->
		{#if !viewAsBoxes && totalPages > 1}
			<div class="flex items-center space-x-2 text-sm">
				<button
					class="btn btn-xs btn-ghost"
					disabled={currentPage <= 1}
					on:click={() => {
						currentPage = Math.max(1, currentPage - 1);
						getData();
					}}
				>
					◀
				</button>
				<span class="text-xs">{currentPage}/{totalPages}</span>
				<button
					class="btn btn-xs btn-ghost"
					disabled={currentPage >= totalPages}
					on:click={() => {
						currentPage = Math.min(totalPages, currentPage + 1);
						getData();
					}}
				>
					▶
				</button>
			</div>
		{/if}
	</div>

	<!-- Collapsible Filters Section -->
	{#if filtersExpanded}
		<div class="space-y-4 border-t pt-4">
			<!-- Quick Toggles Row -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm"
						bind:checked={showForms}
						on:change={toggleForms}
					/>
					<span class="text-sm">Forms</span>
				</label>
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm"
						bind:checked={showOrigins}
						on:change={toggleOrigins}
					/>
					<span class="text-sm">Origins</span>
				</label>
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm"
						bind:checked={showShiny}
						on:change={toggleShiny}
					/>
					<span class="text-sm">Shiny</span>
				</label>
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm"
						bind:checked={$showNationalNumbers}
						on:change={toggleNationalNumbers}
					/>
					<span class="text-sm">National #</span>
				</label>
			</div>

			<!-- Advanced Filters Toggle -->
			<button class="btn btn-sm btn-ghost w-full justify-between" on:click={toggleAdvancedFilters}>
				Advanced Filters
				<span class="text-xs">
					{advancedFiltersExpanded ? '▼' : '▶'}
				</span>
			</button>

			<!-- Advanced Filters Section -->
			{#if advancedFiltersExpanded}
				<div class="grid md:grid-cols-2 gap-4 border-t pt-4">
					<div>
						<label class="label label-text text-sm font-semibold" for="regionSelect">
							Region Filter:
						</label>
						<select
							id="regionSelect"
							class="select select-sm select-bordered w-full"
							bind:value={catchRegion}
							on:change={getData}
						>
							<option value="">All Regions</option>
							<option value="Kanto">Kanto</option>
							<option value="Johto">Johto</option>
							<option value="Hoenn">Hoenn</option>
							<option value="Sinnoh">Sinnoh</option>
							<option value="Unova">Unova</option>
							<option value="Kalos">Kalos</option>
							<option value="Alola">Alola</option>
							<option value="Galar">Galar</option>
							<option value="Hisui">Hisui</option>
							<option value="Paldea">Paldea</option>
							<option value="Unknown">Unknown</option>
						</select>
					</div>

					<div>
						<label class="label label-text text-sm font-semibold" for="gameSelect">
							Game Filter:
						</label>
						<select
							id="gameSelect"
							class="select select-sm select-bordered w-full"
							bind:value={catchGame}
							on:change={getData}
						>
							<option value="">All Games</option>
							<optgroup label="Generation 1">
								<option value="Red">Red</option>
								<option value="Blue">Blue</option>
								<option value="Yellow">Yellow</option>
								<option value="LG: Pikachu">Let's Go Pikachu</option>
								<option value="LG: Eevee">Let's Go Eevee</option>
							</optgroup>
							<optgroup label="Generation 2">
								<option value="Gold">Gold</option>
								<option value="Silver">Silver</option>
								<option value="Crystal">Crystal</option>
								<option value="HG">HeartGold</option>
								<option value="SS">SoulSilver</option>
							</optgroup>
							<optgroup label="Generation 3">
								<option value="Ruby">Ruby</option>
								<option value="Sapphire">Sapphire</option>
								<option value="Emerald">Emerald</option>
								<option value="OR">Omega Ruby</option>
								<option value="AS">Alpha Sapphire</option>
							</optgroup>
							<optgroup label="Generation 4">
								<option value="Diamond">Diamond</option>
								<option value="Pearl">Pearl</option>
								<option value="Platinum">Platinum</option>
								<option value="BD">Brilliant Diamond</option>
								<option value="SP">Shining Pearl</option>
							</optgroup>
							<optgroup label="Generation 5">
								<option value="Black">Black</option>
								<option value="White">White</option>
								<option value="Black2">Black 2</option>
								<option value="White2">White 2</option>
							</optgroup>
							<optgroup label="Generation 6">
								<option value="X">X</option>
								<option value="Y">Y</option>
							</optgroup>
							<optgroup label="Generation 7">
								<option value="Sun">Sun</option>
								<option value="Moon">Moon</option>
								<option value="US">Ultra Sun</option>
								<option value="UM">Ultra Moon</option>
							</optgroup>
							<optgroup label="Generation 8">
								<option value="Sword">Sword</option>
								<option value="Shield">Shield</option>
								<option value="PLA">Legends Arceus</option>
							</optgroup>
							<optgroup label="Generation 9">
								<option value="Scarlet">Scarlet</option>
								<option value="Violet">Violet</option>
							</optgroup>
							<optgroup label="Other">
								<option value="Home">HOME</option>
								<option value="Go">GO</option>
							</optgroup>
						</select>
					</div>
				</div>
			{/if}

			<!-- Full Pagination (when filters expanded) -->
			{#if !viewAsBoxes && totalPages > 1}
				<div class="border-t pt-4">
					<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
				</div>
			{/if}
		</div>
	{/if}
</nav>

<style>
	/* Custom responsive behavior */
	@media (min-width: 768px) {
		/* On larger screens, show filters expanded by default */
		nav {
			background: linear-gradient(to right, #f8fafc, #f1f5f9);
		}
	}
</style>
