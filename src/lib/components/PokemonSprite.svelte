<script lang="ts">
	import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';
	import { inView } from '$lib/actions/inView';
	import { resolveSpriteUrl } from '$lib/utils/spriteUrl';

	export let pokemonName: string;
	export let pokedexNumber: string | number;
	export let form: string | undefined;
	export let spriteKey: string | undefined;
	export let shiny: boolean | undefined = false;
	export let loadingStrategy: 'eager' | 'lazy' | 'inView' = 'inView';

	let imagePath = null as string | null;
	let isInView = false;

	$: {
		if (!spriteKey?.trim()) {
			console.warn('Missing sprite key for pokemon entry', {
				pokemonName,
				pokedexNumber,
				form
			});
		}

		imagePath = resolveSpriteUrl(
			{ pokedexNumber: Number(pokedexNumber), form, spriteKey },
			!!shiny,
			PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
		);
	}

	$: if (loadingStrategy !== 'inView') {
		isInView = true;
	}

	function handleInView(inView: boolean) {
		if (inView) {
			isInView = true;
		}
	}
</script>

{#if imagePath}
	<span
		use:inView={{
			enabled: loadingStrategy === 'inView',
			once: true,
			rootMargin: '200px 0px',
			onChange: handleInView
		}}
	>
		{#if loadingStrategy === 'inView' && !isInView}
			<span class="loading loading-spinner loading-xs"></span>
		{:else}
			<img
				src={imagePath}
				alt="sprite"
				loading={loadingStrategy === 'lazy' ? 'lazy' : 'eager'}
				decoding="async"
			/>
		{/if}
	</span>
{:else}
	<span class="loading loading-spinner loading-xs"></span>
{/if}
