-- Create user_diagnostics table for tracking diagnostic history
CREATE TABLE IF NOT EXISTS user_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Score & results
  score INTEGER NOT NULL,
  taux_endettement DECIMAL(5,2) NOT NULL,
  apport_pct DECIMAL(5,2) NOT NULL,
  reste_a_vivre DECIMAL(10,2) NOT NULL,
  mensualite DECIMAL(10,2) NOT NULL,
  hcsf_ok BOOLEAN NOT NULL,

  -- Input parameters
  revenus DECIMAL(10,2) NOT NULL,
  charges DECIMAL(10,2) NOT NULL,
  montant DECIMAL(12,2) NOT NULL,
  apport DECIMAL(12,2) NOT NULL,
  duree INTEGER,
  taux_interet DECIMAL(5,3),
  contrat TEXT,
  anciennete TEXT,
  decouvert TEXT,
  nb_enfants INTEGER DEFAULT 0,

  -- Metadata
  diagnostic_type TEXT DEFAULT 'express' -- 'express' or 'premium'
);

-- Create indexes separately (not in table definition)
CREATE INDEX IF NOT EXISTS idx_user_diagnostics_user_id ON user_diagnostics (user_id);
CREATE INDEX IF NOT EXISTS idx_user_diagnostics_created_at ON user_diagnostics (created_at DESC);

-- Enable RLS
ALTER TABLE user_diagnostics ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own diagnostics
CREATE POLICY "Users can read own diagnostics"
  ON user_diagnostics
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: users can insert their own diagnostics
CREATE POLICY "Users can insert own diagnostics"
  ON user_diagnostics
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
