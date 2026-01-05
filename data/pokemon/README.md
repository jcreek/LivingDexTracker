# Pokémon Data (CSV Format)

This directory contains Pokémon data in CSV format for easy editing and maintenance.

## File Structure

```
/data/pokemon/
├── gen1-kanto.csv          # Gen 1 Pokémon (Kanto region, #1-151)
├── gen2-johto.csv          # Gen 2 Pokémon (Johto region, #152-251) - Future
├── gen3-hoenn.csv          # Gen 3 Pokémon (Hoenn region, #252-386) - Future
├── games.csv               # All Pokémon games definitions
└── README.md               # This file
```

## CSV Format

### gen{N}-{region}.csv

One CSV file per generation/region containing all Pokémon from that generation.

**Columns:**
- `pokedexNumber` - National Pokédex number (e.g., 1, 25, 151)
- `name` - Pokémon name (e.g., Bulbasaur, Pikachu, Mew)
- `form` - Form name (empty for base form, "Female" for gender differences, "Alolan" for regional forms, etc.)
- `games` - Pipe-separated list of games where this Pokémon can be caught (e.g., "Red|Blue|Yellow")
- `regionalNumber` - Regional Pokédex number for base forms (empty for gender/alternative forms)

**Example (gen1-kanto.csv):**
```csv
pokedexNumber,name,form,games,regionalNumber
1,Bulbasaur,,Red|Blue|Yellow|LG: Pikachu|LG: Eevee,1
3,Venusaur,,Red|Blue|Yellow|LG: Pikachu|LG: Eevee,3
3,Venusaur,Female,Red|Blue|Yellow|LG: Pikachu|LG: Eevee,
25,Pikachu,,Red|Blue|Yellow|LG: Pikachu|LG: Eevee,25
151,Mew,,Red|Blue|Yellow,151
```

### games.csv

Defines all Pokémon games.

**Columns:**
- `id` - Unique game identifier (lowercase, hyphenated, e.g., "red", "lg-pikachu")
- `displayName` - Display name for the game (e.g., "Red", "LG: Pikachu")
- `region` - Region/generation the game belongs to (e.g., "Kanto", "Johto")
- `generation` - Generation number (1-9)

**Example:**
```csv
id,displayName,region,generation
red,Red,Kanto,1
blue,Blue,Kanto,1
lg-pikachu,LG: Pikachu,Kanto,7
```

## Editing with Excel/Google Sheets

CSV files are designed to be edited in spreadsheet applications:

1. Open the CSV file in Excel or Google Sheets
2. Use formulas, sorting, and filtering for bulk operations
3. Save as CSV when done

**Example workflows:**

### Adding a new game to existing Pokémon
Find & Replace in the `games` column:
- Find: `Red|Blue`
- Replace: `Red|Blue|NewGame`

### Adding a new Pokémon
Add a new row with all required fields:
```csv
152,Chikorita,,Gold|Silver|Crystal,1
```

### Adding a regional form
Add a new row with the form name:
```csv
19,Rattata,Alolan,Sun|Moon|US|UM,
```

## Generating SQL Migrations

After editing CSV files, generate SQL migrations using npm scripts:

```bash
# Generate migration for Kanto
npm run seed:kanto

# Generate migration for Johto (when ready)
npm run seed:johto

# Custom region
npm run seed:generate <RegionName>
```

Generated migrations will be created in `/supabase/migrations/` with timestamp prefixes.

## Testing Changes

After generating a migration:

```bash
# Reset local database to test
npm run supabase:reset

# Verify the changes loaded correctly
```

## Important Notes

1. **Regional Numbers**: Only base forms (no `form` value) should have `regionalNumber` values. Forms like "Female" or "Alolan" should leave this column empty.

2. **Game Names**: Must exactly match the `displayName` in `games.csv`. Use pipe `|` as separator, no spaces around pipes.

3. **National Dex Numbers**: Must be accurate. Gender forms and regional variants share the same `pokedexNumber` as their base form.

4. **CSV Encoding**: Save files with UTF-8 encoding to support special characters.

5. **Quotes**: Only use quotes around values containing commas. Excel/Google Sheets handles this automatically.

## Common Operations

### Add a new generation (e.g., Gen 2 - Johto)

1. Create `gen2-johto.csv` with the format above
2. Add Johto games to `games.csv`
3. Run `npm run seed:johto`
4. Test with `npm run supabase:reset`

### Add a new game to existing generation

1. Open `games.csv`, add new game row
2. Open the relevant `gen{N}-{region}.csv` file
3. Use Find & Replace to add the new game to the `games` column
4. Regenerate the migration: `npm run seed:{region}`
5. Test with `npm run supabase:reset`

### Add DLC/expansion Pokémon

1. Add new Pokémon rows to the appropriate generation CSV
2. Update the `games` column with the DLC games
3. Regenerate the migration
4. Test

## Database Schema

Generated migrations insert data into two tables:

- **`pokedex_entries`**: Pokémon species data (name, form, games, etc.)
- **`regional_dex_numbers`**: Regional Pokédex numbers (separate table for scalability)

This design allows adding new regions without database schema changes.
