<script lang="ts">
	import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';

	export let pokemonName: string;
	export let pokedexNumber: string | number;
	export let form: string | undefined;
	export let spriteKey: string | undefined;
	export let shiny: boolean | undefined = false;

	let imagePath = null as string | null;

	function isFemaleForm(value?: string) {
		return /^female\b/i.test((value ?? '').trim());
	}

	function buildFallbackKey() {
		const strippedPokedexNumber = pokedexNumber.toString().replace(/^0+/, '') || '0';
		if (!form) return strippedPokedexNumber;

		let formValue = form.trim();
		formValue = formValue.replace(/^female[-\s]*/i, '');
		formValue = formValue.replace(/\s*\(.*?\)/g, '').replace(/\s*\[.*?\]/g, '').trim();
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

	function computeImagePath() {
		let rootFolder =
			PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
				? '/sprites/home'
				: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';

		if (shiny) {
			rootFolder += '/shiny';
		}

		if (isFemaleForm(form)) {
			rootFolder += '/female';
		}

		const resolvedSpriteKey = spriteKey?.trim() || buildFallbackKey();
		if (!spriteKey?.trim()) {
			console.warn('Missing sprite key for pokemon entry', {
				pokemonName,
				pokedexNumber,
				form
			});
		}

		return `${rootFolder}/${resolvedSpriteKey}.png`;
	}

	$: imagePath = computeImagePath();
</script>

{#if imagePath}
	<img src={imagePath} alt="sprite" />
{:else}
	<span class="loading loading-spinner loading-xs"></span>
{/if}
