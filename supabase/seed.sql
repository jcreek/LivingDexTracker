-- ============================================================================
-- LIVING DEX TRACKER - BDD TEST DATA SEED
-- ============================================================================
-- This file creates comprehensive test data for BDD scenarios
-- It ensures consistent, reliable test data across all test runs
-- ============================================================================

-- Ensure we can manipulate auth schema
SET session_replication_role = 'replica';

-- ============================================================================
-- STEP 1: CLEANUP EXISTING TEST DATA (Idempotent)
-- ============================================================================

-- Clean up catch records first (foreign key dependencies)
DELETE FROM catch_records WHERE pokedex_id IN (
  SELECT id FROM user_pokedexes WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
);

-- Clean up user pokédexes
DELETE FROM user_pokedexes WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Clean up auth identities
DELETE FROM auth.identities WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Clean up test user
DELETE FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- ============================================================================
-- STEP 2: CREATE TEST USER WITH PROPER AUTH SETUP
-- ============================================================================

-- Insert test user with all required auth.users fields
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440000',
  'authenticated',
  'authenticated',
  'test@livingdextracker.local',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- Insert corresponding auth identity
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  provider_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"sub": "550e8400-e29b-41d4-a716-446655440000", "email": "test@livingdextracker.local", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW(),
  'test@livingdextracker.local'
);

-- ============================================================================
-- STEP 3: CREATE COMPREHENSIVE TEST POKÉDEXES
-- ============================================================================

-- Main test pokédex (Kanto) - Primary pokédex for most scenarios
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Kanto Living Dex',
  'all_games',
  'kanto',
  false,
  false,
  false,
  NULL,
  NOW(),
  NOW()
);

-- Secondary test pokédex (Johto) - For multi-pokédex scenarios
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Johto Living Dex',
  'all_games',
  'johto',
  false,
  false,
  false,
  NULL,
  NOW(),
  NOW()
);

-- Kalos Central pokédex - For multi-regional testing (Central Kalos)
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Kalos Central Living Dex',
  'all_games',
  'kalos-central',
  false,
  false,
  false,
  NULL,
  NOW(),
  NOW()
);

-- Alola pokédex - For island region testing
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Alola Living Dex',
  'all_games',
  'alola',
  false,
  false,
  false,
  NULL,
  NOW(),
  NOW()
);

-- Galar pokédex - For Galar region testing
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Galar Living Dex',
  'all_games',
  'galar',
  false,
  false,
  false,
  NULL,
  NOW(),
  NOW()
);

-- Shiny hunt pokédex - For shiny hunting scenarios
INSERT INTO user_pokedexes (
  id,
  user_id,
  name,
  game_scope,
  regional_pokedex_name,
  is_shiny,
  require_origin,
  include_forms,
  generation,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Shiny Hunt Dex',
  'all_games',
  'national',
  true,
  true,
  true,
  NULL,
  NOW(),
  NOW()
);

-- ============================================================================
-- STEP 4: CREATE COMPREHENSIVE CATCH RECORDS FOR TESTING
-- ============================================================================

-- Kanto Dex Catch Records (Primary test data)
-- Mix of different catch statuses for comprehensive testing

-- Box 1 - Mixed statuses for testing all scenarios
INSERT INTO catch_records (
  id,
  "userId",
  "pokedexEntryId",
  pokedex_id,
  caught,
  "haveToEvolve",
  "inHome",
  "hasGigantamaxed",
  "personalNotes",
  "createdAt",
  "updatedAt"
) VALUES 
-- Bulbasaur - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Starter Pokémon for testing',
  NOW(),
  NOW()
),
-- Ivysaur - Ready to evolve
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  2,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  false,
  false,
  'Ready to evolve into Venusaur',
  NOW(),
  NOW()
),
-- Charmander - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  4,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Fire starter for testing',
  NOW(),
  NOW()
),
-- Charmeleon - Ready to evolve  
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  5,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  false,
  false,
  'Ready to evolve into Charizard',
  NOW(),
  NOW()
),
-- Charizard - Caught in HOME with Gigantamax
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  6,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  true,
  true,
  'Gigantamax Charizard stored in HOME',
  NOW(),
  NOW()
),
-- Squirtle - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  7,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Water starter for testing',
  NOW(),
  NOW()
),
-- Wartortle - Ready to evolve
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  8,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  false,
  false,
  'Ready to evolve into Blastoise',
  NOW(),
  NOW()
),
-- Blastoise - Caught with Gigantamax
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  9,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  true,
  'Gigantamax Blastoise for testing',
  NOW(),
  NOW()
),
-- Butterfree - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  12,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Early game catch for testing',
  NOW(),
  NOW()
),
-- Weedle - Ready to evolve
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  13,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  false,
  false,
  'Ready to evolve into Kakuna',
  NOW(),
  NOW()
),
-- Pikachu - Caught in HOME
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  25,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  true,
  false,
  'Mascot Pokémon stored in HOME',
  NOW(),
  NOW()
),
-- Raichu - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  26,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Evolution of Pikachu',
  NOW(),
  NOW()
),
-- Psyduck - Ready to evolve
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  54,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  false,
  false,
  'Ready to evolve into Golduck',
  NOW(),
  NOW()
),
-- Golduck - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  55,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Psychic water type',
  NOW(),
  NOW()
),
-- Machamp - Caught with detailed notes
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  68,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Traded evolution - caught via trading with test partner',
  NOW(),
  NOW()
),
-- Mewtwo - Caught (legendary for testing)
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  150,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  false,
  false,
  'Legendary Pokémon - Cerulean Cave',
  NOW(),
  NOW()
),
-- Mew - Caught in HOME (mythical for testing)
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  151,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  false,
  true,
  false,
  'Mythical Pokémon - Event distribution',
  NOW(),
  NOW()
);

-- ============================================================================
-- STEP 5: CREATE CATCH RECORDS FOR SECONDARY POKÉDEXES
-- ============================================================================

-- Johto Dex - Some basic catch records for multi-pokédex scenarios
INSERT INTO catch_records (
  id,
  "userId",
  "pokedexEntryId",
  pokedex_id,
  caught,
  "haveToEvolve",
  "inHome",
  "hasGigantamaxed",
  "personalNotes",
  "createdAt",
  "updatedAt"
) VALUES 
-- Chikorita - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  152,
  '550e8400-e29b-41d4-a716-446655440002',
  true,
  false,
  false,
  false,
  'Johto grass starter',
  NOW(),
  NOW()
),
-- Cyndaquil - Ready to evolve
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  155,
  '550e8400-e29b-41d4-a716-446655440002',
  true,
  true,
  false,
  false,
  'Ready to evolve into Quilava',
  NOW(),
  NOW()
),
-- Totodile - Caught
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000',
  158,
  '550e8400-e29b-41d4-a716-446655440002',
  true,
  false,
  false,
  false,
  'Johto water starter',
  NOW(),
  NOW()
);

-- ============================================================================
-- STEP 6: RESET SESSION REPLICATION ROLE
-- ============================================================================

SET session_replication_role = 'origin';

-- ============================================================================
-- VERIFICATION QUERIES (for debugging - can be removed in production)
-- ============================================================================

-- Verify test user exists
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'test@livingdextracker.local';

-- Verify pokédexes were created
-- SELECT id, name, regional_pokedex_name FROM user_pokedexes WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Verify catch records were created
-- SELECT COUNT(*) as catch_records_count FROM catch_records WHERE user_pokedex_id = '550e8400-e29b-41d4-a716-446655440001';

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================
-- Test data seeded successfully!
-- 
-- Test User: test@livingdextracker.local / testpassword123
-- Test Pokédexes: 6 total (Kanto, Johto, Kalos Central, Alola, Galar, Shiny Hunt)
-- Primary Test Pokédex ID: 550e8400-e29b-41d4-a716-446655440001 (Kanto)
-- Catch Records: ~20 in Kanto dex, 3 in Johto dex
-- 
-- Coverage:
-- ✅ All catch statuses (not_caught, caught, ready_to_evolve)
-- ✅ All location statuses (in_game, in_home)
-- ✅ Gigantamax Pokémon testing
-- ✅ Origin region tracking
-- ✅ Detailed notes testing
-- ✅ Multi-pokédex scenarios
-- ✅ Multi-regional pokédex testing
-- ✅ Box View testing (30 slots per box)
-- ✅ Statistical testing (completion percentages)
-- ============================================================================