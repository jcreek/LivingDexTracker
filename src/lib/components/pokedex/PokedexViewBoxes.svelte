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
</script>

<main class="flex-1 p-4 w-full">
	<div class="max-w-fit mx-auto">
		{#if combinedData && combinedData.length > 0}
			<div class="container mx-auto">
				<div class="flex flex-col gap-3 mb-4">
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
				</div>

				<div
					class="boxes-grid"
					style="--boxes-per-row: {boxesPerRow}; --cell-padding: {cellPaddingRem}rem; --sprite-size: {spriteSizePx}px;"
				>
					{#each boxNumbers as boxNumber}
						<div class="mb-8">
							<h2 class="text-xl font-bold mb-4">Box {boxNumber}</h2>
							<button class="btn" on:click={() => markBoxAsNotCaught(boxNumber)}>
								Mark box as not 'caught'
							</button>
							<button class="btn" on:click={() => markBoxAsCaught(boxNumber)}>
								Mark box as 'caught'
							</button>
							<button class="btn" on:click={() => markBoxAsNeedsToEvolve(boxNumber)}>
								Mark box as 'needs to evolve'
							</button>
							<button class="btn" on:click={() => markBoxAsInHome(boxNumber)}>
								Mark box as 'in Home'
							</button>
							<button class="btn" on:click={() => markBoxAsNotInHome(boxNumber)}>
								Mark box as not 'in Home'
							</button>
							<div class="grid grid-cols-6">
								{#each combinedData as { pokedexEntry, catchRecord }, index}
									{@const placement = calculateBoxPlacement(index)}
									{#if placement.box === boxNumber}
										<button
											type="button"
											class="pokemon-box {cellStatusClasses(
												catchRecord
											)} hover:scale-105 hover:shadow-lg hover:z-50 transition-all cursor-pointer relative"
											style="grid-column-start: {placement.column}; grid-row-start: {placement.row};
															{cellBackgroundColourStyle(index, catchRecord)}"
											on:click={() => onPokemonClick({ pokedexEntry, catchRecord })}
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
