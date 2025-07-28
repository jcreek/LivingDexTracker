#!/usr/bin/env node

/**
 * Comprehensive Pokémon Data Fetcher for Living Dex Tracker
 *
 * This script fetches ALL Pokémon from PokéAPI (1-1025+) including:
 * - All species and their forms
 * - Regional pokédex numbers from all regions
 * - Form variations that matter for Living Dex
 * - Proper box placement data
 *
 * Generates a complete seed migration file for the database.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PokemonDataFetcher {
	constructor() {
		this.baseUrl = 'https://pokeapi.co/api/v2';
		this.allPokemon = [];
		this.allSpecies = [];
		this.allPokedexes = [];
		this.delay = 100; // Delay between API calls to be respectful
	}

	// Make HTTP request with promise
	makeRequest(url) {
		return new Promise((resolve, reject) => {
			https
				.get(url, (res) => {
					let data = '';
					res.on('data', (chunk) => (data += chunk));
					res.on('end', () => {
						try {
							resolve(JSON.parse(data));
						} catch (e) {
							reject(e);
						}
					});
				})
				.on('error', reject);
		});
	}

	// Sleep function for rate limiting
	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Fetch all pokédex data to get regional numbers
	async fetchAllPokedexes() {
		console.log('Fetching pokédex data...');

		// Regional pokédex mapping based on our database schema
		const pokedexMapping = {
			kanto: 'kanto_number',
			'original-johto': 'johto_number',
			hoenn: 'hoenn_number',
			'original-sinnoh': 'sinnoh_number',
			'extended-sinnoh': 'sinnoh_extended_number',
			'original-unova': 'unova_number',
			'extended-unova': 'unova_updated_number',
			'kalos-central': 'kalos_central_number',
			'kalos-coastal': 'kalos_coastal_number',
			'kalos-mountain': 'kalos_mountain_number',
			'updated-hoenn': 'hoenn_updated_number',
			'original-alola': 'alola_number',
			'updated-alola': 'alola_updated_number',
			'melemele-alola': 'melemele_number',
			'akala-alola': 'akala_number',
			'ulaula-alola': 'ulaula_number',
			'poni-alola': 'poni_number',
			galar: 'galar_number',
			'isle-of-armor': 'isle_armor_number',
			'crown-tundra': 'crown_tundra_number',
			hisui: 'hisui_number',
			paldea: 'paldea_number',
			kitakami: 'kitakami_number',
			blueberry: 'blueberry_number'
		};

		for (const [pokedexName, columnName] of Object.entries(pokedexMapping)) {
			try {
				console.log(`Fetching pokédex: ${pokedexName}`);
				const pokedexData = await this.makeRequest(`${this.baseUrl}/pokedex/${pokedexName}`);

				const regionalNumbers = {};
				pokedexData.pokemon_entries.forEach((entry) => {
					const speciesId = this.extractIdFromUrl(entry.pokemon_species.url);
					regionalNumbers[speciesId] = entry.entry_number;
				});

				this.allPokedexes.push({
					name: pokedexName,
					columnName: columnName,
					regionalNumbers: regionalNumbers
				});

				await this.sleep(this.delay);
			} catch (error) {
				console.warn(`Could not fetch pokédx ${pokedexName}:`, error.message);
				// Continue with other pokédxes even if one fails
			}
		}
	}

	// Extract ID from PokéAPI URL
	extractIdFromUrl(url) {
		const matches = url.match(/\/(\d+)\/$/);
		return matches ? parseInt(matches[1]) : null;
	}

	// Fetch all Pokémon species (1-1025+)
	async fetchAllSpecies() {
		console.log('Fetching all Pokémon species...');

		// First, get the species list to determine the actual range
		const speciesList = await this.makeRequest(`${this.baseUrl}/pokemon-species?limit=2000`);
		const maxSpeciesId = Math.max(...speciesList.results.map((s) => this.extractIdFromUrl(s.url)));

		console.log(`Found ${speciesList.results.length} species, max ID: ${maxSpeciesId}`);

		for (let i = 1; i <= maxSpeciesId; i++) {
			try {
				console.log(`Fetching species ${i}/${maxSpeciesId}`);
				const species = await this.makeRequest(`${this.baseUrl}/pokemon-species/${i}`);
				this.allSpecies.push(species);
				await this.sleep(this.delay);
			} catch (error) {
				console.warn(`Could not fetch species ${i}:`, error.message);
				// Continue with next species
			}
		}
	}

	// Fetch all Pokémon forms for each species
	async fetchAllPokemon() {
		console.log('Fetching all Pokémon forms...');

		for (const species of this.allSpecies) {
			try {
				// Get all varieties (forms) of this species
				for (const variety of species.varieties) {
					const pokemonId = this.extractIdFromUrl(variety.pokemon.url);
					console.log(`Fetching Pokémon form: ${variety.pokemon.name}`);

					const pokemon = await this.makeRequest(`${this.baseUrl}/pokemon/${pokemonId}`);

					// Enhance with species data
					pokemon.species_data = species;
					pokemon.variety_data = variety;

					this.allPokemon.push(pokemon);
					await this.sleep(this.delay);
				}
			} catch (error) {
				console.warn(`Could not fetch Pokémon for species ${species.name}:`, error.message);
			}
		}
	}

	// Determine if a form should be included in Living Dex
	shouldIncludeForm(pokemon) {
		const formName = pokemon.forms[0]?.form_name || '';
		const pokemonName = pokemon.name;

		// Always include default forms
		if (!formName || formName === 'default') return true;

		// Include these form types for Living Dex
		const includedForms = [
			'alolan',
			'galarian',
			'hisuian',
			'paldean', // Regional forms
			'mega',
			'mega-x',
			'mega-y', // Mega evolutions
			'gigantamax', // Gigantamax forms
			'origin',
			'incarnate',
			'therian', // Legendary forms
			'red-flower',
			'yellow-flower',
			'blue-flower',
			'white-flower',
			'orange-flower', // Floette
			'plant',
			'sandy',
			'trash', // Wormadam
			'heat',
			'wash',
			'frost',
			'fan',
			'mow', // Rotom
			'altered',
			'origin', // Giratina
			'land',
			'sky', // Shaymin
			'aria',
			'pirouette', // Meloetta
			'ordinary',
			'resolute', // Keldeo
			'red-striped',
			'blue-striped', // Basculin
			'standard',
			'zen', // Darmanitan
			'shield',
			'blade', // Aegislash
			'average',
			'small',
			'large',
			'super', // Pumpkaboo/Gourgeist
			'baile',
			'pom-pom',
			'pau',
			'sensu', // Oricorio
			'midday',
			'midnight',
			'dusk', // Lycanroc
			'disguised',
			'busted', // Mimikyu
			'solo',
			'school', // Wishiwashi
			'red-meteor',
			'orange-meteor',
			'yellow-meteor',
			'green-meteor',
			'blue-meteor',
			'indigo-meteor',
			'violet-meteor', // Minior
			'gulping',
			'gorging', // Cramorant
			'ice',
			'noice', // Eiscue
			'full-belly',
			'hangry', // Morpeko
			'single-strike',
			'rapid-strike', // Urshifu
			'rider',
			'steed', // Calyrex
			'10',
			'50',
			'100', // Zygarde
			'complete', // Zygarde
			'original-color',
			'white',
			'orange',
			'yellow',
			'green',
			'blue',
			'indigo',
			'purple', // Magearna
			'family-of-three',
			'family-of-four', // Maushold
			'curly',
			'droopy',
			'stretchy', // Tatsugiri
			'counterfeit',
			'artisan',
			'masterpiece', // Sinistcha
			'unremarkable',
			'masterpiece', // Poltchageist
			'male',
			'female' // Gender differences where significant
		];

		// Check if this form should be included
		return includedForms.some((form) => formName.includes(form) || pokemonName.includes(form));
	}

	// Calculate box placement for Living Dex
	calculateBoxPlacement(pokemon, includeFormsView = false) {
		const dexNumber =
			pokemon.species_data.pokedex_numbers.find((p) => p.pokedex.name === 'national')
				?.entry_number || pokemon.id;

		if (includeFormsView) {
			// For forms view, we need to account for multiple forms per species
			// This is complex and depends on form ordering - for now use simple calculation
			const formsOffset = this.getFormsOffset(pokemon);
			const adjustedNumber = dexNumber + formsOffset;

			return {
				box: Math.ceil(adjustedNumber / 30),
				row: Math.ceil((adjustedNumber % 30) / 6) || 5,
				column: ((adjustedNumber - 1) % 6) + 1
			};
		} else {
			// For no-forms view, use species dex number only
			return {
				box: Math.ceil(dexNumber / 30),
				row: Math.ceil((dexNumber % 30) / 6) || 5,
				column: ((dexNumber - 1) % 6) + 1
			};
		}
	}

	// Get offset for forms (simplified - would need more complex logic for exact placement)
	getFormsOffset(pokemon) {
		const formName = pokemon.forms[0]?.form_name || '';
		if (!formName || formName === 'default') return 0;

		// Simple offset based on form type
		const formOffsets = {
			alolan: 0.1,
			galarian: 0.2,
			hisuian: 0.3,
			paldean: 0.4,
			mega: 0.5,
			gigantamax: 0.6,
			male: 0.7,
			female: 0.8
		};

		for (const [form, offset] of Object.entries(formOffsets)) {
			if (formName.includes(form)) return offset;
		}

		return 0.9; // Default offset for other forms
	}

	// Get regional pokédx numbers for a species
	getRegionalNumbers(speciesId) {
		const regionalNumbers = {};

		for (const pokedex of this.allPokedexes) {
			const number = pokedex.regionalNumbers[speciesId];
			if (number) {
				regionalNumbers[pokedex.columnName] = number;
			}
		}

		return regionalNumbers;
	}

	// Generate form name for database
	getFormName(pokemon) {
		const formName = pokemon.forms[0]?.form_name;
		if (!formName || formName === 'default') return null;

		// Clean up form name for database
		return formName.replace(/-/g, ' ').toLowerCase();
	}

	// Generate the SQL migration file
	generateMigration() {
		console.log('Generating migration file...');

		const entries = [];

		for (const pokemon of this.allPokemon) {
			if (!this.shouldIncludeForm(pokemon)) continue;

			const dexNumber =
				pokemon.species_data.pokedex_numbers.find((p) => p.pokedex.name === 'national')
					?.entry_number || pokemon.id;
			const formName = this.getFormName(pokemon);
			const regionalNumbers = this.getRegionalNumbers(pokemon.species_data.id);

			// Box placement
			const boxPlacement = this.calculateBoxPlacement(pokemon, false);
			const formsBoxPlacement = this.calculateBoxPlacement(pokemon, true);

			// Can Gigantamax?
			const canGigantamax =
				pokemon.name.includes('gigantamax') ||
				pokemon.forms.some((f) => f.form_name?.includes('gigantamax'));

			const entry = {
				pokedexNumber: dexNumber,
				pokemon: pokemon.species_data.name,
				form: formName,
				canGigantamax: canGigantamax,
				...regionalNumbers,
				boxPlacementBox: boxPlacement.box,
				boxPlacementRow: boxPlacement.row,
				boxPlacementColumn: boxPlacement.column,
				boxPlacementFormsBox: formsBoxPlacement.box,
				boxPlacementFormsRow: formsBoxPlacement.row,
				boxPlacementFormsColumn: formsBoxPlacement.column
			};

			entries.push(entry);
		}

		// Sort by dex number, then by form
		entries.sort((a, b) => {
			if (a.pokedexNumber !== b.pokedexNumber) {
				return a.pokedexNumber - b.pokedexNumber;
			}
			// Sort forms: default (null) first, then alphabetically
			if (a.form === null && b.form !== null) return -1;
			if (a.form !== null && b.form === null) return 1;
			if (a.form === null && b.form === null) return 0;
			return a.form.localeCompare(b.form);
		});

		// Generate SQL
		let sql = `-- Complete Pokémon seed data for Living Dex Tracker
-- Generated by fetch-all-pokemon.js script
-- Includes ALL Pokémon from PokéAPI (1-${Math.max(...entries.map((e) => e.pokedexNumber))})
-- Total entries: ${entries.length}
-- All old regional number columns set to NULL for new normalized structure

INSERT INTO pokedex_entries (
  "pokedexNumber", 
  pokemon, 
  form, 
  "canGigantamax",
  kanto_number,
  johto_number,
  hoenn_number,
  sinnoh_number,
  sinnoh_extended_number,
  unova_number,
  unova_updated_number,
  kalos_central_number,
  kalos_coastal_number,
  kalos_mountain_number,
  hoenn_updated_number,
  alola_number,
  alola_updated_number,
  melemele_number,
  akala_number,
  ulaula_number,
  poni_number,
  galar_number,
  isle_armor_number,
  crown_tundra_number,
  hisui_number,
  paldea_number,
  kitakami_number,
  blueberry_number,
  "boxPlacementBox",
  "boxPlacementRow", 
  "boxPlacementColumn",
  "boxPlacementFormsBox",
  "boxPlacementFormsRow",
  "boxPlacementFormsColumn"
) VALUES\n`;

		const valueRows = entries.map((entry) => {
			const values = [
				entry.pokedexNumber,
				`'${entry.pokemon.replace(/'/g, "''")}'`, // Escape single quotes
				entry.form ? `'${entry.form.replace(/'/g, "''")}'` : 'NULL',
				entry.canGigantamax ? 'TRUE' : 'FALSE',
				entry.kanto_number || 'NULL',
				entry.johto_number || 'NULL',
				entry.hoenn_number || 'NULL',
				entry.sinnoh_number || 'NULL',
				entry.sinnoh_extended_number || 'NULL',
				entry.unova_number || 'NULL',
				entry.unova_updated_number || 'NULL',
				entry.kalos_central_number || 'NULL',
				entry.kalos_coastal_number || 'NULL',
				entry.kalos_mountain_number || 'NULL',
				entry.hoenn_updated_number || 'NULL',
				entry.alola_number || 'NULL',
				entry.alola_updated_number || 'NULL',
				entry.melemele_number || 'NULL',
				entry.akala_number || 'NULL',
				entry.ulaula_number || 'NULL',
				entry.poni_number || 'NULL',
				entry.galar_number || 'NULL',
				entry.isle_armor_number || 'NULL',
				entry.crown_tundra_number || 'NULL',
				entry.hisui_number || 'NULL',
				entry.paldea_number || 'NULL',
				entry.kitakami_number || 'NULL',
				entry.blueberry_number || 'NULL',
				entry.boxPlacementBox,
				entry.boxPlacementRow,
				entry.boxPlacementColumn,
				entry.boxPlacementFormsBox,
				entry.boxPlacementFormsRow,
				entry.boxPlacementFormsColumn
			];

			return `  (${values.join(', ')})`;
		});

		sql += valueRows.join(',\n');
		sql += '\nON CONFLICT ("pokedexNumber", form) DO UPDATE SET\n';
		sql += '  "canGigantamax" = EXCLUDED."canGigantamax",\n';
		sql += '  kanto_number = EXCLUDED.kanto_number,\n';
		sql += '  johto_number = EXCLUDED.johto_number,\n';
		sql += '  hoenn_number = EXCLUDED.hoenn_number,\n';
		sql += '  sinnoh_number = EXCLUDED.sinnoh_number,\n';
		sql += '  sinnoh_extended_number = EXCLUDED.sinnoh_extended_number,\n';
		sql += '  unova_number = EXCLUDED.unova_number,\n';
		sql += '  unova_updated_number = EXCLUDED.unova_updated_number,\n';
		sql += '  kalos_central_number = EXCLUDED.kalos_central_number,\n';
		sql += '  kalos_coastal_number = EXCLUDED.kalos_coastal_number,\n';
		sql += '  kalos_mountain_number = EXCLUDED.kalos_mountain_number,\n';
		sql += '  hoenn_updated_number = EXCLUDED.hoenn_updated_number,\n';
		sql += '  alola_number = EXCLUDED.alola_number,\n';
		sql += '  alola_updated_number = EXCLUDED.alola_updated_number,\n';
		sql += '  melemele_number = EXCLUDED.melemele_number,\n';
		sql += '  akala_number = EXCLUDED.akala_number,\n';
		sql += '  ulaula_number = EXCLUDED.ulaula_number,\n';
		sql += '  poni_number = EXCLUDED.poni_number,\n';
		sql += '  galar_number = EXCLUDED.galar_number,\n';
		sql += '  isle_armor_number = EXCLUDED.isle_armor_number,\n';
		sql += '  crown_tundra_number = EXCLUDED.crown_tundra_number,\n';
		sql += '  hisui_number = EXCLUDED.hisui_number,\n';
		sql += '  paldea_number = EXCLUDED.paldea_number,\n';
		sql += '  kitakami_number = EXCLUDED.kitakami_number,\n';
		sql += '  blueberry_number = EXCLUDED.blueberry_number,\n';
		sql += '  "boxPlacementBox" = EXCLUDED."boxPlacementBox",\n';
		sql += '  "boxPlacementRow" = EXCLUDED."boxPlacementRow",\n';
		sql += '  "boxPlacementColumn" = EXCLUDED."boxPlacementColumn",\n';
		sql += '  "boxPlacementFormsBox" = EXCLUDED."boxPlacementFormsBox",\n';
		sql += '  "boxPlacementFormsRow" = EXCLUDED."boxPlacementFormsRow",\n';
		sql += '  "boxPlacementFormsColumn" = EXCLUDED."boxPlacementFormsColumn",\n';
		sql += '  "updatedAt" = NOW();\n';

		return sql;
	}

	// Main execution function
	async run() {
		try {
			console.log('Starting comprehensive Pokémon data fetch...');

			// Fetch all data
			await this.fetchAllPokedexes();
			await this.fetchAllSpecies();
			await this.fetchAllPokemon();

			console.log(`Fetched ${this.allPokemon.length} total Pokémon forms`);
			console.log(`From ${this.allSpecies.length} species`);

			// Generate migration
			const migrationSQL = this.generateMigration();

			// Write to file
			const outputPath = path.join(
				__dirname,
				'..',
				'supabase',
				'migrations',
				'20250128000004_seed_complete_pokemon_data.sql'
			);
			fs.writeFileSync(outputPath, migrationSQL);

			console.log(`Migration file generated: ${outputPath}`);
			console.log('Done!');
		} catch (error) {
			console.error('Error:', error);
			process.exit(1);
		}
	}
}

// Run the script
const fetcher = new PokemonDataFetcher();
fetcher.run();

export default PokemonDataFetcher;
