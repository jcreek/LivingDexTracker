<script lang="ts">
	import { onMount } from 'svelte';
	import type { CatchRecord } from '$lib/models/CatchRecord';
	import type { CombinedData } from '$lib/models/CombinedData';
	import { calculateBoxPlacement } from '$lib/utils/boxPlacement';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	export let showShiny = false;
	export let combinedData: CombinedData[] | null;
	export let boxNumbers: number[] = [];
	export let creatingRecords = false;
	export let totalRecordsCreated = 0;
	export let failedToLoad = false;
	export let markBoxAsNotCaught = (boxNumber: number) => {};
	export let markBoxAsCaught = (boxNumber: number) => {};
	export let markBoxAsNeedsToEvolve = (boxNumber: number) => {};
	export let markBoxAsInHome = (boxNumber: number) => {};
	export let markBoxAsNotInHome = (boxNumber: number) => {};
	export let createCatchRecords = () => {};
	export let onPokemonClick: (pokemon: CombinedData) => void = () => {};

	let filterNotCaught = false;
	let filterNeedsToEvolve = false;
	let filterInHome = false;
	let filterNotInHome = false;

	// Bulk actions menu state (one open menu at a time)
	let openBulkMenuForBox: number | null = null;

	onMount(() => {
		const close = () => {
			openBulkMenuForBox = null;
		};
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});

	let filteredCombinedData: CombinedData[] = [];
	let filteredTotal = 0;
	let overallTotal = 0;
	let overallCaughtCount = 0;
	let overallNotCaughtCount = 0;
	let overallNeedsToEvolveCount = 0;
	let overallInHomeCount = 0;
	let overallNotInHomeCount = 0;
	let filtersActive = false;
	let filtersKey = '';

	function normalizedStatus(catchRecord: CatchRecord | null) {
		return {
			caught: !!catchRecord?.caught,
			needsToEvolve: !!catchRecord?.haveToEvolve,
			inHome: !!catchRecord?.inHome
		};
	}

	function matchesFilters(catchRecord: CatchRecord | null) {
		const status = normalizedStatus(catchRecord);
		if (!filtersActive) return true;

		const isCaught = status.caught || status.needsToEvolve;
		const isNotCaught = !isCaught;
		const isNeedsToEvolve = status.needsToEvolve;
		const isInHome = status.inHome;
		const isNotInHome = !status.inHome;

		// OR within each group, AND between groups.
		const progressGroupActive = filterNotCaught || filterNeedsToEvolve;
		const homeGroupActive = filterInHome || filterNotInHome;

		const progressMatch =
			!progressGroupActive ||
			(filterNotCaught && isNotCaught) ||
			(filterNeedsToEvolve && isNeedsToEvolve);

		const homeMatch =
			!homeGroupActive || (filterInHome && isInHome) || (filterNotInHome && isNotInHome);

		return progressMatch && homeMatch;
	}

	$: filtersActive = filterNotCaught || filterNeedsToEvolve || filterInHome || filterNotInHome;
	$: filtersKey = `${filterNotCaught}-${filterNeedsToEvolve}-${filterInHome}-${filterNotInHome}`;

	$: {
		// Ensure this recalculates when any filter changes (Svelte doesn't track function internals).
		filtersKey;
		filteredCombinedData = combinedData
			? combinedData.filter(({ catchRecord }) => matchesFilters(catchRecord))
			: [];
	}

	$: filteredTotal = filteredCombinedData.length;
	$: overallTotal = combinedData?.length ?? 0;

	$: overallCaughtCount = (combinedData ?? []).reduce((acc, { catchRecord }) => {
		const status = normalizedStatus(catchRecord);
		// Treat "needs to evolve" as a subset of "caught" (it is caught, just not finished).
		return acc + (status.caught || status.needsToEvolve ? 1 : 0);
	}, 0);

	$: overallNotCaughtCount = overallTotal - overallCaughtCount;

	$: overallNeedsToEvolveCount = (combinedData ?? []).reduce((acc, { catchRecord }) => {
		return acc + (normalizedStatus(catchRecord).needsToEvolve ? 1 : 0);
	}, 0);

	$: overallInHomeCount = (combinedData ?? []).reduce((acc, { catchRecord }) => {
		return acc + (normalizedStatus(catchRecord).inHome ? 1 : 0);
	}, 0);

	$: overallNotInHomeCount = overallTotal - overallInHomeCount;

	const BOX_VIEW_LAYOUT_STORAGE_KEY = 'livingdex:boxViewLayout:v1';
	type BoxViewLayout = 'comfortable' | 'compact' | 'ultra';
	let boxViewLayout: BoxViewLayout = 'comfortable';

	onMount(() => {
		try {
			const stored = localStorage.getItem(BOX_VIEW_LAYOUT_STORAGE_KEY);
			if (stored === 'comfortable' || stored === 'compact' || stored === 'ultra') {
				boxViewLayout = stored;
			}
		} catch {
			// ignore (privacy mode / disabled storage)
		}
	});

	function persistBoxViewLayout(next: BoxViewLayout) {
		boxViewLayout = next;
		try {
			localStorage.setItem(BOX_VIEW_LAYOUT_STORAGE_KEY, next);
		} catch {
			// ignore
		}
	}

	function onBoxViewLayoutChange(event: Event) {
		const next = (event.currentTarget as HTMLSelectElement).value;
		if (next === 'comfortable' || next === 'compact' || next === 'ultra') {
			persistBoxViewLayout(next);
		}
	}

	$: boxesPerRow = boxViewLayout === 'comfortable' ? 2 : boxViewLayout === 'compact' ? 3 : 4;
	$: cellPaddingRem =
		boxViewLayout === 'comfortable' ? 1 : boxViewLayout === 'compact' ? 0.6 : 0.45;
	$: spriteSizePx = boxViewLayout === 'comfortable' ? 64 : boxViewLayout === 'compact' ? 52 : 44;

	function cellStatusClasses(catchRecord: CatchRecord | null) {
		// Keep borders/layout unchanged; rely on clearer fills + badges instead.
		if (catchRecord?.caught) {
			// Match legend (green-600) while keeping sprites readable.
			return 'bg-green-600/15';
		}
		if (catchRecord?.haveToEvolve) {
			// Match legend (yellow-500) while keeping sprites readable.
			return 'bg-yellow-500/20';
		}
		return '';
	}

	function statusLabel(catchRecord: CatchRecord | null) {
		const parts: string[] = [];
		if (catchRecord?.caught) parts.push('Caught');
		if (catchRecord?.haveToEvolve) parts.push('Needs to evolve');
		if (catchRecord?.inHome) parts.push('In HOME');
		return parts.length ? parts.join(', ') : 'Not caught';
	}

	function cellBackgroundColourStyle(index: number, catchRecord: CatchRecord | null) {
		if (catchRecord?.caught || catchRecord?.haveToEvolve) {
			return '';
		} else {
			const placement = calculateBoxPlacement(index);
			if (placement.column % 2 === 0) {
				return 'background-color: #ffffff';
			} else {
				return 'background-color: #f9f9f9;';
			}
		}
	}

	function onInHomeFilterChange(event: Event) {
		const checked = (event.currentTarget as HTMLInputElement).checked;
		if (checked) filterNotInHome = false;
	}

	function onNotInHomeFilterChange(event: Event) {
		const checked = (event.currentTarget as HTMLInputElement).checked;
		if (checked) filterInHome = false;
	}
</script>

<main class="flex-1 p-4 w-full">
	<div class="max-w-fit mx-auto">
		{#if combinedData && combinedData.length > 0}
			<div class="container mx-auto">
				<div class="card bg-base-100 shadow mb-4">
					<div class="card-body p-4 flex flex-col gap-3">
						<div class="flex flex-wrap items-center gap-3">
							<label class="label p-0" for="box-view-layout">
								<span class="label-text font-semibold">Box view layout</span>
							</label>
							<select
								id="box-view-layout"
								class="select select-bordered select-sm"
								bind:value={boxViewLayout}
								on:change={onBoxViewLayoutChange}
								aria-label="Choose box view layout density"
							>
								<option value="comfortable">Comfortable (2 boxes/row)</option>
								<option value="compact">Compact (3 boxes/row)</option>
								<option value="ultra">Ultra (4 boxes/row)</option>
							</select>

							<div class="flex flex-wrap items-center gap-2 text-sm">
								<span class="font-semibold">Legend:</span>
								<span
									class="inline-flex items-center gap-1 rounded-full border border-green-700 bg-green-600 px-2 py-0.5 text-white"
								>
									<span class="status-badge status-badge--caught" aria-hidden="true">
										<svg
											class="status-icon"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#ffffff"
											stroke-width="3"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M5 13l4 4L19 7" />
										</svg>
									</span>
									<span>Caught</span>
								</span>
								<span
									class="inline-flex items-center gap-1 rounded-full border border-yellow-700 bg-yellow-500 px-2 py-0.5 text-white"
								>
									<span class="status-badge status-badge--evolve" aria-hidden="true">
										<svg
											class="status-icon"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#ffffff"
											stroke-width="3"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M12 19V5" />
											<path d="M5 12l7-7 7 7" />
										</svg>
									</span>
									<span>Caught but needs to evolve</span>
								</span>
								<span
									class="inline-flex items-center gap-1 rounded-full border border-sky-700 bg-sky-600 px-2 py-0.5 text-white"
								>
									<span class="status-badge status-badge--home" aria-hidden="true">
										<svg
											class="status-icon"
											viewBox="0 0 24 24"
											fill="#ffffff"
											stroke="#ffffff"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M12 3 3 10.5V21a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10.5L12 3Z" />
										</svg>
									</span>
									<span>In Home</span>
								</span>
							</div>
						</div>

						<div class="flex flex-col gap-3">
							<div class="flex flex-wrap items-center gap-4">
								<span class="font-semibold">Filters:</span>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterNotCaught}
									/>
									<span class="label-text">Not caught</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterNeedsToEvolve}
									/>
									<span class="label-text">Needs to evolve</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterInHome}
										on:change={onInHomeFilterChange}
									/>
									<span class="label-text">In HOME</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterNotInHome}
										on:change={onNotInHomeFilterChange}
									/>
									<span class="label-text">Not in HOME</span>
								</label>
							</div>

							<div
								class="flex flex-wrap items-center justify-between gap-2 rounded-box bg-base-200/60 px-3 py-2"
							>
								<div class="text-sm text-base-content/70">
									<span class="font-semibold text-base-content">Caught</span>
									{overallCaughtCount}
									<span class="mx-2">•</span>
									<span class="font-semibold text-base-content">Not caught</span>
									{overallNotCaughtCount}
									<span class="mx-2">•</span>
									<span class="font-semibold text-base-content">Needs to evolve</span>
									{overallNeedsToEvolveCount}
									<span class="mx-2">•</span>
									<span class="font-semibold text-base-content">In HOME</span>
									{overallInHomeCount}
									<span class="mx-2">•</span>
									<span class="font-semibold text-base-content">Not in HOME</span>
									{overallNotInHomeCount}
								</div>
								<div class="badge badge-outline">
									Showing {filteredTotal} of {overallTotal}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					class="boxes-grid"
					style="--boxes-per-row: {boxesPerRow}; --cell-padding: {cellPaddingRem}rem; --sprite-size: {spriteSizePx}px;"
				>
					{#each boxNumbers as boxNumber}
						<div class="mb-8">
							<div class="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-20">
								<h2 class="text-xl font-bold">Box {boxNumber}</h2>
								<div class="relative" on:click|stopPropagation>
									<button
										type="button"
										class="btn btn-sm btn-outline relative z-[210]"
										aria-label="Open bulk actions menu"
										aria-haspopup="menu"
										aria-expanded={openBulkMenuForBox === boxNumber}
										on:click={(event) => {
											event.stopPropagation();
											openBulkMenuForBox = openBulkMenuForBox === boxNumber ? null : boxNumber;
										}}
										on:keydown={(event) => {
											if (event.key === 'Escape') openBulkMenuForBox = null;
										}}
									>
										⋯
									</button>

									{#if openBulkMenuForBox === boxNumber}
										<ul
											class="menu bg-base-100 rounded-box absolute right-0 mt-2 z-[220] w-56 p-2 shadow border border-base-300"
											role="menu"
											on:click|stopPropagation
										>
											<li>
												<button
													on:click={() => {
														markBoxAsNotCaught(boxNumber);
														openBulkMenuForBox = null;
													}}
												>
													Mark box as Not caught
												</button>
											</li>
											<li>
												<button
													on:click={() => {
														markBoxAsCaught(boxNumber);
														openBulkMenuForBox = null;
													}}
												>
													Mark box as Caught
												</button>
											</li>
											<li>
												<button
													on:click={() => {
														markBoxAsNeedsToEvolve(boxNumber);
														openBulkMenuForBox = null;
													}}
												>
													Mark box as Needs to evolve
												</button>
											</li>
											<li>
												<button
													on:click={() => {
														markBoxAsInHome(boxNumber);
														openBulkMenuForBox = null;
													}}
												>
													Mark box as In HOME
												</button>
											</li>
											<li>
												<button
													on:click={() => {
														markBoxAsNotInHome(boxNumber);
														openBulkMenuForBox = null;
													}}
												>
													Mark box as Not in HOME
												</button>
											</li>
										</ul>
									{/if}
								</div>
							</div>
							<div class="grid grid-cols-6">
								{#each combinedData as { pokedexEntry, catchRecord }, index}
									{@const placement = calculateBoxPlacement(index)}
									{@const isFilteredOut =
										filtersActive && !!filtersKey && !matchesFilters(catchRecord)}
									{#if placement.box === boxNumber}
										<button
											type="button"
											class="pokemon-box {cellStatusClasses(catchRecord)} {isFilteredOut
												? 'pokemon-box--filtered-out'
												: 'hover:scale-105 hover:shadow-lg hover:z-50'} transition-all cursor-pointer relative"
											style="grid-column-start: {placement.column}; grid-row-start: {placement.row};
															{cellBackgroundColourStyle(index, catchRecord)}"
											aria-disabled={isFilteredOut}
											on:click={() => {
												if (!isFilteredOut) onPokemonClick({ pokedexEntry, catchRecord });
											}}
											aria-label="View details for {pokedexEntry.pokemon}. Status: {statusLabel(
												catchRecord
											)}"
										>
											<Tooltip>
												<div slot="hover-target" class="w-full h-full">
													{#if catchRecord?.caught}
														<span
															class="status-badge status-badge--caught absolute left-0.5 status-badge-top z-10"
															title="Caught"
														>
															<svg
																class="status-icon"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																stroke-width="3"
																stroke-linecap="round"
																stroke-linejoin="round"
																aria-hidden="true"
															>
																<path d="M5 13l4 4L19 7" />
															</svg>
															<span class="sr-only">Caught</span>
														</span>
													{:else if catchRecord?.haveToEvolve}
														<span
															class="status-badge status-badge--evolve absolute left-0.5 status-badge-top z-10"
															title="Caught but needs to evolve"
														>
															<svg
																class="status-icon"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																stroke-width="3"
																stroke-linecap="round"
																stroke-linejoin="round"
																aria-hidden="true"
															>
																<path d="M12 19V5" />
																<path d="M5 12l7-7 7 7" />
															</svg>
															<span class="sr-only">Caught but needs to evolve</span>
														</span>
													{/if}
													{#if catchRecord?.inHome}
														<span
															class="status-badge status-badge--home absolute right-0.5 status-badge-top z-10"
															title="In Pokémon HOME"
														>
															<svg
																class="status-icon"
																viewBox="0 0 24 24"
																fill="currentColor"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
																aria-hidden="true"
															>
																<path
																	d="M12 3 3 10.5V21a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10.5L12 3Z"
																/>
															</svg>
															<span class="sr-only">In HOME</span>
														</span>
													{/if}
													<div class="pokemon-box-inner">
														<PokemonSprite
															pokemonName={pokedexEntry.pokemon}
															pokedexNumber={pokedexEntry.pokedexNumber}
															form={pokedexEntry.form}
															shiny={showShiny}
														/>
														<span class="md:hidden">&#9432;</span>
													</div>
												</div>
												<div slot="tooltip">
													<div class="font-bold">
														{pokedexEntry.pokemon}
														{pokedexEntry.form ? `(${pokedexEntry.form})` : ''}
													</div>
													<div>{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</div>
													<div>
														Caught: {catchRecord?.caught ? 'Yes' : 'No'} <br />
														Caught but needs to Evolve: {catchRecord?.haveToEvolve ? 'Yes' : 'No'}
														<br />
														In Home: {catchRecord?.inHome ? 'Yes' : 'No'}
													</div>
												</div>
											</Tooltip>
										</button>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if failedToLoad}
			{#if creatingRecords && totalRecordsCreated > 0}
				<p>Processed {totalRecordsCreated} Pokédex entries so far...</p>
				<p>Please be patient, this may take some time.</p>
			{:else if creatingRecords}
				<p>Processing...</p>
				<p>Please be patient, this may take some time.</p>
			{:else}
				<h1>Failed to load</h1>
				<p>
					If you're seeing this, you probably haven't created your Pokédex data yet. Please do so by
					clicking this button.
				</p>
				<button class="btn" on:click={createCatchRecords}>Create Pokédex data</button>
			{/if}
		{:else}
			<div class="min-w-max mx-auto">
				<h1>Loading Pokédex</h1>
				<span class="loading loading-spinner loading-xl"></span>
			</div>
		{/if}
	</div>
</main>

<style>
	.boxes-grid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.boxes-grid {
			grid-template-columns: repeat(var(--boxes-per-row), minmax(0, 1fr));
		}
	}

	.pokemon-box {
		border: 1px solid #ddd;
		padding: 0;
		border-radius: 0;
	}

	.pokemon-box--filtered-out {
		opacity: 0.25;
		filter: grayscale(1);
		cursor: default;
	}

	.pokemon-box-inner {
		padding: var(--cell-padding, 1rem);
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.pokemon-box :global(img) {
		width: var(--sprite-size, 64px);
		height: var(--sprite-size, 64px);
		object-fit: contain;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 0.35rem;
		font-weight: 900;
		font-size: 0.8rem;
		line-height: 1;
		border: none;
		background: transparent;
	}

	.status-badge-top {
		top: 0.7rem;
	}

	.status-icon {
		width: 1rem;
		height: 1rem;
		display: block;
	}

	.status-badge--caught {
		color: #16a34a; /* green-600 */
	}

	.status-badge--evolve {
		color: #eab308; /* yellow-500 */
	}

	.status-badge--home {
		color: #0284c7; /* sky-600 */
	}
</style>
