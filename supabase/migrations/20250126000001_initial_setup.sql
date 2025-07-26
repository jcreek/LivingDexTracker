-- Initial setup migration for LivingDexTracker
-- This sets up any additional schema needed

-- Note: RLS is already enabled on auth.users by default in Supabase
-- and proper policies are already in place

-- Create a profiles table if we need additional user data
-- This is optional for the current setup since we only use Supabase for auth
-- and store everything else in MongoDB

-- CREATE TABLE profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   username TEXT,
--   avatar_url TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Enable RLS on profiles table
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
-- CREATE POLICY "Users can view own profile" 
-- ON profiles 
-- FOR SELECT 
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile" 
-- ON profiles 
-- FOR UPDATE 
-- USING (auth.uid() = id);

-- Note: MongoDB collections (pokedexentries, catchrecords) are handled by the app
-- Supabase is only used for authentication in this hybrid setup