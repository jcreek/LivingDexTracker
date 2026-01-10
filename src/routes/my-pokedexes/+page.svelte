<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import type { Pokedex } from '$lib/models/Pokedex';
	import PokedexCard from '$lib/components/pokedex/PokedexCard.svelte';
	import PokedexForm from '$lib/components/pokedex/PokedexForm.svelte';

	let pokedexes: Pokedex[] = [];
	const unsubscribe = user.subscribe((value) => {
		console.log('[MyPokedexes] User store updated:', value ? 'User found' : 'User null');
	});
	onDestroy(unsubscribe);
	let showModal = false;
	let editingPokedex: Pokedex | null = null;
	let formData: Partial<Pokedex> = {
		name: '',
		description: '',
		isLivingDex: false,
		isShinyDex: false,
		isOriginDex: false,
		isFormDex: false,
		gameScope: null
	};

	$: mode = editingPokedex ? ('edit' as const) : ('create' as const);

	onMount(async () => {
		// Wait a short time for the user store to be populated (in case of race condition)
		// This gives the layout's getUser() time to complete
		if (!$user) {
			console.log('[MyPokedexes] onMount() - No user yet, waiting 100ms...');
			await new Promise((resolve) => setTimeout(resolve, 100));
			console.log(
				'[MyPokedexes] onMount() - After wait, user store value:',
				$user ? 'User found' : 'User null'
			);
		}

		if (!$user) {
			goto('/signin');
			return;
		}

		await loadPokedexes();
	});

	async function loadPokedexes() {
		const response = await fetch('/api/pokedexes', { credentials: 'include' });
		if (response.ok) {
			pokedexes = await response.json();
		} else {
			console.error('Failed to load pokédexes:', response.status, await response.text());
		}
	}

	async function readApiErrorMessage(response: Response): Promise<string> {
		try {
			// Use a clone so we can still fall back to reading the original body as text.
			const data = await response.clone().json();
			if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
				return data.error;
			}
		} catch {
			// fall through
		}
		try {
			return await response.text();
		} catch {
			return 'Request failed';
		}
	}

	function openCreateModal() {
		editingPokedex = null;
		formData = {
			name: '',
			description: '',
			isLivingDex: false,
			isShinyDex: false,
			isOriginDex: false,
			isFormDex: false,
			gameScope: null
		};
		showModal = true;
	}

	function openEditModal(pokedex: Pokedex) {
		editingPokedex = pokedex;
		formData = { ...pokedex };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingPokedex = null;
	}

	async function handleSubmit() {
		try {
			if (editingPokedex) {
				// Update existing pokédex
				const response = await fetch(`/api/pokedexes/${editingPokedex._id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
					credentials: 'include'
				});

				if (!response.ok) {
					const errorText = await readApiErrorMessage(response);
					console.error('Failed to update pokédex:', response.status, errorText);
					alert(errorText);
					return;
				}

				closeModal();
				await loadPokedexes();
				return;
			} else {
				// Create new pokédex
				const response = await fetch('/api/pokedexes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
					credentials: 'include'
				});

				if (!response.ok) {
					const errorText = await readApiErrorMessage(response);
					console.error('Failed to create pokédex:', response.status, errorText);
					alert(errorText);
					return;
				}
				const createdPokedex = (await response.json()) as Pokedex;

				// Refresh local state BEFORE deciding whether this is the user's first pokédex.
				closeModal();
				await loadPokedexes();

				// If the user's total pokédex count is now 1, this newly created one is their first.
				if (pokedexes.length === 1) {
					goto(`/pokedex/${createdPokedex._id}`);
					return;
				}
			}
		} catch (error) {
			console.error('Error saving pokédex:', error);
			alert('An error occurred');
		}
	}

	async function handleDelete(pokedex: Pokedex) {
		// TODO: Get catch record count and show in confirmation
		const confirmed = confirm(
			`Are you sure you want to delete "${pokedex.name}"? This will also delete all associated catch records. This action cannot be undone.`
		);

		if (!confirmed) return;

		try {
			const response = await fetch(`/api/pokedexes/${pokedex._id}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Failed to delete pokédex:', response.status, errorText);
				alert(`Failed to delete pokédex: ${errorText}`);
				return;
			}

			await loadPokedexes();
		} catch (error) {
			console.error('Error deleting pokédex:', error);
			alert('An error occurred');
		}
	}

	function handleView(pokedex: Pokedex) {
		goto(`/pokedex/${pokedex._id}`);
	}
</script>

<svelte:head>
	<title>My Pokédexes - Living Dex Tracker</title>
</svelte:head>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">My Pokédexes</h1>
		<button class="btn btn-primary" on:click={openCreateModal}> Create New Pokédex </button>
	</div>

	{#if pokedexes.length === 0}
		<div class="text-center py-12">
			<h2 class="text-2xl font-semibold mb-4">You haven't created any pokédexes yet!</h2>
			<p class="mb-6">Get started by creating your first pokédex to track your collection.</p>
			<button class="btn btn-primary btn-lg" on:click={openCreateModal}>
				Create Your First Pokédex
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each pokedexes as pokedex (pokedex._id)}
				<PokedexCard
					{pokedex}
					onEdit={() => openEditModal(pokedex)}
					onDelete={() => handleDelete(pokedex)}
					onView={() => handleView(pokedex)}
				/>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-lg mb-4">
				{mode === 'create' ? 'Create New Pokédex' : 'Edit Pokédex'}
			</h3>
			<PokedexForm bind:pokedex={formData} {mode} onSubmit={handleSubmit} onCancel={closeModal} />
		</div>
		<div class="modal-backdrop" on:click={closeModal}></div>
	</div>
{/if}
