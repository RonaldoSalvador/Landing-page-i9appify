-- Migração: tabela de contatos de campanhas (disparo em massa)
-- Executar no Supabase SQL Editor

-- Adiciona coluna total_contatos na tabela campaigns (se não existir)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS total_contatos INTEGER DEFAULT 0;

-- Cria tabela de contatos individuais da campanha
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id          BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  telefone    TEXT NOT NULL,
  variaveis   JSONB DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | sent | delivered | failed
  enviado_em  TIMESTAMPTZ,
  erro        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);

-- Confirmar estrutura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'campaign_contacts'
ORDER BY ordinal_position;
