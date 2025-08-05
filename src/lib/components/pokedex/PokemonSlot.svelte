<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';
	import { getSpriteUrl, getPlaceholderSpriteUrl } from '$lib/utils/sprites';

	export let pokemon: PokemonWithCatchStatus | null;
	export let isShiny: boolean = false;
	export let position: number = 0;

	const dispatch = createEventDispatcher<{
		click: void;
	}>();

	$: catchRecord = pokemon?.catchRecord;
	$: isCaught = catchRecord?.isCaught || false;
	$: catchStatus = catchRecord?.catchStatus || 'not_caught';
	$: isInHome = catchRecord?.catchLocation === 'in_home';

	$: slotClass = getSlotClass(catchStatus, isInHome);
	$: spriteUrl = pokemon ? getSpriteUrl(pokemon.pokedexNumber, pokemon.form, isShiny) : getPlaceholderSpriteUrl();

	function getSlotClass(status: string, inHome: boolean): string {
		let baseClass = 'box-slot transition-all duration-200 hover:scale-105';
		
		if (!pokemon) {
			return `${baseClass} box-slot-empty`;
		}

		switch (status) {
			case 'caught':
				return `${baseClass} box-slot-caught ${inHome ? 'ring-2 ring-blue-400' : ''}`;
			case 'ready_to_evolve':
				return `${baseClass} box-slot-ready-evolve`;
			default:
				return `${baseClass} bg-base-200 hover:bg-base-300`;
		}
	}

	function handleClick() {
		if (pokemon) {
			dispatch('click');
		}
	}

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.src = getPlaceholderSpriteUrl();
	}
</script>

<div
	class={slotClass}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	title={pokemon ? `${pokemon.pokemon}${pokemon.form ? ` (${pokemon.form})` : ''} - #${pokemon.pokedexNumber}` : 'Empty slot'}
>
	{#if pokemon}
		<div class="relative w-full h-full flex items-center justify-center">
			<!-- Pokemon Sprite -->
			<img
				src={spriteUrl}
				alt={pokemon.pokemon}
				class="pokemon-sprite max-w-full max-h-full"
				on:error={handleImageError}
				loading="lazy"
			/>

			<!-- Status Indicators -->
			{#if isInHome}
				<div class="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white" title="In HOME"></div>
			{/if}

			{#if catchStatus === 'ready_to_evolve'}
				<div class="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-white" title="Ready to evolve"></div>
			{/if}

			<!-- Pokemon Number -->
			<div class="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-1 rounded-tr">
				#{pokemon.pokedexNumber}
			</div>
		</div>
	{:else}
		<!-- Empty Slot -->
		<div class="flex items-center justify-center opacity-30">
			<img
				src={getPlaceholderSpriteUrl()}
				alt="Empty slot"
				class="w-8 h-8 opacity-50"
			/>
		</div>
		
		<!-- Position indicator for empty slots -->
		<div class="absolute bottom-1 right-1 text-xs text-base-content/40">
			{position}
		</div>
	{/if}
</div>