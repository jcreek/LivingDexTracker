#!/usr/bin/env node

/**
 * Generates SQL migration from CSV files
 * Usage: node csv-to-migration.js <Region>
 * Example: node csv-to-migration.js Kanto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse CSV file into array of objects
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || null;
    });
    return obj;
  });
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Generate migration SQL from CSV data
 */
function generateMigration(region) {
  console.log(`\nGenerating migration for ${region}...`);

  // Determine generation number from region
  const regionToGen = {
    'Kanto': 1, 'Johto': 2, 'Hoenn': 3, 'Sinnoh': 4,
    'Unova': 5, 'Kalos': 6, 'Alola': 7, 'Galar': 8,
    'Hisui': 8, 'Paldea': 9
  };
  const gen = regionToGen[region] || 1;

  // 1. Load CSV files
  const pokemonPath = path.join(__dirname, '..', 'data', 'pokemon', `gen${gen}-${region.toLowerCase()}.csv`);
  const gamesPath = path.join(__dirname, '..', 'data', 'pokemon', 'games.csv');

  if (!fs.existsSync(pokemonPath)) {
    console.error(`Error: Pokemon CSV not found at ${pokemonPath}`);
    process.exit(1);
  }

  const pokemon = parseCSV(pokemonPath);
  const games = parseCSV(gamesPath);

  // 2. Filter for this region
  const regionGames = games.filter(g => g.region === region);

  if (regionGames.length === 0) {
    console.error(`Error: No games found for region ${region} in games.csv`);
    process.exit(1);
  }

  // 3. Generate SQL
  let sql = `-- Seed ${region} region Pokémon (Gen ${gen})\n`;
  sql += `-- Auto-generated from CSV files\n\n`;

  // Region-game mappings
  sql += `-- Insert ${region} region-game mappings\n`;
  sql += `INSERT INTO region_game_mappings (region, game) VALUES\n`;
  sql += regionGames.map(g => `  ('${region}', '${g.displayName}')`).join(',\n');
  sql += `\nON CONFLICT (region, game) DO NOTHING;\n\n`;

  // Pokemon entries (without regional dex number)
  sql += `-- Insert ${region} Pokémon entries\n`;
  sql += `INSERT INTO pokedex_entries (\n`;
  sql += `  "pokedexNumber",\n`;
  sql += `  pokemon,\n`;
  sql += `  form,\n`;
  sql += `  "canGigantamax",\n`;
  sql += `  "regionToCatchIn",\n`;
  sql += `  "gamesToCatchIn"\n`;
  sql += `) VALUES\n`;

  const rows = pokemon.map(p => {
    const form = p.form ? `'${p.form}'` : 'NULL';
    const gamesList = p.games.split('|');
    const gamesArray = `ARRAY[${gamesList.map(g => `'${g}'`).join(', ')}]`;

    return `(${p.pokedexNumber}, '${p.name}', ${form}, false, '${region}', ${gamesArray})`;
  });

  sql += rows.join(',\n');
  sql += '\nON CONFLICT ON CONSTRAINT unique_pokemon_form DO NOTHING;\n\n';

  // Regional dex numbers (separate table)
  sql += `-- Insert ${region} regional dex numbers\n`;
  sql += `INSERT INTO regional_dex_numbers (\n`;
  sql += `  pokedex_entry_id,\n`;
  sql += `  region,\n`;
  sql += `  dex_number\n`;
  sql += `) VALUES\n`;

  const dexRows = pokemon
    .filter(p => p.regionalNumber)  // Only entries with regional dex numbers
    .map(p => {
      const formCondition = p.form
        ? `form = '${p.form}'`
        : `form IS NULL`;

      return `  ((SELECT id FROM pokedex_entries WHERE "pokedexNumber" = ${p.pokedexNumber} AND ${formCondition}), '${region}', ${p.regionalNumber})`;
    });

  if (dexRows.length > 0) {
    sql += dexRows.join(',\n');
    sql += ';\n\n';
  } else {
    sql += '  -- No regional dex numbers for this region\n\n';
  }

  // Add metadata
  sql += `-- Add metadata\n`;
  sql += `INSERT INTO metadata (key, value) VALUES\n`;
  sql += `  ('${region.toLowerCase()}_seeded', 'true'),\n`;
  sql += `  ('${region.toLowerCase()}_seed_date', NOW()::TEXT),\n`;
  sql += `  ('${region.toLowerCase()}_pokemon_count', '${pokemon.filter(p => !p.form).length}');\n`;

  // 4. Write file
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const filename = `${timestamp}_seed_${region.toLowerCase()}.sql`;
  const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);

  fs.writeFileSync(outputPath, sql);

  console.log(`✓ Generated ${filename}`);
  console.log(`  - ${pokemon.length} Pokemon entries`);
  console.log(`  - ${dexRows.length} regional dex numbers`);
  console.log(`  - ${regionGames.length} games\n`);

  return filename;
}

// Run
const region = process.argv[2];
if (!region) {
  console.error('Usage: node csv-to-migration.js <Region>');
  console.error('Example: node csv-to-migration.js Kanto');
  process.exit(1);
}

generateMigration(region);
