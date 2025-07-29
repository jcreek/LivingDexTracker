<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';

	export let viewAsBoxes = false;
	export let currentPage = 1;
	export let itemsPerPage = 20;
	export let totalPages = 0;
	export let catchGame = '';
	export let getData = () => {};
	export let toggleViewAsBoxes = () => {};

</script>

<!-- Simplified single-row navigation -->
<nav class="bg-gray-100 border-b border-gray-300 p-4">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<!-- Left side: View toggle and Game filter -->
		<div class="flex items-center space-x-4">
			<!-- View Toggle -->
			<button class="btn btn-sm btn-outline" on:click={toggleViewAsBoxes}>
				{viewAsBoxes ? '📋 List' : '📦 Box'}
			</button>

			<!-- Game Filter -->
			<div class="flex items-center space-x-2">
				<label class="text-sm font-medium" for="gameSelect">Game:</label>
				<select
					id="gameSelect"
					class="select select-sm select-bordered"
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

		<!-- Right side: Pagination -->
		{#if !viewAsBoxes && totalPages > 1}
			<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
		{/if}
	</div>
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
