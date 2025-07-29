<script lang="ts">
	export let currentPage: number;
	export let itemsPerPage: number;
	export let totalPages: number;

	function nextPage() {
		currentPage = Math.min(currentPage + 1, totalPages);
	}

	function previousPage() {
		currentPage = Math.max(currentPage - 1, 1);
	}
</script>

<div class="flex items-center space-x-4">
	<div class="flex items-center space-x-2">
		<label class="text-sm font-medium" for="itemsPerPage">Items per page:</label>
		<select id="itemsPerPage" class="select select-sm select-bordered" bind:value={itemsPerPage}>
			<option value={20}>20</option>
			<option value={50}>50</option>
			<option value={100}>100</option>
		</select>
	</div>

	<div class="flex items-center space-x-2">
		<button class="btn btn-sm btn-outline" on:click={previousPage} disabled={currentPage === 1}>
			«
		</button>
		<span class="text-sm font-medium px-3 py-2 bg-base-200 rounded">
			Page {currentPage} of {totalPages}
		</span>
		<button class="btn btn-sm btn-outline" on:click={nextPage} disabled={currentPage === totalPages}>
			»
		</button>
	</div>
</div>
