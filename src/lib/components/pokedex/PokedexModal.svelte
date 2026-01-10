<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let isOpen: boolean;
	export let onClose: () => void;

	function handleBackdropClick() {
		onClose();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
	});
</script>

{#if isOpen}
	<div class="modal modal-open" role="dialog" aria-modal="true">
		<div class="modal-box-custom bg-primary text-primary-content">
			<button class="close-button" on:click={onClose} aria-label="Close"> ✕ </button>
			<div class="modal-content">
				<slot />
			</div>
		</div>
		<div
			class="modal-backdrop bg-black/50"
			on:click={handleBackdropClick}
			on:keydown={() => {}}
		></div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.modal-box-custom {
		max-width: 72rem;
		width: 100%;
		max-height: 90vh;
		border: none;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
		outline: none;
		position: relative;
		border-radius: 1rem;
		padding: 0.5rem;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.close-button {
		position: absolute;
		right: 1rem;
		top: 1rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.3);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
		font-size: 1.5rem;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		z-index: 10;
		line-height: 1;
	}

	.close-button:hover {
		background-color: rgba(0, 0, 0, 0.5);
		border-color: rgba(255, 255, 255, 0.5);
		transform: scale(1.1);
	}

	.modal-content {
		width: 100%;
	}

	/* Remove margin and background from card inside modal */
	.modal-content :global(.dex-entry) {
		margin-bottom: 0;
		background-color: transparent !important;
		box-shadow: none;
	}

	@media (min-width: 768px) {
		.modal-box-custom {
			width: 91.666667%;
		}
	}
</style>
