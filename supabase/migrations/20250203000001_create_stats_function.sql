-- Create function to get pokédex statistics
CREATE OR REPLACE FUNCTION get_pokedex_stats(pokedex_id UUID)
RETURNS TABLE (
  total INTEGER,
  caught INTEGER,
  ready_to_evolve INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH pokedex_info AS (
    SELECT 
      up.include_forms,
      up.regional_pokedex_name,
      rpi.column_name
    FROM user_pokedexes up
    LEFT JOIN regional_pokedex_info rpi ON up.regional_pokedex_name = rpi.name
    WHERE up.id = pokedex_id
  ),
  relevant_pokemon AS (
    SELECT pe.id
    FROM pokedex_entries pe
    CROSS JOIN pokedex_info pi
    WHERE 
      CASE 
        WHEN pi.regional_pokedex_name IS NOT NULL THEN
          -- Regional pokédex: filter by the appropriate column
          CASE pi.column_name
            WHEN 'pokedexNumber' THEN pe."pokedexNumber" IS NOT NULL
            WHEN 'kanto_number' THEN pe.kanto_number IS NOT NULL
            WHEN 'johto_number' THEN pe.johto_number IS NOT NULL
            WHEN 'hoenn_number' THEN pe.hoenn_number IS NOT NULL
            WHEN 'sinnoh_number' THEN pe.sinnoh_number IS NOT NULL
            WHEN 'sinnoh_extended_number' THEN pe.sinnoh_extended_number IS NOT NULL
            WHEN 'unova_number' THEN pe.unova_number IS NOT NULL
            WHEN 'unova_updated_number' THEN pe.unova_updated_number IS NOT NULL
            WHEN 'kalos_central_number' THEN pe.kalos_central_number IS NOT NULL
            WHEN 'kalos_coastal_number' THEN pe.kalos_coastal_number IS NOT NULL
            WHEN 'kalos_mountain_number' THEN pe.kalos_mountain_number IS NOT NULL
            WHEN 'hoenn_updated_number' THEN pe.hoenn_updated_number IS NOT NULL
            WHEN 'alola_number' THEN pe.alola_number IS NOT NULL
            WHEN 'alola_updated_number' THEN pe.alola_updated_number IS NOT NULL
            WHEN 'melemele_number' THEN pe.melemele_number IS NOT NULL
            WHEN 'akala_number' THEN pe.akala_number IS NOT NULL
            WHEN 'ulaula_number' THEN pe.ulaula_number IS NOT NULL
            WHEN 'poni_number' THEN pe.poni_number IS NOT NULL
            WHEN 'galar_number' THEN pe.galar_number IS NOT NULL
            WHEN 'isle_armor_number' THEN pe.isle_armor_number IS NOT NULL
            WHEN 'crown_tundra_number' THEN pe.crown_tundra_number IS NOT NULL
            WHEN 'hisui_number' THEN pe.hisui_number IS NOT NULL
            WHEN 'paldea_number' THEN pe.paldea_number IS NOT NULL
            WHEN 'kitakami_number' THEN pe.kitakami_number IS NOT NULL
            WHEN 'blueberry_number' THEN pe.blueberry_number IS NOT NULL
            ELSE FALSE
          END
        ELSE
          -- National pokédex: include based on forms preference
          CASE 
            WHEN pi.include_forms THEN TRUE
            ELSE (pe.form IS NULL OR pe.form = '' OR pe.form = 'default')
          END
      END
  ),
  catch_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE cr.caught = true) as caught_count,
      COUNT(*) FILTER (WHERE cr.catch_status = 'ready_to_evolve') as ready_evolve_count
    FROM relevant_pokemon rp
    LEFT JOIN catch_records cr ON rp.id = cr."pokedexEntryId" AND cr.pokedex_id = get_pokedex_stats.pokedex_id
  )
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM relevant_pokemon) as total,
    COALESCE(cs.caught_count, 0)::INTEGER as caught,
    COALESCE(cs.ready_evolve_count, 0)::INTEGER as ready_to_evolve
  FROM catch_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;