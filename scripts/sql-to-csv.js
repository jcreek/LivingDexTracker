#!/usr/bin/env node

/**
 * Converts Kanto seed SQL migration to CSV format
 * Parses 20260104000001_seed_kanto.sql and generates:
 * - data/pokemon/gen1-kanto.csv
 * - data/pokemon/games.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL migration file
const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260104000001_seed_kanto.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Extract games from region_game_mappings section
const gameMatches = [...sqlContent.matchAll(/\('Kanto', '([^']+)'\)/g)];
const games = gameMatches.map(m => m[1]);

console.log(`Found ${games.length} Kanto games:`, games);

// Extract Pokemon entries from INSERT statement
// Match pattern: (number, 'name', form, boolean, 'region', ARRAY[games], ...)
const valuePattern = /\((\d+),\s*'([^']+)',\s*(NULL|'[^']+'),\s*(true|false),\s*'[^']+',\s*ARRAY\[([^\]]+)\][^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,\s*(NULL|\d+)\)/g;

const pokemon = [];
let match;
while ((match = valuePattern.exec(sqlContent)) !== null) {
  const [_, pokedexNumber, name, formRaw, canGigantamax, gamesRaw, regionalNumberRaw] = match;

  // Parse form (NULL or 'Female')
  const form = formRaw === 'NULL' ? '' : formRaw.replace(/'/g, '');

  // Parse games array - extract game names from ARRAY['Red', 'Blue', ...]
  const gamesList = gamesRaw.match(/'([^']+)'/g).map(g => g.replace(/'/g, ''));
  const gamesStr = gamesList.join('|');

  // Parse regional number
  const regionalNumber = regionalNumberRaw === 'NULL' ? '' : regionalNumberRaw;

  pokemon.push({
    pokedexNumber,
    name,
    form,
    games: gamesStr,
    regionalNumber
  });
}

console.log(`Extracted ${pokemon.length} Pokemon entries`);

// Generate gen1-kanto.csv
const kantoCSV = [
  'pokedexNumber,name,form,games,regionalNumber',
  ...pokemon.map(p => {
    const form = p.form.includes(',') ? `"${p.form}"` : p.form;
    const games = p.games.includes(',') ? `"${p.games}"` : p.games;
    return `${p.pokedexNumber},${p.name},${form},${games},${p.regionalNumber}`;
  })
].join('\n');

const kantoPath = path.join(__dirname, '..', 'data', 'pokemon', 'gen1-kanto.csv');
fs.writeFileSync(kantoPath, kantoCSV);
console.log(`✓ Created ${kantoPath}`);

// Generate games.csv
const gamesCSV = [
  'id,displayName,region,generation',
  ...games.map((game, idx) => {
    const id = game.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const generation = game.startsWith('LG:') ? 7 : 1;
    return `${id},${game},Kanto,${generation}`;
  })
].join('\n');

const gamesPath = path.join(__dirname, '..', 'data', 'pokemon', 'games.csv');
fs.writeFileSync(gamesPath, gamesCSV);
console.log(`✓ Created ${gamesPath}`);

console.log('\n✅ Conversion complete!');
console.log(`   gen1-kanto.csv: ${pokemon.length} entries`);
console.log(`   games.csv: ${games.length} games`);
