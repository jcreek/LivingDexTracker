<script lang="ts">
	import { onMount } from 'svelte';
	import pokeApiPokemon from '$lib/helpers/pokeapi-pokemon.json';

	export let pokemonName: string;
	export let pokedexNumber: string | number;
	export let form: string | undefined;
	export let shiny: boolean | undefined = false;

	let imagePath = null as string | null;

	function setImagePath() {
		// Always use local sprites
		let rootFolder = '/sprites/home';

		if (form === 'Female') {
			rootFolder += '/female';
		}

		if (shiny) {
			rootFolder += '/shiny';
		}

		// Always use national dex number (pokedexNumber should always be national)
		const nationalDexNumber = pokedexNumber.toString().replace(/^0+/, '');

		// Sanitise the pokemon name by making it all lowercase and replacing any spaces with hyphens and removing other characters
		let sanitisedPokemonName = pokemonName.toLowerCase().replace(/[^a-z]/g, '');

		// Get the PokeApi id for the pokemon using national dex number
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
				// If the form is not contained in the identifier, use the national dex number
				pokeApiId = pokeApiPokemon.find(
					(pokemon) => pokemon.species_id.toString() === nationalDexNumber
				)?.id;
			}
		} else {
			// Use national dex number to find the correct PokeAPI ID
			pokeApiId = pokeApiPokemon.find(
				(pokemon) => pokemon.species_id.toString() === nationalDexNumber
			)?.id;
		}

		imagePath = `${rootFolder}/${pokeApiId}.png`;
	}

	// Make image path reactive to prop changes
	$: if (pokemonName && pokedexNumber) {
		setImagePath();
	}
</script>

{#if imagePath}
	<!-- {blah} -->
	<img src={imagePath} alt="sprite" />
{:else}
	<span class="loading loading-spinner loading-xs"></span>
{/if}
