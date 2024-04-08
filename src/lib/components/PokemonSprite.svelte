<script lang="ts">
	import { onMount } from 'svelte';

	export let pokedexNumber: string | number;
	export let form: string | undefined;

	let imagePath = null as string | null;

	async function fetchImagePath() {
		try {
			let url = `/api/sprite?pokedexNumber=${pokedexNumber}`;
			if (form) {
				url += `&form=${form}`;
			}

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error('Failed to fetch image path');
			}
			const data = await response.json();

			imagePath = `./sprites/regular/${data.spriteFileName}`;
		} catch (error) {
			console.error(error);
		}
	}

	onMount(fetchImagePath);
</script>

{#if imagePath}
	<img src={imagePath} alt="sprite" />
{:else}
	<span class="loading loading-spinner loading-xs"></span>
{/if}
