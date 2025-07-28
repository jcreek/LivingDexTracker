#!/usr/bin/env node

/**
 * Generate a complete regional pokédx migration from the PokéAPI data
 */

const fs = require('fs');

// Read the complete regional data
const regionalData = JSON.parse(fs.readFileSync('./regional_pokedex_data.json', 'utf8'));

// Generate the complete migration
let migration = `-- Complete regional pokédx setup with full PokéAPI data
-- This replaces the sample data with all official regional pokédx entries

-- Clear existing data and repopulate with complete dataset
DELETE FROM regional_pokedex_entries;

-- Create temporary table for bulk insert
CREATE TEMP TABLE temp_regional_data (
    regional_pokedex_name TEXT,
    regional_number INTEGER,
    pokemon_name TEXT
);

-- Insert all regional pokédx data from PokéAPI
INSERT INTO temp_regional_data VALUES
`;

const values = [];

// Generate VALUES for all regional pokédxes
Object.entries(regionalData).forEach(([regionalName, entries]) => {
	entries.forEach((entry) => {
		values.push(`('${regionalName}', ${entry.regional_number}, '${entry.pokemon_name}')`);
	});
});

migration += values.join(',\n') + ';\n\n';

migration += `-- Insert into regional_pokedex_entries with form matching
-- Match any form of the pokemon (prefer base form if available, otherwise take first form)
INSERT INTO regional_pokedex_entries (pokedex_entry_id, regional_pokedex_name, regional_number)
SELECT DISTINCT ON (trd.regional_pokedex_name, trd.regional_number) 
    pe.id, trd.regional_pokedex_name, trd.regional_number
FROM temp_regional_data trd
JOIN pokedex_entries pe ON LOWER(pe.pokemon) = LOWER(trd.pokemon_name)
ORDER BY trd.regional_pokedex_name, trd.regional_number, 
         CASE WHEN pe.form IS NULL THEN 0 ELSE 1 END, pe.id
ON CONFLICT DO NOTHING;

-- Clean up
DROP TABLE temp_regional_data;

-- Show summary
DO $$
DECLARE
    paldea_count INTEGER;
    kitakami_count INTEGER;
    blueberry_count INTEGER;
    kanto_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO paldea_count FROM regional_pokedex_entries WHERE regional_pokedex_name = 'paldea';
    SELECT COUNT(*) INTO kitakami_count FROM regional_pokedex_entries WHERE regional_pokedex_name = 'kitakami';
    SELECT COUNT(*) INTO blueberry_count FROM regional_pokedex_entries WHERE regional_pokedex_name = 'blueberry';
    SELECT COUNT(*) INTO kanto_count FROM regional_pokedex_entries WHERE regional_pokedex_name = 'kanto';
    
    RAISE NOTICE 'Regional pokédx population complete:';
    RAISE NOTICE '  Paldea: % entries', paldea_count;
    RAISE NOTICE '  Kitakami: % entries', kitakami_count;
    RAISE NOTICE '  Blueberry: % entries', blueberry_count;
    RAISE NOTICE '  Kanto: % entries', kanto_count;
END $$;
`;

// Write the migration file
fs.writeFileSync(
	'./supabase/migrations/20250128000002_populate_complete_regional_data.sql',
	migration
);

console.log('✅ Generated migration with complete regional data');
console.log(`📊 Total entries: ${values.length}`);
console.log('🗂️  Regional pokédxes included:');
Object.entries(regionalData).forEach(([name, entries]) => {
	console.log(`  ${name}: ${entries.length} entries`);
});
