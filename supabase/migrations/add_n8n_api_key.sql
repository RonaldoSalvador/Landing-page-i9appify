-- Migração: adiciona campo n8n_api_key e metadata de org à tabela configuracoes
-- Executar no Supabase SQL Editor: https://supabase.com/dashboard/project/ldqjunoqeepcdctheidd/sql

ALTER TABLE configuracoes
  ADD COLUMN IF NOT EXISTS n8n_api_key TEXT;

-- Confirmar a migration
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'configuracoes'
ORDER BY ordinal_position;
