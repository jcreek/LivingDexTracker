<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';

	export let viewAsBoxes = false;
	export let currentPage = 1;
	export let itemsPerPage = 20;
	export let totalPages = 0;
	export let showForms = true;
	export let showOrigins = true;
	export let showShiny = false;
	export let catchRegion = '';
	export let catchGame = '';
	export let toggleForms = () => {};
	export let toggleOrigins = () => {};
	export let toggleShiny = () => {};
	export let getData = () => {};
	export let toggleViewAsBoxes = () => {};
</script>

<aside
	class="menu bg-gray-800 text-white min-h-full w-64 p-4 lg:fixed xs:top-0 lg:left-0 h-full lg:h-5/6"
>
	<h2 class="text-2xl font-semibold mb-4">Views</h2>
	<ul>
		<li class="mb-2">
			<button class="block p-2 hover:bg-gray-700 rounded" on:click={toggleViewAsBoxes}>
				{viewAsBoxes ? 'Switch to List View' : 'Switch to Box View'}
			</button>
		</li>
	</ul>
	<h2 class="text-2xl font-semibold mb-4">Filters</h2>
	<ul>
		<li class="mb-2">
			<button class="block p-2 hover:bg-gray-700 rounded" on:click={toggleForms}>
				Toggle Forms (Currently {showForms ? 'On' : 'Off'})
			</button>
		</li>
		<li class="mb-2">
			<button class="block p-2 hover:bg-gray-700 rounded" on:click={toggleOrigins}>
				Toggle Origins (Currently {showOrigins ? 'On' : 'Off'})
			</button>
		</li>
		<li class="mb-2">
			<button class="block p-2 hover:bg-gray-700 rounded" on:click={toggleShiny}>
				Toggle Shiny (Currently {showShiny ? 'On' : 'Off'})
			</button>
		</li>
	</ul>
	<div class="mb-4">
		<label for="catchRegionSelect">Region to catch in:</label>
		<select
			id="catchRegionSelect"
			class="select select-bordered w-full max-w-xs text-black"
			bind:value={catchRegion}
			on:change={getData}
		>
			<option value="">All</option>
			<option value="Kanto">Kanto (Red, Blue, Yellow, LG: Pikachu, LG: Eevee)</option>
			<option value="Johto">Johto (Gold, Silver, Crystal, HG, SS)</option>
			<option value="Hoenn">Hoenn (Ruby, Sapphire, Emerald, OR, AS)</option>
			<option value="Sinnoh">Sinnoh (Diamond, Pearl, Platinum, BD, SP)</option>
			<option value="Unova">Unova (Black, White, Black2, White2, Dream Radar)</option>
			<option value="Kalos">Kalos (X, Y)</option>
			<option value="Alola">Alola (Sun, Moon, Moon Demo, US, UM)</option>
			<option value="Galar">Galar (Sword, Shield)</option>
			<option value="Hisui">Hisui (PLA)</option>
			<option value="Paldea">Paldea (Scarlet, Violet)</option>
			<option value="Unknown">Unknown (Home, Go)</option>
		</select>
	</div>

	<div class="mb-4">
		<label for="catchGameSelect">Game to catch in: {catchGame}</label>
		<select
			id="catchGameSelect"
			class="select select-bordered w-full max-w-xs text-black"
			bind:value={catchGame}
			on:change={getData}
		>
			<option value="">All</option>
			<option value="Red">Red (Kanto)</option>
			<option value="Blue">Blue (Kanto)</option>
			<option value="Yellow">Yellow (Kanto)</option>
			<option value="LG: Pikachu">LG: Pikachu (Kanto)</option>
			<option value="LG: Eevee">LG: Eevee (Kanto)</option>
			<option value="Gold">Gold (Johto)</option>
			<option value="Silver">Silver (Johto)</option>
			<option value="Crystal">Crystal (Johto)</option>
			<option value="HG">HG (Johto)</option>
			<option value="SS">SS (Johto)</option>
			<option value="Ruby">Ruby (Hoenn)</option>
			<option value="Sapphire">Sapphire (Hoenn)</option>
			<option value="Emerald">Emerald (Hoenn)</option>
			<option value="OR">OR (Hoenn)</option>
			<option value="AS">AS (Hoenn)</option>
			<option value="Diamond">Diamond (Sinnoh)</option>
			<option value="Pearl">Pearl (Sinnoh)</option>
			<option value="Platinum">Platinum (Sinnoh)</option>
			<option value="BD">BD (Sinnoh)</option>
			<option value="SP">SP (Sinnoh)</option>
			<option value="Black">Black (Unova)</option>
			<option value="White">White (Unova)</option>
			<option value="Black2">Black2 (Unova)</option>
			<option value="White2">White2 (Unova)</option>
			<option value="Dream Radar">Dream Radar (Unova)</option>
			<option value="X">X (Kalos)</option>
			<option value="Y">Y (Kalos)</option>
			<option value="Sun">Sun (Alola)</option>
			<option value="Moon">Moon (Alola)</option>
			<option value="Moon Demo">Moon Demo (Alola)</option>
			<option value="US">US (Alola)</option>
			<option value="UM">UM (Alola)</option>
			<option value="Sword">Sword (Galar)</option>
			<option value="Shield">Shield (Galar)</option>
			<option value="PLA">PLA (Hisui)</option>
			<option value="Scarlet">Scarlet (Paldea)</option>
			<option value="Violet">Violet (Paldea)</option>
			<option value="Home">Home (Unknown)</option>
			<option value="Go">Go (Unknown)</option>
		</select>
	</div>

	{#if !viewAsBoxes}
		<h2 class="text-2xl font-semibold mb-4">Paging</h2>
		<div>
			<Pagination bind:currentPage bind:itemsPerPage bind:totalPages />
		</div>
	{/if}
</aside>
