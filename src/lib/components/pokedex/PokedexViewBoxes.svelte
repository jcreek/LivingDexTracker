<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { calculateBoxPlacement } from '$lib/utils/boxPlacement';
	import PokemonSprite from '$lib/components/PokemonSprite.svelte';
	import type { SharedCombinedData } from '$lib/models/SharedPokedex';
	import type { PokedexGridRow } from '$lib/models/PokedexGridRow';
	import { markGridInteractive } from '$lib/utils/criticalPageWork';

	export let virtualize = false;
	export let retryLoad: (() => void) | null = null;
	let renderAll = false;
	let visibleBoxes = new Set([1, 2, 3, 4]);
	let focusedBox: number | null = null;
	let grid: HTMLDivElement;
	const shells = new Map<number, HTMLElement>();
	let viewportFrame = 0;
	let mounted = false;
	export let gridKey = '';
	let markedKey: string | null = null;
	let scrollAnchor: { number: number; top: number } | null = null;

	function measureViewport() {
		viewportFrame = 0;
		const next = new Set<number>();
		scrollAnchor = null;
		for (const [number, node] of shells) {
			const rect = node.getBoundingClientRect();
			if (!scrollAnchor && rect.bottom > 0) scrollAnchor = { number, top: rect.top };
			const overscan = rect.height + 16;
			if (rect.bottom >= -overscan && rect.top <= window.innerHeight + overscan) next.add(number);
		}
		visibleBoxes = next;
	}
	function resizeViewport() {
		if (scrollAnchor && window.scrollY > 0) {
			const node = shells.get(scrollAnchor.number);
			if (node) window.scrollBy(0, node.getBoundingClientRect().top - scrollAnchor.top);
		}
		scheduleViewport();
	}
	function trackFocus(event: FocusEvent) {
		const target = event.target instanceof Element ? event.target : null;
		if (!target?.closest('[data-box-number], [role="dialog"]')) focusedBox = null;
	}
	function scheduleViewport() {
		if (!viewportFrame) viewportFrame = requestAnimationFrame(measureViewport);
	}
	function boxShell(node: HTMLElement, number: number) {
		shells.set(number, node);
		scheduleViewport();
		return {
			destroy() {
				shells.delete(number);
			}
		};
	}
	async function focusEntry(index: number) {
		if (!combinedData || index < 0 || index >= combinedData.length) return;
		focusedBox = Math.floor(index / 30) + 1;
		await tick();
		grid.querySelector<HTMLElement>(`[data-entry-index="${index}"]`)?.focus();
	}
	function navigateEntry(event: KeyboardEvent, index: number) {
		const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -6, ArrowDown: 6 }[event.key];
		if (offset !== undefined) {
			event.preventDefault();
			void focusEntry(index + offset);
		} else if (event.key === 'Tab') {
			const next = index + (event.shiftKey ? -1 : 1);
			if (
				next >= 0 &&
				next < (combinedData?.length ?? 0) &&
				!grid.querySelector(`[data-entry-index="${next}"]`)
			) {
				event.preventDefault();
				void focusEntry(next);
			}
		}
	}
	$: if (mounted && combinedData && gridKey !== markedKey) {
		markedKey = gridKey;
		grid?.removeAttribute('data-grid-interactive');
		void tick().then(() => {
			if (virtualize) markGridInteractive();
		});
	}
	onMount(() => {
		mounted = true;
		const observer = new ResizeObserver(resizeViewport);
		if (grid) observer.observe(grid);
		window.addEventListener('scroll', scheduleViewport, { passive: true });
		window.addEventListener('resize', resizeViewport);
		window.addEventListener('focusin', trackFocus);
		measureViewport();
		return () => {
			observer.disconnect();
			cancelAnimationFrame(viewportFrame);
			window.removeEventListener('scroll', scheduleViewport);
			window.removeEventListener('resize', resizeViewport);
			window.removeEventListener('focusin', trackFocus);
		};
	});

	export let showShiny = false;
	type DisplayData = PokedexGridRow | SharedCombinedData;
	type DisplayStatus = DisplayData['catchRecord'];

	export let combinedData: DisplayData[] | null;
	export let readOnly = false;
	export let boxNumbers: number[] = [];
	export let creatingRecords = false;
	export let totalRecordsCreated = 0;
	export let failedToLoad = false;
	export let markBoxAsNotCaught: (boxNumber: number) => void = () => {};
	export let markBoxAsCaught: (boxNumber: number) => void = () => {};
	export let markBoxAsNeedsToEvolve: (boxNumber: number) => void = () => {};
	export let markBoxAsInHome: (boxNumber: number) => void = () => {};
	export let markBoxAsNotInHome: (boxNumber: number) => void = () => {};
	export let createCatchRecords = () => {};
	export let onPokemonClick: (pokemon: DisplayData) => void = () => {};

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

	let filteredCombinedData: DisplayData[] = [];
	let filteredTotal = 0;
	let overallTotal = 0;
	let overallCaughtCount = 0;
	let overallNotCaughtCount = 0;
	let overallNeedsToEvolveCount = 0;
	let overallInHomeCount = 0;
	let overallNotInHomeCount = 0;
	let filtersActive = false;
	let filtersKey = '';

	function normalizedStatus(catchRecord: DisplayStatus) {
		return {
			caught: !!catchRecord?.caught,
			needsToEvolve: !!catchRecord?.haveToEvolve,
			inHome: !!catchRecord?.inHome
		};
	}

	function matchesFilters(catchRecord: DisplayStatus) {
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
	export let initialLayout: BoxViewLayout = 'comfortable';
	let boxViewLayout: BoxViewLayout = initialLayout;

	function persistBoxViewLayout(next: BoxViewLayout) {
		const anchor = [...shells.entries()].find(
			([, node]) => node.getBoundingClientRect().bottom > 0
		);
		const top = anchor?.[1].getBoundingClientRect().top;
		boxViewLayout = next;
		document.cookie = `boxViewLayout=${next};path=/;max-age=31536000;SameSite=Lax`;
		void tick().then(() => {
			if (anchor && top !== undefined && window.scrollY > 0)
				window.scrollBy(0, anchor[1].getBoundingClientRect().top - top);
			measureViewport();
		});
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

	function cellStatusClasses(catchRecord: DisplayStatus) {
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

	function statusLabel(catchRecord: DisplayStatus) {
		const parts: string[] = [];
		if (catchRecord?.caught) parts.push('Caught');
		if (catchRecord?.haveToEvolve) parts.push('Needs to evolve');
		if (catchRecord?.inHome) parts.push('In HOME');
		return parts.length ? parts.join(', ') : 'Not caught';
	}

	function cellBackgroundColourStyle(index: number, catchRecord: DisplayStatus) {
		if (catchRecord?.caught || catchRecord?.haveToEvolve) {
			return '';
		} else {
			const placement = calculateBoxPlacement(index);
			if (placement.column % 2 === 0) {
				return 'background-color: var(--ld-box-bg-even);';
			} else {
				return 'background-color: var(--ld-box-bg-odd);';
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

	const POKEMON_PER_BOX = 30;
	const BOX_POSITIONS = Array.from({ length: POKEMON_PER_BOX }, (_, i) => i);
</script>

<main class="flex-1 p-4 w-full">
	<div class="max-w-[1440px] w-full mx-auto">
		{#if combinedData && combinedData.length > 0}
			<div class="container mx-auto">
				<div class="card bg-base-100 shadow mb-4">
					<div class="card-body p-4 flex flex-col gap-3">
						<div class="flex flex-wrap items-center gap-3">
							<label class="label p-0" for="box-view-layout">
								<span class="label-text font-semibold">Box view layout</span>
							</label>
							<select
								data-offline-action
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
							{#if virtualize}
								<label class="label cursor-pointer gap-2"
									><input
										data-offline-action
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={renderAll}
									/>Render all boxes</label
								>
							{/if}

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
										data-offline-action
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterNotCaught}
									/>
									<span class="label-text">Not caught</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										data-offline-action
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterNeedsToEvolve}
									/>
									<span class="label-text">Needs to evolve</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										data-offline-action
										type="checkbox"
										class="checkbox checkbox-sm"
										bind:checked={filterInHome}
										on:change={onInHomeFilterChange}
									/>
									<span class="label-text">In HOME</span>
								</label>
								<label class="label cursor-pointer gap-2 p-0">
									<input
										data-offline-action
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
					bind:this={grid}
					class="boxes-grid"
					style="--boxes-per-row: {boxesPerRow}; --cell-padding: {cellPaddingRem}rem; --sprite-size: {spriteSizePx}px;"
				>
					{#each boxNumbers as boxNumber (boxNumber)}
						{@const bulkMenuId = `box-${boxNumber}-bulk-menu`}
						<div class="box-shell" use:boxShell={boxNumber} data-box-number={boxNumber}>
							{#if !virtualize || renderAll || visibleBoxes.has(boxNumber) || focusedBox === boxNumber}
								<div class="box-content">
									<div
										class="box-heading flex items-center justify-between gap-3 mb-4 relative z-20"
									>
										<h2 class="text-xl font-bold">Box {boxNumber}</h2>
										{#if !readOnly}<div class="relative">
												<button
													type="button"
													class="btn btn-sm btn-outline relative z-[210]"
													aria-label="Open bulk actions menu"
													aria-haspopup="menu"
													aria-controls={bulkMenuId}
													aria-expanded={openBulkMenuForBox === boxNumber}
													on:click={(event) => {
														event.stopPropagation();
														openBulkMenuForBox =
															openBulkMenuForBox === boxNumber ? null : boxNumber;
													}}
													on:keydown={(event) => {
														if (event.key === 'Escape') openBulkMenuForBox = null;
													}}
												>
													⋯
												</button>

												{#if openBulkMenuForBox === boxNumber}
													<ul
														id={bulkMenuId}
														class="menu bg-base-100 rounded-box absolute right-0 mt-2 z-[220] w-56 p-2 shadow border border-base-300"
													>
														<li>
															<button
																type="button"
																on:click|stopPropagation={() => {
																	markBoxAsNotCaught(boxNumber);
																	openBulkMenuForBox = null;
																}}
															>
																Mark box as Not caught
															</button>
														</li>
														<li>
															<button
																type="button"
																on:click|stopPropagation={() => {
																	markBoxAsCaught(boxNumber);
																	openBulkMenuForBox = null;
																}}
															>
																Mark box as Caught
															</button>
														</li>
														<li>
															<button
																type="button"
																on:click|stopPropagation={() => {
																	markBoxAsNeedsToEvolve(boxNumber);
																	openBulkMenuForBox = null;
																}}
															>
																Mark box as Needs to evolve
															</button>
														</li>
														<li>
															<button
																type="button"
																on:click|stopPropagation={() => {
																	markBoxAsInHome(boxNumber);
																	openBulkMenuForBox = null;
																}}
															>
																Mark box as In HOME
															</button>
														</li>
														<li>
															<button
																type="button"
																on:click|stopPropagation={() => {
																	markBoxAsNotInHome(boxNumber);
																	openBulkMenuForBox = null;
																}}
															>
																Mark box as Not in HOME
															</button>
														</li>
													</ul>
												{/if}
											</div>{/if}
									</div>
									<div class="grid grid-cols-6">
										{#each BOX_POSITIONS as positionInBox}
											{@const globalIndex = (boxNumber - 1) * POKEMON_PER_BOX + positionInBox}
											{@const placement = calculateBoxPlacement(globalIndex)}
											{@const entry = combinedData?.[globalIndex]}
											{@const pokedexEntry = entry?.pokedexEntry}
											{@const catchRecord = entry?.catchRecord ?? null}
											{@const isFilteredOut =
												!!entry && filtersActive && !!filtersKey && !matchesFilters(catchRecord)}
											{#if entry && pokedexEntry}
												<button
													type="button"
													class="pokemon-box {cellStatusClasses(catchRecord)} {isFilteredOut
														? 'pokemon-box--filtered-out'
														: 'hover:scale-105 hover:shadow-lg hover:z-50'} transition-all cursor-pointer relative"
													style="grid-column-start: {placement.column}; grid-row-start: {placement.row};
															{cellBackgroundColourStyle(globalIndex, catchRecord)}"
													data-offline-action
													data-entry-index={globalIndex}
													data-entry-id={pokedexEntry._id}
													on:focus={() => (focusedBox = boxNumber)}
													on:keydown={(event) => navigateEntry(event, globalIndex)}
													aria-disabled={isFilteredOut}
													on:click={() => {
														if (!isFilteredOut) onPokemonClick(entry);
													}}
													aria-label="View details for {pokedexEntry.pokemon}{pokedexEntry.form
														? ` (${pokedexEntry.form})`
														: ''}. Status: {statusLabel(catchRecord)}"
												>
													<span class="cell-tooltip">
														<span class="block w-full h-full">
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
																	spriteKey={pokedexEntry.spriteKey}
																	shiny={showShiny}
																	variant="grid"
																/>
															</div>
														</span>
														<span class="cell-tooltip-text" role="tooltip">
															<div class="font-bold">
																{pokedexEntry.pokemon}
																{pokedexEntry.form ? `(${pokedexEntry.form})` : ''}
															</div>
															<div>{pokedexEntry.pokedexNumber.toString().padStart(3, '0')}</div>
															<div>
																Caught: {catchRecord?.caught ? 'Yes' : 'No'} <br />
																Caught but needs to Evolve: {catchRecord?.haveToEvolve
																	? 'Yes'
																	: 'No'}
																<br />
																In Home: {catchRecord?.inHome ? 'Yes' : 'No'}
															</div>
														</span>
													</span>
												</button>
											{:else}
												<button
													type="button"
													class="pokemon-box pokemon-box--empty"
													disabled
													style="grid-column-start: {placement.column}; grid-row-start: {placement.row};
															{cellBackgroundColourStyle(globalIndex, null)}"
													aria-label="Empty box slot"
												>
													<div class="pokemon-box-inner" aria-hidden="true">
														<span class="sprite-placeholder" />
													</div>
												</button>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if failedToLoad}
			{#if retryLoad}
				<p role="alert">Unable to load Pokédex.</p>
				<button class="btn" on:click={retryLoad}>Retry loading Pokédex</button>
			{:else if creatingRecords && totalRecordsCreated > 0}
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
				{#if !readOnly}
					<button class="btn" on:click={createCatchRecords}>Create Pokédex data</button>
				{/if}
			{/if}
		{:else if combinedData}
			<p>No entries match this Pokédex.</p>
		{:else}
			<div class="min-w-max mx-auto">
				<h1>Loading Pokédex</h1>
				<span class="loading loading-spinner loading-xl"></span>
			</div>
		{/if}
	</div>
</main>

<style>
	.box-shell {
		position: relative;
		min-width: 0;
	}
	.box-shell::before {
		content: '';
		display: block;
		padding-top: calc(83.333333% + 80px);
	}
	.box-content {
		position: absolute;
		inset: 0 0 32px;
	}
	.box-heading {
		height: 32px;
	}
	.cell-tooltip {
		display: block;
		width: 100%;
		height: 100%;
	}
	.cell-tooltip-text {
		display: none;
		position: absolute;
		z-index: 100;
		pointer-events: none;
		background: #1f2937;
		color: white;
		border-radius: 4px;
		padding: 8px;
		width: 13rem;
	}
	.pokemon-box:hover .cell-tooltip-text,
	.pokemon-box:focus-visible .cell-tooltip-text {
		display: block;
	}

	/*
		Theme-aware backgrounds for non-caught box slots.
		- Light mode (`pokeball`) keeps the original exact colors.
		- Dark mode maps to DaisyUI theme base tokens so it stays consistent with the active theme.
	*/
	:global(:root) {
		--ld-box-bg-even: var(--fallback-b1, oklch(var(--b1) / 1));
		--ld-box-bg-odd: var(--fallback-b3, oklch(var(--b3) / 1));
	}

	:global([data-theme='pokeball']) {
		--ld-box-bg-even: #ffffff;
		--ld-box-bg-odd: #f9f9f9;
	}

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
		/*
			On small screens the grid columns get narrow; without an explicit ratio,
			the button height becomes content-driven (padding + sprite) and you end up
			with rectangular cells. Force each slot to be square.
		*/
		aspect-ratio: 1 / 1;
		width: 100%;
	}

	.pokemon-box--filtered-out {
		opacity: 0.25;
		filter: grayscale(1);
		cursor: default;
	}

	.pokemon-box--empty {
		opacity: 0.55;
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
		max-width: 100%;
		max-height: 100%;
		display: block;
		object-fit: contain;
	}

	.sprite-placeholder {
		width: var(--sprite-size, 64px);
		height: var(--sprite-size, 64px);
		max-width: 100%;
		max-height: 100%;
		display: block;
	}

	/* Mobile: keep 6 columns but prevent sprite/padding from forcing tall cells */
	@media (max-width: 767px) {
		.pokemon-box-inner {
			/* cap padding so the sprite can fit inside small squares */
			padding: min(var(--cell-padding, 1rem), 0.35rem);
		}

		.pokemon-box :global(img) {
			/* allow the sprite to shrink with the square cell */
			width: min(var(--sprite-size, 64px), 100%);
			height: min(var(--sprite-size, 64px), 100%);
		}

		.sprite-placeholder {
			width: min(var(--sprite-size, 64px), 100%);
			height: min(var(--sprite-size, 64px), 100%);
		}

		.status-badge {
			width: 0.95rem;
			height: 0.95rem;
		}

		.status-badge-top {
			top: 0.35rem;
		}

		.status-icon {
			width: 0.85rem;
			height: 0.85rem;
		}
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
