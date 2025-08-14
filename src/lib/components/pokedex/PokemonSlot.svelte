<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';
	import { getSpriteUrl, getPlaceholderSpriteUrl } from '$lib/utils/sprites';

	export let pokemon: PokemonWithCatchStatus | null;
	export let isShiny: boolean = false;
	export let position: number = 0;

	const dispatch = createEventDispatcher<{
		click: void;
		rightclick: void;
	}>();

	$: catchRecord = pokemon?.catchRecord;
	$: isCaught = catchRecord?.caught || false;
	$: haveToEvolve = catchRecord?.haveToEvolve || false;
	$: catchStatus = getCatchStatus(isCaught, haveToEvolve);
	$: isInHome = catchRecord?.inHome || false;
	
	function getCatchStatus(caught: boolean, evolve: boolean): string {
		if (!caught) return 'not_caught';
		if (evolve) return 'ready_to_evolve';
		return 'caught';
	}

	$: slotClass = getSlotClass(catchStatus, isInHome);
	$: spriteUrl = pokemon
		? getSpriteUrl(pokemon.pokedexNumber, pokemon.form, isShiny)
		: getPlaceholderSpriteUrl();

	// Use an action to handle image errors
	function handleImgError(node: HTMLImageElement) {
		const handleError = () => {
			console.log('Image failed to load:', node.src);
			if (!node.src.endsWith('/0.png')) {
				console.log('Attempting fallback to 0.png');
				node.src = '/sprites/home/0.png';
			}
		};

		node.addEventListener('error', handleError);

		return {
			destroy() {
				node.removeEventListener('error', handleError);
			}
		};
	}

	function getSlotClass(status: string, inHome: boolean): string {
		let baseClass = 'box-slot transition-all duration-200 hover:scale-105 hover:shadow-lg';

		if (!pokemon) {
			return `${baseClass} box-slot-empty hover:border-base-400`;
		}

		switch (status) {
			case 'caught':
				return `${baseClass} box-slot-caught hover:border-green-400 ${inHome ? 'ring-2 ring-blue-400' : ''}`;
			case 'ready_to_evolve':
				return `${baseClass} box-slot-ready-evolve hover:border-yellow-400`;
			default:
				return `${baseClass} box-slot-uncaught hover:border-base-400 hover:bg-base-300`;
		}
	}

	function handleClick() {
		if (pokemon) {
			dispatch('click');
		}
	}

	function handleRightClick(event: MouseEvent) {
		event.preventDefault();
		if (pokemon) {
			dispatch('rightclick');
		}
	}
</script>

<div
	class={slotClass}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:contextmenu={handleRightClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	title={pokemon
		? `Click to toggle: ${pokemon.pokemon}${pokemon.form ? ` (${pokemon.form})` : ''} - #${pokemon.pokedexNumber}`
		: 'Empty slot'}
	data-testid={pokemon ? `pokemon-slot` : `empty-slot`}
	data-status={catchStatus}
	data-pokemon-number={pokemon?.pokedexNumber}
	class:caught={catchStatus === 'caught'}
	class:ready-to-evolve={catchStatus === 'ready_to_evolve'}
>
	{#if pokemon}
		<div class="relative w-full h-full flex items-center justify-center">
			<!-- Pokemon Sprite -->
			<img
				src={spriteUrl}
				alt={pokemon.pokemon}
				class="pokemon-sprite max-w-full max-h-full"
				use:handleImgError
				loading="lazy"
			/>

			<!-- Status Indicators -->
			{#if isInHome}
				<div
					class="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white"
					title="In HOME"
					data-testid="home-indicator"
				></div>
			{/if}

			{#if catchStatus === 'ready_to_evolve'}
				<div
					class="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-white"
					title="Ready to evolve"
				></div>
			{/if}

			<!-- Pokemon Number (use regional number if available, otherwise national) -->
			<div class="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-1 rounded-tr">
				#{pokemon.regionalNumber || pokemon.pokedexNumber}
			</div>
			
			<!-- Pokemon Name -->
			<div class="absolute top-0 left-0 bg-black/60 text-white text-xs px-1 rounded-br max-w-full truncate">
				{pokemon.pokemon}
			</div>
		</div>
	{:else}
		<!-- Empty Slot -->
		<div class="flex items-center justify-center opacity-30">
			<img src={getPlaceholderSpriteUrl()} alt="Empty slot" class="w-8 h-8 opacity-50" />
		</div>

		<!-- Position indicator for empty slots -->
		<div class="absolute bottom-1 right-1 text-xs text-base-content/40">
			{position}
		</div>
	{/if}
</div>

<style>
	.box-slot {
		@apply relative w-full h-full rounded-lg border-2 border-base-300 cursor-pointer min-h-[80px];
	}

	.box-slot:hover::before {
		content: '';
		@apply absolute inset-0 bg-white/10 rounded-lg pointer-events-none;
	}

	.box-slot-empty {
		@apply bg-base-100 border-dashed opacity-60;
	}

	.box-slot-uncaught {
		@apply bg-base-200 border-base-300;
	}

	.box-slot-caught {
		@apply bg-green-50 border-green-300 shadow-sm;
	}

	.box-slot-ready-evolve {
		@apply bg-yellow-50 border-yellow-300 shadow-sm;
	}

	.pokemon-sprite {
		@apply w-12 h-12 object-contain;
	}

	:global(.dark) .box-slot-uncaught {
		@apply bg-base-300 border-base-content/20;
	}

	:global(.dark) .box-slot-caught {
		@apply bg-green-900/30 border-green-500;
	}

	:global(.dark) .box-slot-ready-evolve {
		@apply bg-yellow-900/30 border-yellow-500;
	}

	:global(.dark) .box-slot:hover::before {
		@apply bg-black/20;
	}
</style>
