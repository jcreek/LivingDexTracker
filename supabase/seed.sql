-- Initial seed data for local development
-- This file is referenced in config.toml and will be loaded during db reset

-- Note: RLS is already enabled on auth.users by default in Supabase
-- No need to modify system tables here

-- Add any application-specific seed data here
-- For now, this file is minimal since we use MongoDB for app data

-- Example: If we had a profiles table, we could seed it here
-- INSERT INTO profiles (id, username) VALUES 
-- ('test-user-id', 'testuser');

SELECT 'Local Supabase setup complete' as message;