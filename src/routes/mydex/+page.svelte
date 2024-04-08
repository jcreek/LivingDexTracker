<script lang="ts">
	import { onMount } from 'svelte';
	import { type PokedexEntry } from '$lib/models/PokedexEntry';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';

	let pokemonData = null as PokedexEntry[] | null;

	async function fetchPokeDexEntries() {
		const response = await fetch('/api/pokedexentries');
		if (!response.ok) {
			throw new Error('Failed to fetch Pokémon data');
		}

		pokemonData = await response.json();
	}

	onMount(async () => {
		const cachedData = localStorage.getItem('pokeDexEntries');
		if (cachedData) {
			// Use cached data
			pokemonData = JSON.parse(cachedData);
		} else {
			await fetchPokeDexEntries();
			// Cache data in local storage
			localStorage.setItem('pokeDexEntries', JSON.stringify(pokemonData));
		}
	});
</script>

{#if pokemonData}
	{#each pokemonData as pokemon}
		<div>
			<PokemonSprite
				pokedexNumber={pokemon.pokedexNumber.toString().padStart(3, '0')}
				form={pokemon.form
					.replace(/[^a-zA-Z ]/g, '')
					.trim()
					.replace(/ /g, '-')}
			/>
			<p>
				{pokemon.pokedexNumber.toString().padStart(3, '0')}
				{pokemon.pokemon}
				{pokemon.form}
			</p>
		</div>
	{/each}
{:else}
	<span class="loading loading-spinner loading-xl"></span>
{/if}
