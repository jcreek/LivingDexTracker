<script lang="ts">
	import { onMount } from 'svelte';
	import pokeApiPokemon from '$lib/helpers/pokeapi-pokemon.json';
	import { PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER } from '$env/static/public';

	export let pokemonName: string;
	export let pokedexNumber: string | number;
	export let form: string | undefined;
	export let shiny: boolean | undefined = false;

	let imagePath = null as string | null;
	let blah = '';

	function setImagePath() {
		let rootFolder =
			PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER === 'true'
				? '/sprites/home'
				: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';

		if (form === 'Female') {
			rootFolder += '/female';
		}

		if (shiny) {
			rootFolder += '/shiny';
		}

		// Remove leading zeros
		const strippedPokedexNumber = pokedexNumber.toString().replace(/^0+/, '');

		// Sanitise the pokemon name by making it all lowercase and replacing any spaces with hyphens and removing other characters
		let sanitisedPokemonName = pokemonName.toLowerCase().replace(/[^a-z]/g, '');

		/**
		 * Sprite Resolution Strategy:
		 * 1. For forms with PokeAPI entries (regional forms): Use PokeAPI ID (e.g., 10107.png)
		 * 2. For forms without PokeAPI entries (Unown, Burmy, etc.): Use {pokedexNumber}-{form} (e.g., 201-a.png)
		 * 3. For base forms: Use PokeAPI ID matching species_id
		 */
		let pokeApiId;
		if (form && form.length > 0 && form !== 'Female') {
			// Sanitise the form by making it all lowercase and replacing spaces with hyphens
			let sanitisedForm = form
				.toLowerCase()
				.replaceAll(' ', '-')
				.replaceAll('!', 'exclamation')
				.replaceAll('?', 'question')
				.replaceAll('2', 'two')
				.replaceAll('3', 'three')
				.replaceAll('4', 'four');

			switch (sanitisedForm) {
				case 'alolan':
					sanitisedForm = 'alola';
					break;
				case 'galarian':
					sanitisedForm = 'galar';
					break;
				case 'hisuian':
					sanitisedForm = 'hisui';
					break;
				// case 'rainbow-ribbon':
				// 	sanitisedForm = 'rainbow-swirl-ribbon-sweet';
				// 	break;
				default:
					break;
			}

			// Try to find by PokeAPI identifier (e.g., "meowth-alola" -> 10107)
			const pokeApiEntry = pokeApiPokemon.find(
				(pokemon) => pokemon.identifier === sanitisedPokemonName + '-' + sanitisedForm
			);

			if (pokeApiEntry) {
				// Pattern 1: Use PokeAPI ID (e.g., 10107.png for Meowth-Alola)
				pokeApiId = pokeApiEntry.id;
			} else {
				// Pattern 2: Use {pokedexNumber}-{form} (e.g., 201-a.png for Unown-A)
				pokeApiId = `${strippedPokedexNumber}-${sanitisedForm}`;
			}
		} else {
			pokeApiId = pokeApiPokemon.find(
				(pokemon) => pokemon.species_id.toString() === strippedPokedexNumber
			)?.id;
		}

		imagePath = `${rootFolder}/${pokeApiId}.png`;
		blah = `${pokeApiId}.png`;
		// blah = `${strippedPokedexNumber}${form?.length && form !== 'Female' ? '-' + form : ''}.png`;
	}

	onMount(setImagePath);
</script>

{#if imagePath}
	<!-- {blah} -->
	<img src={imagePath} alt="sprite" />
{:else}
	<span class="loading loading-spinner loading-xs"></span>
{/if}
