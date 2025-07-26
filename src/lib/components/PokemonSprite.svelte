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

		// Get the PokeApi id for the pokemon
		let pokeApiId;
		if (form && form.length > 0 && form !== 'Female') {
			// Sanitise the form by making it all lowercase and replacing spaces with hyphens
			let sanitisedForm = form
				.toLowerCase()
				.replaceAll(' ', '-')
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

			// If the form is contained in the identifier, use that
			if (
				pokeApiPokemon.find(
					(pokemon) => pokemon.identifier === sanitisedPokemonName + '-' + sanitisedForm
				)
			) {
				pokeApiId = pokeApiPokemon.find(
					(pokemon) => pokemon.identifier === sanitisedPokemonName + '-' + sanitisedForm
				)?.id;
			} else {
				// If the form is not contained in the identifier, use the species_id
				pokeApiId = pokeApiPokemon.find(
					(pokemon) => pokemon.species_id.toString() === strippedPokedexNumber
				)?.id;
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
