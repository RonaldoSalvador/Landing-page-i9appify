-- ============================================
-- CRM i9 Appify - Database Schema v4
-- COM TAGS, TEMPLATES E BLOG
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABELA DE LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  empresa TEXT,
  tipo_servico TEXT,
  descricao TEXT,
  orcamento TEXT,
  status TEXT DEFAULT 'novo',
  origem TEXT DEFAULT 'site',
  score INT DEFAULT 0,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tipo_servico TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS orcamento TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. TABELA DE NOTAS
-- ============================================
CREATE TABLE IF NOT EXISTS notas (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE VISITANTES (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT UNIQUE NOT NULL,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  total_visits INT DEFAULT 1,
  device TEXT,
  browser TEXT,
  referrer TEXT,
  city TEXT,
  country TEXT
);

-- ============================================
-- 4. TABELA DE PAGEVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS pageviews (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT,
  page TEXT NOT NULL,
  time_on_page INT DEFAULT 0,
  scroll_depth INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABELA DE EVENTOS (cliques, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TABELA DE ATIVIDADES (Histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS atividades (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  dados JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABELA DE EVENTOS/AGENDA (Calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS eventos (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT 'reuniao',
  data DATE NOT NULL,
  hora TIME,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABELA DE CONFIGURAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id INT PRIMARY KEY DEFAULT 1,
  telegram_enabled BOOLEAN DEFAULT false,
  telegram_chat_id TEXT,
  telegram_bot_token TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_url TEXT,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. TABELA DE TAGS (NOVA)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir tags padrão
INSERT INTO tags (nome, cor) VALUES 
  ('Quente', '#ef4444'),
  ('Morno', '#f59e0b'),
  ('Frio', '#3b82f6'),
  ('App', '#8b5cf6'),
  ('Site', '#10b981'),
  ('Automação', '#06b6d4')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 10. TABELA DE LEAD_TAGS (Vinculação)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_tags (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, tag_id)
);

-- ============================================
-- 11. TABELA DE TEMPLATES (Mensagens)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'email'
  conteudo TEXT NOT NULL,
  variaveis TEXT[], -- ['{{nome}}', '{{empresa}}']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir templates padrão
INSERT INTO templates (nome, tipo, conteudo, variaveis) VALUES 
  ('Boas-vindas', 'whatsapp', 'Olá {{nome}}! 👋 Obrigado pelo interesse na I9 Appify. Em que posso ajudar?', ARRAY['{{nome}}']),
  ('Follow-up', 'whatsapp', 'Oi {{nome}}, tudo bem? Passou a considerar nossa proposta para {{empresa}}?', ARRAY['{{nome}}', '{{empresa}}']),
  ('Proposta Enviada', 'whatsapp', 'Olá {{nome}}! Acabei de enviar a proposta para o seu email. Qualquer dúvida, estou à disposição!', ARRAY['{{nome}}'])
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. TABELA DE POSTS (Blog)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  categoria TEXT DEFAULT 'IA',
  imagem_url TEXT,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir posts iniciais
INSERT INTO posts (titulo, slug, resumo, categoria, publicado) VALUES 
  ('Como a IA está revolucionando o atendimento ao cliente', 'ia-atendimento-cliente', 'Descubra como empresas estão usando chatbots e automação para aumentar vendas e satisfação.', 'Automação', true),
  ('5 ferramentas de IA que você precisa conhecer', '5-ferramentas-ia', 'As melhores ferramentas gratuitas e pagas para impulsionar sua produtividade.', 'Ferramentas', true),
  ('O futuro do No-Code: apps sem programar', 'futuro-no-code', 'Entenda como criar aplicativos profissionais sem escrever uma linha de código.', 'No-Code', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users full access leads" ON leads;
DROP POLICY IF EXISTS "Public insert leads" ON leads;
DROP POLICY IF EXISTS "Public read leads" ON leads;
CREATE POLICY "Authenticated users full access leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);

ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users full access notas" ON notas;
CREATE POLICY "Authenticated users full access notas" ON notas FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read visitors" ON visitors;
DROP POLICY IF EXISTS "Public insert visitors" ON visitors;
DROP POLICY IF EXISTS "Public update visitors" ON visitors;
CREATE POLICY "Authenticated read visitors" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update visitors" ON visitors FOR UPDATE USING (true);

ALTER TABLE pageviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read pageviews" ON pageviews;
DROP POLICY IF EXISTS "Public insert pageviews" ON pageviews;
CREATE POLICY "Authenticated read pageviews" ON pageviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert pageviews" ON pageviews FOR INSERT WITH CHECK (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read events" ON events;
DROP POLICY IF EXISTS "Public insert events" ON events;
CREATE POLICY "Authenticated read events" ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert events" ON events FOR INSERT WITH CHECK (true);

ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access atividades" ON atividades;
CREATE POLICY "Authenticated full access atividades" ON atividades FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access eventos" ON eventos;
CREATE POLICY "Authenticated full access eventos" ON eventos FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access configuracoes" ON configuracoes;
CREATE POLICY "Authenticated full access configuracoes" ON configuracoes FOR ALL USING (auth.role() = 'authenticated');

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access tags" ON tags;
CREATE POLICY "Authenticated full access tags" ON tags FOR ALL USING (auth.role() = 'authenticated');

-- Lead Tags
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access lead_tags" ON lead_tags;
CREATE POLICY "Authenticated full access lead_tags" ON lead_tags FOR ALL USING (auth.role() = 'authenticated');

-- Templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access templates" ON templates;
CREATE POLICY "Authenticated full access templates" ON templates FOR ALL USING (auth.role() = 'authenticated');

-- Posts (público para leitura)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated full access posts" ON posts;
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (publicado = true);
CREATE POLICY "Authenticated full access posts" ON posts FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ENABLE REALTIME
-- ============================================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE leads; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notas; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE eventos; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE reunioes; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- TABELA DE REUNIÕES (v5)
-- ============================================
CREATE TABLE IF NOT EXISTS reunioes (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao INTEGER DEFAULT 30,
  status TEXT DEFAULT 'agendada',
  tipo TEXT DEFAULT 'call',
  link_meet TEXT,
  notas TEXT,
  origem TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access reunioes" ON reunioes;
CREATE POLICY "Authenticated full access reunioes" ON reunioes FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- TABELA DE NOTIFICAÇÕES (v5)
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  link TEXT,
  icone TEXT DEFAULT 'bell',
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated full access notificacoes" ON notificacoes;
CREATE POLICY "Authenticated full access notificacoes" ON notificacoes FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNÇÃO: CRIAR NOTIFICAÇÃO AO NOVO LEAD
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificacoes (tipo, titulo, mensagem, link, icone)
  VALUES (
    'novo_lead',
    'Novo lead: ' || NEW.nome,
    COALESCE(NEW.empresa, '') || ' - ' || COALESCE(NEW.tipo_servico, 'Não especificado'),
    '/crm/leads',
    'user-plus'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_lead ON leads;
CREATE TRIGGER on_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- ============================================
-- FUNÇÃO: CRIAR NOTIFICAÇÃO AO NOVA REUNIÃO
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_reuniao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificacoes (tipo, titulo, mensagem, link, icone)
  VALUES (
    'nova_reuniao',
    'Reunião agendada',
    NEW.titulo || ' - ' || TO_CHAR(NEW.data_hora, 'DD/MM às HH24:MI'),
    '/crm/calendar',
    'calendar'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_reuniao ON reunioes;
CREATE TRIGGER on_new_reuniao
  AFTER INSERT ON reunioes
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_reuniao();

