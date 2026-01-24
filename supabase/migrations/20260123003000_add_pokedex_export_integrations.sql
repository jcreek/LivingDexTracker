-- Enable exports to external providers (Google Drive / Dropbox)
CREATE TABLE pokedex_export_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "pokedexId" UUID REFERENCES pokedexes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'dropbox')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  "fileName" TEXT,
  "folderId" TEXT,
  path TEXT,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  metadata JSONB,
  "lastExportedAt" TIMESTAMPTZ,
  "lastError" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("userId", provider)
);

CREATE INDEX idx_pokedex_export_integrations_user_id ON pokedex_export_integrations("userId");
CREATE INDEX idx_pokedex_export_integrations_pokedex_id ON pokedex_export_integrations("pokedexId");
CREATE INDEX idx_pokedex_export_integrations_provider ON pokedex_export_integrations(provider);

CREATE TRIGGER update_pokedex_export_integrations_updated_at
  BEFORE UPDATE ON pokedex_export_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pokedex_export_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export integrations" ON pokedex_export_integrations
  FOR SELECT USING ("userId" = auth.uid());

CREATE POLICY "Users can create own export integrations" ON pokedex_export_integrations
  FOR INSERT WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update own export integrations" ON pokedex_export_integrations
  FOR UPDATE USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can delete own export integrations" ON pokedex_export_integrations
  FOR DELETE USING ("userId" = auth.uid());
