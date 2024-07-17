<script lang="ts">
	let show = false;

	function handleClick() {
		show = !show;
	}
</script>

<div class="relative inline-block">
	<div
		class="tooltip-trigger cursor-pointer"
		on:click={handleClick}
		on:mouseenter={() => (show = true)}
		on:mouseleave={() => (show = false)}
	>
		<slot name="hover-target" />
	</div>

	{#if show}
		<div class="tooltip-content absolute z-10 mt-2 w-52">
			<slot name="tooltip" />
		</div>
	{/if}
</div>

<style>
	.tooltip-content {
		@apply bg-gray-800 text-white text-sm p-2 rounded shadow-lg;
	}

	.tooltip-trigger:hover + .tooltip-content {
		display: block;
	}
	.tooltip-content {
		display: none;
	}
</style>
