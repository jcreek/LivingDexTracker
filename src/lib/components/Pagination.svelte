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

	function setItemsPerPage(event: any) {
		itemsPerPage = parseInt(event.target.value, 10);
	}
</script>

<div>
	<button on:click={previousPage} disabled={currentPage === 1}>Previous</button>
	<button on:click={nextPage} disabled={currentPage === totalPages}>Next</button>

	<label for="itemsPerPage">Items per page:</label>
	<select id="itemsPerPage" on:change={setItemsPerPage}>
		<option value="20">20</option>
		<option value="50">50</option>
		<option value="100">100</option>
	</select>
</div>
