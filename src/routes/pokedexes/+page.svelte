<script lang="ts">
	import CreatePokedexModal from '$lib/components/CreatePokedexModal.svelte';
	import PokedexCard from '$lib/components/PokedexCard.svelte';
	import type { UserPokedex } from '$lib/models/UserPokedex';

	export let data;
	
	let pokedexes: UserPokedex[] = data.pokedexes || [];
	let showCreateModal = false;
	
	async function handleCreatePokedex(event: CustomEvent) {
		const newPokedex = event.detail;
		pokedexes = [...pokedexes, newPokedex];
		showCreateModal = false;
	}
	
	async function handleDeletePokedex(event: CustomEvent) {
		const pokedexId = event.detail;
		
		if (pokedexes.length <= 1) {
			alert('Cannot delete your last pokédex');
			return;
		}
		
		const response = await fetch(`/api/pokedexes/${pokedexId}`, {
			method: 'DELETE'
		});
		
		if (response.ok) {
			pokedexes = pokedexes.filter(p => p.id !== pokedexId);
		} else {
			const { error } = await response.json();
			alert(error || 'Failed to delete pokédex');
		}
	}
</script>

<svelte:head>
	<title>My Pokédexes - Living Dex Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold">My Pokédexes</h1>
		<button 
			class="btn btn-primary"
			on:click={() => showCreateModal = true}
		>
			Create New Pokédex
		</button>
	</div>
	
	{#if pokedexes.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each pokedexes as pokedex}
				<PokedexCard 
					{pokedex} 
					on:delete={handleDeletePokedex}
					canDelete={pokedexes.length > 1}
				/>
			{/each}
		</div>
	{:else}
		<div class="text-center py-16">
			<h2 class="text-2xl font-semibold mb-4">No Pokédexes Yet</h2>
			<p class="text-xl text-gray-600 mb-6">Create your first pokédex to start tracking your collection!</p>
			<button 
				class="btn btn-primary btn-lg"
				on:click={() => showCreateModal = true}
			>
				Create Your First Pokédex
			</button>
		</div>
	{/if}
</div>

{#if showCreateModal}
	<CreatePokedexModal 
		on:create={handleCreatePokedex}
		on:cancel={() => showCreateModal = false}
	/>
{/if}
