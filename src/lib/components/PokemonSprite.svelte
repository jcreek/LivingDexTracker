<script lang="ts">
	import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';
	import { inView } from '$lib/actions/inView';
	import { resolveSpriteUrl, resolveGridSpriteUrl } from '$lib/utils/spriteUrl';

	export let variant: 'detail' | 'grid' = 'detail';
	let failedPaths = new Set<string>();
	let fallbackIndex = 0;
	let candidates: string[] = [];
	$: {
		const entry = { pokedexNumber: Number(pokedexNumber), form, spriteKey };
		const full = resolveSpriteUrl(
			entry,
			!!shiny,
			PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
		);
		candidates = [
			...new Set([
				...(variant === 'grid' ? [resolveGridSpriteUrl(entry, !!shiny)] : []),
				full,
				resolveSpriteUrl(
					{ ...entry, form: form?.replace(/^female[-\s]*/i, '') },
					!!shiny,
					PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
				),
				resolveSpriteUrl(
					{ pokedexNumber: Number(pokedexNumber) },
					!!shiny,
					PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
				)
			])
		];
		fallbackIndex = candidates.findIndex((url) => !failedPaths.has(url));
	}
	function imageFailed() {
		failedPaths = new Set([...failedPaths, imagePath!]);
	}

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
	}

	$: imagePath = candidates[fallbackIndex] ?? null;
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
			<span class="inline-block w-full h-full" aria-hidden="true"></span>
		{:else}
			<img
				src={imagePath}
				alt=""
				on:error={imageFailed}
				loading={loadingStrategy === 'lazy' ? 'lazy' : 'eager'}
				decoding="async"
			/>
		{/if}
	</span>
{:else}
	<span class="inline-block w-full h-full" aria-hidden="true"></span>
{/if}
