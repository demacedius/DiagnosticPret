-- Fix RLS policies for user_diagnostics table
-- Since we use Clerk auth and validate on the API route level,
-- we can safely disable RLS or use service role key

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own diagnostics" ON user_diagnostics;
DROP POLICY IF EXISTS "Users can insert own diagnostics" ON user_diagnostics;

-- Disable RLS for now (security handled by Clerk in API routes)
ALTER TABLE user_diagnostics DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS but add a policy that works with service role
-- CREATE POLICY "Service role full access"
--   ON user_diagnostics
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);
