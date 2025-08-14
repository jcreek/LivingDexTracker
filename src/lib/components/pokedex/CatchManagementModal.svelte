<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PokemonWithCatchStatus } from '$lib/types';

	export let pokemon: PokemonWithCatchStatus | null = null;
	export let isOpen = false;
	export let isShiny = false;

	const dispatch = createEventDispatcher<{
		save: {
			pokemon: PokemonWithCatchStatus;
			catchStatus: string;
			catchLocation: string;
			isGigantamax: boolean;
			originRegion: string;
			gameCaught: string;
			notes: string;
		};
		close: void;
	}>();

	let catchStatus = 'not_caught';
	let catchLocation = 'none';
	let isGigantamax = false;
	let originRegion = '';
	let gameCaught = '';
	let notes = '';

	// Reset form when pokemon changes
	$: if (pokemon && isOpen) {
		const record = pokemon.catchRecord;
		catchStatus = record?.catchStatus || 'not_caught';
		catchLocation = record?.catchLocation || 'none';
		isGigantamax = record?.isGigantamax || false;
		originRegion = record?.originRegion || '';
		gameCaught = record?.gameCaught || '';
		notes = record?.notes || '';
	}

	function handleSave() {
		if (!pokemon) return;

		dispatch('save', {
			pokemon,
			catchStatus,
			catchLocation,
			isGigantamax,
			originRegion,
			gameCaught,
			notes
		});
	}

	function handleClose() {
		dispatch('close');
	}

	// Check if pokemon can be Gigantamax (simplified check)
	$: canGigantamax =
		pokemon?.pokemon &&
		[
			'Charizard',
			'Butterfree',
			'Pikachu',
			'Meowth',
			'Machamp',
			'Gengar',
			'Kingler',
			'Lapras',
			'Eevee',
			'Snorlax',
			'Garbodor',
			'Corviknight',
			'Orbeetle',
			'Drednaw',
			'Coalossal',
			'Flapple',
			'Appletun',
			'Sandaconda',
			'Toxapex',
			'Centiskorch',
			'Hatterene',
			'Grimmsnarl',
			'Alcremie',
			'Copperajah',
			'Duraludon'
		].includes(pokemon.pokemon);
</script>

{#if isOpen && pokemon}
	<div class="modal modal-open" data-testid="catch-management-modal">
		<div class="modal-box max-w-2xl">
			<h3 class="font-bold text-lg mb-4">
				Manage {pokemon.pokemon} #{pokemon.pokedexNumber}
			</h3>

			<div class="space-y-4">
				<!-- Catch Status -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Catch Status</span>
					</label>
					<select
						bind:value={catchStatus}
						class="select select-bordered"
						data-testid="catch-status-select"
					>
						<option value="not_caught">Not Caught</option>
						<option value="caught">Caught</option>
						<option value="ready_to_evolve">Ready to Evolve</option>
					</select>
				</div>

				<!-- Catch Location -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Catch Location</span>
					</label>
					<div class="flex gap-4">
						<label class="cursor-pointer label justify-start gap-2">
							<input
								type="radio"
								bind:group={catchLocation}
								value="in_game"
								class="radio radio-primary"
								data-testid="location-in-game-radio"
							/>
							<span class="label-text">In Game</span>
						</label>
						<label class="cursor-pointer label justify-start gap-2">
							<input
								type="radio"
								bind:group={catchLocation}
								value="in_home"
								class="radio radio-primary"
								data-testid="location-in-home-radio"
							/>
							<span class="label-text">In HOME</span>
						</label>
					</div>
				</div>

				<!-- Origin Region -->
				<div class="form-control">
					<label class="label" for="origin-region">
						<span class="label-text">Origin Region</span>
					</label>
					<select
						id="origin-region"
						bind:value={originRegion}
						class="select select-bordered"
						data-testid="origin-region-select"
					>
						<option value="">Not Specified</option>
						<option value="kanto">Kanto</option>
						<option value="johto">Johto</option>
						<option value="hoenn">Hoenn</option>
						<option value="sinnoh">Sinnoh</option>
						<option value="unova">Unova</option>
						<option value="kalos">Kalos</option>
						<option value="alola">Alola</option>
						<option value="galar">Galar</option>
						<option value="paldea">Paldea</option>
					</select>
				</div>

				<!-- Game Caught In -->
				<div class="form-control">
					<label class="label" for="game-caught">
						<span class="label-text">Game Caught In</span>
					</label>
					<select
						id="game-caught"
						bind:value={gameCaught}
						class="select select-bordered"
						data-testid="game-caught-select"
					>
						<option value="">Not Specified</option>
						<option value="red">Pokémon Red</option>
						<option value="blue">Pokémon Blue</option>
						<option value="yellow">Pokémon Yellow</option>
						<option value="gold">Pokémon Gold</option>
						<option value="silver">Pokémon Silver</option>
						<option value="crystal">Pokémon Crystal</option>
						<option value="ruby">Pokémon Ruby</option>
						<option value="sapphire">Pokémon Sapphire</option>
						<option value="emerald">Pokémon Emerald</option>
						<option value="diamond">Pokémon Diamond</option>
						<option value="pearl">Pokémon Pearl</option>
						<option value="platinum">Pokémon Platinum</option>
						<option value="heartgold">Pokémon HeartGold</option>
						<option value="soulsilver">Pokémon SoulSilver</option>
						<option value="black">Pokémon Black</option>
						<option value="white">Pokémon White</option>
						<option value="black2">Pokémon Black 2</option>
						<option value="white2">Pokémon White 2</option>
						<option value="x">Pokémon X</option>
						<option value="y">Pokémon Y</option>
						<option value="omegaruby">Pokémon Omega Ruby</option>
						<option value="alphasapphire">Pokémon Alpha Sapphire</option>
						<option value="sun">Pokémon Sun</option>
						<option value="moon">Pokémon Moon</option>
						<option value="ultrasun">Pokémon Ultra Sun</option>
						<option value="ultramoon">Pokémon Ultra Moon</option>
						<option value="letsgopikachu">Let's Go Pikachu</option>
						<option value="letsgoeevee">Let's Go Eevee</option>
						<option value="sword">Pokémon Sword</option>
						<option value="shield">Pokémon Shield</option>
						<option value="brilliantdiamond">Brilliant Diamond</option>
						<option value="shiningpearl">Shining Pearl</option>
						<option value="legendsarceus">Legends Arceus</option>
						<option value="scarlet">Pokémon Scarlet</option>
						<option value="violet">Pokémon Violet</option>
					</select>
				</div>

				<!-- Gigantamax -->
				{#if canGigantamax}
					<div class="form-control">
						<label class="cursor-pointer label">
							<span class="label-text">Gigantamax Capable</span>
							<input
								type="checkbox"
								bind:checked={isGigantamax}
								class="checkbox checkbox-primary"
								data-testid="gigantamax-checkbox"
								name="gigantamax"
							/>
						</label>
					</div>
				{/if}

				<!-- Notes -->
				<div class="form-control">
					<label class="label" for="notes">
						<span class="label-text">Personal Notes</span>
					</label>
					<textarea
						id="notes"
						bind:value={notes}
						class="textarea textarea-bordered h-24"
						placeholder="Add personal notes about this catch..."
						data-testid="notes-textarea"
						name="notes"
					></textarea>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-outline" on:click={handleClose} data-testid="modal-cancel-button">
					Cancel
				</button>
				<button class="btn btn-primary" on:click={handleSave} data-testid="modal-save-button">
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
