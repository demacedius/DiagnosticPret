-- Sécurisation de la table user_diagnostics avec RLS
-- Correction de la faille de sécurité : la table était publique sans RLS

-- 1. Réactiver RLS (obligatoire pour la sécurité)
ALTER TABLE user_diagnostics ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can read own diagnostics" ON user_diagnostics;
DROP POLICY IF EXISTS "Users can insert own diagnostics" ON user_diagnostics;
DROP POLICY IF EXISTS "Service role full access" ON user_diagnostics;

-- 3. Créer une policy restrictive par défaut (DENY ALL)
-- Bloque tous les accès directs via l'API Supabase publique
CREATE POLICY "Block public access"
  ON user_diagnostics
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 4. Les requêtes via service_role key (nos API routes) bypassent RLS automatiquement
-- Donc nos routes API avec SUPABASE_SERVICE_ROLE_KEY continueront de fonctionner
-- mais l'accès direct via anon key sera bloqué

-- Note de sécurité :
-- - API routes (/api/diagnostics/*) utilisent service_role key → accès autorisé (bypass RLS)
-- - Accès direct Supabase avec anon key → bloqué par RLS
-- - Authentification Clerk validée au niveau API route avant l'accès DB
