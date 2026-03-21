-- ============================================
-- i9 Appify SaaS Central - Schema V2
-- MIGRAÇÃO: Novas tabelas para multi-tenancy,
-- canais, disparos, storage, widget
-- NÃO altera tabelas existentes, apenas ADICIONA
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ORGANIZATIONS (Multi-Tenancy / Workspaces)
-- Cada "cliente" da i9 é uma organização
-- (como no Datafychats: I9 Appify, Dr Ricardo, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  plano TEXT DEFAULT 'starter' CHECK (plano IN ('starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  owner_user_id UUID REFERENCES auth.users(id),
  max_agentes INT DEFAULT 5,
  max_canais INT DEFAULT 3,
  max_atendentes INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ORG_MEMBERS (Atendentes / Membros do Time)
-- Quem tem acesso a cada organização
-- ============================================
CREATE TABLE IF NOT EXISTS org_members (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
  nome TEXT,
  email TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- ============================================
-- 3. CHANNELS (Canais de Comunicação)
-- WhatsApp QR, WhatsApp Oficial, Instagram, etc
-- ============================================
CREATE TABLE IF NOT EXISTS channels (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp_official', 'whatsapp_qrcode', 'zapi', 'evolution', 'instagram', 'telegram')),
  nome TEXT NOT NULL,
  telefone TEXT,

  -- Credenciais (criptografadas via JSONB)
  -- Para Z-API: {instance_id, token, client_token}
  -- Para Evolution: {instance_name, api_url, api_key}
  -- Para Oficial: {phone_number_id, access_token, business_account_id, waba_id}
  credentials JSONB DEFAULT '{}',

  webhook_url TEXT,
  webhook_secret TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
  ultimo_status_em TIMESTAMPTZ,

  -- Config do canal
  config JSONB DEFAULT '{}', -- {auto_read: true, typing_simulation: true, etc}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CONTACTS (Contatos Unificados do CRM)
-- Evolução da tabela leads - contatos de todas as fontes
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL, -- vínculo com lead existente

  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  empresa TEXT,
  avatar_url TEXT,

  -- Dados extras
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Origem
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp', 'widget', 'site', 'import', 'api')),
  source_detail TEXT, -- ex: "widget_homepage", "campanha_marco"

  -- Engajamento
  total_conversas INT DEFAULT 0,
  total_mensagens INT DEFAULT 0,
  ultima_interacao TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_org_telefone ON contacts(org_id, telefone);
CREATE INDEX IF NOT EXISTS idx_contacts_org_email ON contacts(org_id, email);

-- ============================================
-- 5. CONVERSATIONS (Conversas)
-- Evolução da tabela conversas existente - agora com org_id e channel_id
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  channel_id BIGINT REFERENCES channels(id) ON DELETE SET NULL,
  ai_agent_id BIGINT REFERENCES agentes(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Controle Bot vs Humano
  is_bot_active BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES auth.users(id), -- atendente humano
  paused_reason TEXT, -- 'human_takeover', 'outside_hours', 'manual'
  paused_at TIMESTAMPTZ,

  -- Metadados
  assunto TEXT,
  resumo TEXT,
  total_mensagens INT DEFAULT 0,
  unread_count INT DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_org_status ON conversations(org_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to) WHERE assigned_to IS NOT NULL;

-- ============================================
-- 6. MESSAGES (Mensagens)
-- Novo modelo de mensagens com suporte a mídia e transcrição
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,

  -- Remetente
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'bot', 'system')),
  sender_id TEXT, -- user_id do atendente, agent_id do bot, ou phone do contato
  sender_name TEXT,

  -- Conteúdo
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'audio', 'image', 'video', 'document', 'sticker', 'location')),
  media_filename TEXT,
  media_size_bytes BIGINT,

  -- Transcrição de áudio
  is_audio_transcription BOOLEAN DEFAULT false,
  audio_transcription TEXT,
  audio_duration_seconds INT,

  -- Simulação de digitação
  typing_delay_ms INT DEFAULT 0,

  -- Status de entrega
  delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  external_id TEXT, -- ID da mensagem na API externa (Z-API, Evolution, etc)

  -- Metadata da IA
  model_used TEXT,
  tokens_input INT,
  tokens_output INT,
  latency_ms INT,
  tools_used TEXT[],

  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_external ON messages(external_id) WHERE external_id IS NOT NULL;

-- ============================================
-- 7. CAMPAIGNS (Disparos em Massa)
-- Campanhas de disparo via WhatsApp Oficial
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id BIGINT REFERENCES channels(id) ON DELETE SET NULL,

  nome TEXT NOT NULL,
  template_name TEXT, -- nome do template aprovado pela Meta
  template_language TEXT DEFAULT 'pt_BR',

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),

  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Estatísticas
  total_contatos INT DEFAULT 0,
  enviados INT DEFAULT 0,
  entregues INT DEFAULT 0,
  lidos INT DEFAULT 0,
  falhas INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. CAMPAIGN_CONTACTS (Contatos da Campanha)
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,

  telefone TEXT NOT NULL,
  nome TEXT,
  variables JSONB DEFAULT '{}', -- variáveis do template: {1: "João", 2: "desconto 20%"}

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'opted_out')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign ON campaign_contacts(campaign_id, status);

-- ============================================
-- 9. STORAGE_FILES (Arquivos do Storage)
-- Áudio, vídeo, imagem, documento para os agentes
-- ============================================
CREATE TABLE IF NOT EXISTS storage_files (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,
  tipo_midia TEXT NOT NULL CHECK (tipo_midia IN ('audio', 'video', 'imagem', 'documento')),
  mime_type TEXT,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,

  -- Para uso pelo agente IA
  descricao TEXT,
  tags TEXT[] DEFAULT '{}',

  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. WIDGET_CONFIGS (Widget de Captura)
-- Configuração do widget embeddable por organização
-- ============================================
CREATE TABLE IF NOT EXISTS widget_configs (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,

  -- Aparência
  greeting_message TEXT DEFAULT 'Olá! 👋 Como posso te ajudar?',
  theme_color TEXT DEFAULT '#1F2A44', -- azul escuro i9
  accent_color TEXT DEFAULT '#FF6600', -- laranja i9
  position TEXT DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left')),
  logo_url TEXT,

  -- Comportamento
  auto_open BOOLEAN DEFAULT true,
  auto_open_delay_seconds INT DEFAULT 5,
  collect_name BOOLEAN DEFAULT true,
  collect_email BOOLEAN DEFAULT true,
  collect_phone BOOLEAN DEFAULT true,

  -- Página
  allowed_domains TEXT[] DEFAULT '{}', -- domínios onde o widget pode rodar

  -- Vinculação
  ai_agent_id BIGINT REFERENCES agentes(id) ON DELETE SET NULL, -- agente que responde
  channel_id BIGINT REFERENCES channels(id) ON DELETE SET NULL, -- canal para iniciar conversa

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. WIDGET_LEADS (Leads Capturados pelo Widget)
-- ============================================
CREATE TABLE IF NOT EXISTS widget_leads (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  widget_id BIGINT REFERENCES widget_configs(id) ON DELETE SET NULL,

  nome TEXT,
  telefone TEXT,
  email TEXT,
  mensagem_inicial TEXT,

  -- Contexto da captura
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,

  -- Vinculação automática
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE SET NULL,

  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. AI_NEWS (Blog Auto-Atualizado)
-- Notícias de IA atualizadas diariamente
-- ============================================
CREATE TABLE IF NOT EXISTS ai_news (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  fonte TEXT, -- "OpenAI Blog", "TechCrunch", etc
  fonte_url TEXT,
  imagem_url TEXT,
  categoria TEXT DEFAULT 'IA',
  tags TEXT[] DEFAULT '{}',

  -- Gerado por IA?
  ai_generated BOOLEAN DEFAULT false,
  model_used TEXT,

  publicado BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_news_published ON ai_news(publicado, published_at DESC);

-- ============================================
-- 13. SKILLS_REGISTRY (Registro de Skills)
-- Skills integradas (OpenSquad, Marketing, Taste)
-- ============================================
CREATE TABLE IF NOT EXISTS skills_registry (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('orchestration', 'marketing', 'design', 'custom')),
  repo_url TEXT,
  version TEXT DEFAULT '1.0.0',

  -- Config
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,

  -- Quais agentes usam essa skill
  available_to_agents BIGINT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir skills padrão
INSERT INTO skills_registry (nome, descricao, tipo, repo_url) VALUES
  ('OpenSquad', 'Orquestração de equipes de agentes IA', 'orchestration', 'https://github.com/renatoasse/opensquad.git'),
  ('MarketingSkills', 'Copy, marketing e comunicação persuasiva', 'marketing', 'https://github.com/coreyhaines31/marketingskills.git'),
  ('Taste-Skill', 'Design e UI de alto padrão', 'design', 'https://github.com/Leonxlnx/taste-skill.git')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- RLS POLICIES - Novas tabelas
-- ============================================

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orgs" ON organizations FOR SELECT
  USING (owner_user_id = auth.uid() OR id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners manage orgs" ON organizations FOR ALL
  USING (owner_user_id = auth.uid());

-- Org Members
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see own org members" ON org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage members" ON org_members FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Channels
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see channels" ON channels FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage channels" ON channels FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY "Service manage channels" ON channels FOR ALL USING (true);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see contacts" ON contacts FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Members manage contacts" ON contacts FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Service manage contacts" ON contacts FOR ALL USING (true);

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see conversations" ON conversations FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Members manage conversations" ON conversations FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Service manage conversations" ON conversations FOR ALL USING (true);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see messages" ON messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM conversations WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "Service manage messages" ON messages FOR ALL USING (true);

-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see campaigns" ON campaigns FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage campaigns" ON campaigns FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Campaign Contacts
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see campaign_contacts" ON campaign_contacts FOR SELECT
  USING (campaign_id IN (SELECT id FROM campaigns WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "Service manage campaign_contacts" ON campaign_contacts FOR ALL USING (true);

-- Storage Files
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see storage_files" ON storage_files FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Members manage storage_files" ON storage_files FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Widget Configs
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see widget_configs" ON widget_configs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage widget_configs" ON widget_configs FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Widget Leads
ALTER TABLE widget_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see widget_leads" ON widget_leads FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Public insert widget_leads" ON widget_leads FOR INSERT WITH CHECK (true);

-- AI News (público para leitura)
ALTER TABLE ai_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published news" ON ai_news FOR SELECT USING (publicado = true);
CREATE POLICY "Authenticated manage news" ON ai_news FOR ALL USING (auth.role() = 'authenticated');

-- Skills Registry
ALTER TABLE skills_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read skills" ON skills_registry FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated manage skills" ON skills_registry FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ENABLE REALTIME - Novas tabelas
-- ============================================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE organizations; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE org_members; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE channels; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE contacts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE conversations; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE campaigns; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE widget_leads; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- TRIGGERS - Novas tabelas
-- ============================================

-- Auto-criar contato quando widget captura lead
CREATE OR REPLACE FUNCTION auto_create_contact_from_widget()
RETURNS TRIGGER AS $$
DECLARE
  new_contact_id BIGINT;
BEGIN
  -- Verifica se já existe contato com esse telefone na org
  SELECT id INTO new_contact_id FROM contacts
  WHERE org_id = NEW.org_id AND (telefone = NEW.telefone OR email = NEW.email)
  LIMIT 1;

  IF new_contact_id IS NULL THEN
    INSERT INTO contacts (org_id, nome, telefone, email, source, source_detail)
    VALUES (NEW.org_id, COALESCE(NEW.nome, 'Visitante'), NEW.telefone, NEW.email, 'widget', NEW.page_url)
    RETURNING id INTO new_contact_id;
  END IF;

  NEW.contact_id = new_contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_widget_lead_capture
  BEFORE INSERT ON widget_leads
  FOR EACH ROW EXECUTE FUNCTION auto_create_contact_from_widget();

-- Auto-update conversation counters
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET
    total_mensagens = total_mensagens + 1,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    unread_count = CASE WHEN NEW.sender_type = 'contact' THEN unread_count + 1 ELSE unread_count END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Auto-pause bot when human takes over
CREATE OR REPLACE FUNCTION auto_pause_bot_on_human_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_type = 'agent' THEN
    UPDATE conversations SET
      is_bot_active = false,
      paused_reason = 'human_takeover',
      paused_at = NOW(),
      assigned_to = NEW.sender_id::UUID
    WHERE id = NEW.conversation_id AND is_bot_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_human_message_pause_bot
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION auto_pause_bot_on_human_message();

-- Notificação para novo widget lead
CREATE OR REPLACE FUNCTION notify_widget_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificacoes (tipo, titulo, mensagem, link, icone)
  VALUES (
    'widget_lead',
    'Novo lead pelo Widget!',
    COALESCE(NEW.nome, 'Visitante') || ' - ' || COALESCE(NEW.telefone, NEW.email, 'sem contato'),
    '/crm/leads',
    'globe'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_widget_lead
  AFTER INSERT ON widget_leads
  FOR EACH ROW EXECUTE FUNCTION notify_widget_lead();

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Calcular typing delay baseado no tamanho do texto
CREATE OR REPLACE FUNCTION calculate_typing_delay(texto TEXT)
RETURNS INT AS $$
BEGIN
  RETURN LEAST(LENGTH(texto) * 50, 8000); -- max 8 segundos
END;
$$ LANGUAGE plpgsql;

-- Buscar agente ativo para um canal
CREATE OR REPLACE FUNCTION get_active_agent_for_channel(p_channel_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  agent_id BIGINT;
BEGIN
  -- Busca agente vinculado ao canal (via org)
  SELECT a.id INTO agent_id
  FROM agentes a
  JOIN channels c ON c.org_id = (SELECT org_id FROM channels WHERE id = p_channel_id)
  WHERE a.status = 'ativo'
  ORDER BY a.created_at ASC
  LIMIT 1;

  RETURN agent_id;
END;
$$ LANGUAGE plpgsql;
