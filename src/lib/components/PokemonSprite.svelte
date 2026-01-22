<script lang="ts">
	import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';
	import { inView } from '$lib/actions/inView';

	export let pokemonName: string;
	export let pokedexNumber: string | number;
	export let form: string | undefined;
	export let spriteKey: string | undefined;
	export let shiny: boolean | undefined = false;
	export let loadingStrategy: 'eager' | 'lazy' | 'inView' = 'inView';

	let imagePath = null as string | null;
	let isInView = false;

	function isFemaleForm(value?: string) {
		return /^female\b/i.test((value ?? '').trim());
	}

	function buildFallbackKey() {
		const strippedPokedexNumber = pokedexNumber.toString().replace(/^0+/, '') || '0';
		if (!form) return strippedPokedexNumber;

		let formValue = form.trim();
		formValue = formValue.replace(/^female[-\s]*/i, '');
		formValue = formValue
			.replace(/\s*\(.*?\)/g, '')
			.replace(/\s*\[.*?\]/g, '')
			.trim();
		if (!formValue || formValue.toLowerCase() === 'male') return strippedPokedexNumber;

		formValue = formValue
			.toLowerCase()
			.replace(/%/g, '')
			.replace(/\balolan\b/g, 'alola')
			.replace(/\bgalarian\b/g, 'galar')
			.replace(/\bhisuian\b/g, 'hisui')
			.replace(/\bpaldean\b/g, 'paldea')
			.replace(/\bform(e)?$/, '')
			.replace(/\bability$/, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.replace(/2/g, 'two')
			.replace(/3/g, 'three')
			.replace(/4/g, 'four');

		return formValue ? `${strippedPokedexNumber}-${formValue}` : strippedPokedexNumber;
	}

	$: {
		const rootFolderBase =
			PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
				? '/sprites-small/home'
				: 'https://raw.githubusercontent.com/jcreek/LivingDexTracker/master/static/sprites-small/home';
		const resolvedSpriteKey = spriteKey?.trim() || buildFallbackKey();
		if (!spriteKey?.trim()) {
			console.warn('Missing sprite key for pokemon entry', {
				pokemonName,
				pokedexNumber,
				form
			});
		}

		let rootFolder = rootFolderBase;
		if (shiny) {
			rootFolder += '/shiny';
		}
		if (isFemaleForm(form)) {
			rootFolder += '/female';
		}
		imagePath = `${rootFolder}/${resolvedSpriteKey}.webp`;
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
