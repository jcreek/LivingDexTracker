<script lang="ts">
	import type { CombinedData } from '$lib/models/CombinedData';
	import type { SharedCombinedData } from '$lib/models/SharedPokedex';
	import type { PageData } from './$types';
	import { calculateBoxNumbers } from '$lib/utils/boxPlacement';
	import PokedexViewBoxes from '$lib/components/pokedex/PokedexViewBoxes.svelte';
	import PokedexModal from '$lib/components/pokedex/PokedexModal.svelte';
	import PokedexEntryCatchRecord from '$lib/components/pokedex/PokedexEntryCatchRecord.svelte';

	export let data: PageData;
	$: shared = data.shared;
	$: boxNumbers = calculateBoxNumbers(shared.combinedData.length);
	$: description = `${shared.caught} of ${shared.total} Pokémon caught (${shared.completionPercentage}% complete).`;
	let selectedPokemon: SharedCombinedData | null = null;
	let showModal = false;

	function openPokemonModal(pokemon: SharedCombinedData) {
		selectedPokemon = pokemon;
		showModal = true;
	}

	function handlePokemonClick(pokemon: CombinedData | SharedCombinedData) {
		openPokemonModal(pokemon as SharedCombinedData);
	}

	function closePokemonModal() {
		showModal = false;
		selectedPokemon = null;
	}

	$: typeBadges = [
		shared.isLivingDex && 'Living',
		shared.isShinyDex && 'Shiny',
		shared.isOriginDex && 'Origin',
		shared.isFormDex && 'Form'
	].filter(Boolean);
</script>

<svelte:head>
	<title>{shared.name} - Living Dex Tracker</title>
	<meta name="description" content={description} />
	<meta name="robots" content="noindex, nofollow" />
	<meta name="referrer" content="no-referrer" />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={`${shared.name} - Living Dex Tracker`} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta property="og:image" content={data.previewUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={`${shared.name} Pokédex progress: ${description}`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${shared.name} - Living Dex Tracker`} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={data.previewUrl} />
</svelte:head>

<div class="container mx-auto p-4 max-w-screen-2xl">
	<div class="card bg-base-100 shadow-xl mb-6">
		<div class="card-body">
			<div class="flex flex-col gap-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h1 class="card-title text-3xl">{shared.name}</h1>
					<span class="badge badge-outline badge-lg">Read-only shared Pokédex</span>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each typeBadges as badge}
						<span class="badge badge-primary badge-lg">{badge}</span>
					{/each}
					<span class="badge badge-ghost badge-lg">{shared.gameScope || 'All Games'}</span>
				</div>
				{#if shared.description}<p class="text-base-content/70">{shared.description}</p>{/if}
				<p class="text-lg font-semibold">
					{shared.caught} of {shared.total} Pokémon caught · {shared.completionPercentage}% complete
				</p>
			</div>
		</div>
	</div>

	<PokedexViewBoxes
		readOnly
		showShiny={shared.isShinyDex}
		combinedData={shared.combinedData}
		{boxNumbers}
		onPokemonClick={handlePokemonClick}
	/>
</div>

{#if showModal && selectedPokemon}
	<PokedexModal isOpen={showModal} onClose={closePokemonModal}>
		<PokedexEntryCatchRecord
			readOnly
			pokedexEntry={selectedPokemon.pokedexEntry}
			catchRecord={null}
			sharedCatchStatus={selectedPokemon.catchRecord}
			showOrigins={shared.isOriginDex}
			showForms={shared.isFormDex}
			showShiny={shared.isShinyDex}
			pokedexId=""
		/>
	</PokedexModal>
{/if}
