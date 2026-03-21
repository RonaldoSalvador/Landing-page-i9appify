/**
 * Skills Engine - I9 Appify
 *
 * Carrega skills externas dos repositórios clonados e gera
 * system prompts turbinados para os agentes IA.
 *
 * Uso no frontend: gerenciamento de skills ativas por agente
 * Uso no backend (Edge Functions): gerar prompt final com skills injetadas
 */

// ============================================================
// REGISTRO DE SKILLS DISPONÍVEIS
// ============================================================

export const SKILLS_REGISTRY = {
  // --- MARKETING (MarketingSkills) ---
  copywriting: {
    id: 'copywriting',
    name: 'Copywriting Persuasivo',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Escreve copy de marketing clara, convincente e orientada a conversão. Headlines, CTAs, landing pages.',
    path: 'skills_externas/marketingskills/skills/copywriting/SKILL.md',
    recommended: true,
  },
  'cold-email': {
    id: 'cold-email',
    name: 'Cold Email / Prospecção',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Escreve emails frios B2B que soam humanos e geram respostas. Tom de par, não de vendedor.',
    path: 'skills_externas/marketingskills/skills/cold-email/SKILL.md',
    recommended: true,
  },
  'sales-enablement': {
    id: 'sales-enablement',
    name: 'Sales Enablement',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Cria materiais de vendas: one-pagers, battle cards, decks de vendas, scripts de demo.',
    path: 'skills_externas/marketingskills/skills/sales-enablement/SKILL.md',
    recommended: false,
  },
  'content-strategy': {
    id: 'content-strategy',
    name: 'Estratégia de Conteúdo',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Planejamento de conteúdo, calendário editorial, SEO e distribuição.',
    path: 'skills_externas/marketingskills/skills/content-strategy/SKILL.md',
    recommended: false,
  },
  'ad-creative': {
    id: 'ad-creative',
    name: 'Criação de Anúncios',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Gera copy para Google Ads, Meta Ads, LinkedIn Ads com specs de cada plataforma.',
    path: 'skills_externas/marketingskills/skills/ad-creative/SKILL.md',
    recommended: false,
  },
  'email-sequence': {
    id: 'email-sequence',
    name: 'Sequência de Email',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Cria sequências de email marketing, drip campaigns, onboarding e nurturing.',
    path: 'skills_externas/marketingskills/skills/email-sequence/SKILL.md',
    recommended: false,
  },
  'page-cro': {
    id: 'page-cro',
    name: 'CRO de Páginas',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Analisa páginas e sugere melhorias de conversão: headlines, CTAs, proof, objeções.',
    path: 'skills_externas/marketingskills/skills/page-cro/SKILL.md',
    recommended: false,
  },
  'pricing-strategy': {
    id: 'pricing-strategy',
    name: 'Estratégia de Preços',
    source: 'marketingskills',
    category: 'marketing',
    description: 'Define estratégia de pricing, tiers, packaging e posicionamento de preço.',
    path: 'skills_externas/marketingskills/skills/pricing-strategy/SKILL.md',
    recommended: false,
  },

  // --- DESIGN (Taste-Skill) ---
  'taste-design': {
    id: 'taste-design',
    name: 'Design Premium (Taste)',
    source: 'taste-skill',
    category: 'design',
    description: 'Gera UI premium com tipografia, cores, motion e layout de alto padrão. Anti-padrões genéricos.',
    path: 'skills_externas/taste-skill/taste-skill/SKILL.md',
    recommended: true,
  },
  'soft-design': {
    id: 'soft-design',
    name: 'Design Luxo (Soft)',
    source: 'taste-skill',
    category: 'design',
    description: 'Estética de luxo: whitespace generoso, fontes premium, cards com profundidade, spring animations.',
    path: 'skills_externas/taste-skill/soft-skill/SKILL.md',
    recommended: false,
  },
  'minimalist-design': {
    id: 'minimalist-design',
    name: 'Design Minimalista',
    source: 'taste-skill',
    category: 'design',
    description: 'Estilo editorial/Notion: monocromático quente, serif/sans-serif, bento grids flat.',
    path: 'skills_externas/taste-skill/minimalist-skill/SKILL.md',
    recommended: false,
  },

  // --- ORQUESTRAÇÃO (OpenSquad) ---
  'opensquad-orchestration': {
    id: 'opensquad-orchestration',
    name: 'Orquestração Multi-Agente',
    source: 'opensquad',
    category: 'orchestration',
    description: 'Cria e gerencia squads de agentes IA que trabalham em pipeline coordenado.',
    path: 'skills_externas/opensquad/.claude/skills/opensquad/SKILL.md',
    recommended: false,
  },

  // --- PROSPECÇÃO / GTM (Goose-Skills) ---
  'cold-email-outreach': {
    id: 'cold-email-outreach',
    name: 'Cold Outreach Avançado',
    source: 'goose-skills',
    category: 'prospecting',
    description: 'Sistema completo de prospecção fria: pesquisa, personalização, sequência multi-touch.',
    path: 'skills_externas/goose-skills/skills/capabilities/cold-email-outreach/SKILL.md',
    recommended: true,
  },
  'competitor-intel': {
    id: 'competitor-intel',
    name: 'Inteligência Competitiva',
    source: 'goose-skills',
    category: 'prospecting',
    description: 'Análise de concorrentes: battlecards, posicionamento, pricing intel, tech stack.',
    path: 'skills_externas/goose-skills/skills/composites/competitor-intel/SKILL.md',
    recommended: false,
  },
  'seo-content-engine': {
    id: 'seo-content-engine',
    name: 'Motor de Conteúdo SEO',
    source: 'goose-skills',
    category: 'prospecting',
    description: 'Pipeline completo de SEO: auditoria, gaps, arquitetura de keywords, calendário, drafts.',
    path: 'skills_externas/goose-skills/skills/playbooks/seo-content-engine/SKILL.md',
    recommended: false,
  },
}

// ============================================================
// CONTEXTO DE PRODUTO DA I9 APPIFY
// ============================================================

export const I9_PRODUCT_CONTEXT = `
## Contexto de Produto - i9 Appify

### O que é
Empresa de tecnologia que transforma ideias em aplicativos funcionais e eficientes.
Resolve problemas reais e contribui para o crescimento dos clientes.

### Produtos
1. **SaaS Central CRM** - Plataforma que centraliza CRM, gestão de agentes IA e atendimento via WhatsApp
2. **Apps Personalizados** - Desenvolvimento sob demanda para PMEs
3. **Automações com IA** - Integração de agentes inteligentes em processos de negócio

### Público-alvo
PMEs brasileiras que precisam de tecnologia para crescer. Foco em:
- Escritórios de advocacia
- Pizzarias e restaurantes
- Profissionais liberais
- Pequenas empresas que querem automatizar atendimento

### Diferenciais
- Atendimento personalizado com agentes IA 24h
- CRM integrado com WhatsApp
- Preços acessíveis para PMEs
- Suporte humano + IA combinados

### Tom de voz
Profissional mas acessível. Direto ao ponto. Sem jargão técnico desnecessário.
Usa "você" (não "senhor"). Confiante mas não arrogante.

### Clientes ativos
- Baraka Pizza (Espanha) - Atendente virtual Luna no WhatsApp
- Escritório de Advocacia - App com QR Code em peças jurídicas

### Missão
Democratizar o acesso à tecnologia para pequenas empresas através de soluções inteligentes e acessíveis.
`

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Extrai o conteúdo de um SKILL.md (tudo depois do YAML frontmatter)
 */
export function extractSkillContent(rawMarkdown) {
  if (!rawMarkdown) return ''

  // Remove YAML frontmatter (entre --- e ---)
  const frontmatterEnd = rawMarkdown.indexOf('---', rawMarkdown.indexOf('---') + 3)
  if (frontmatterEnd === -1) return rawMarkdown.trim()

  return rawMarkdown.slice(frontmatterEnd + 3).trim()
}

/**
 * Gera o system prompt turbinado para um agente
 *
 * @param {object} agentConfig - Configuração do agente do Supabase
 * @param {string} agentConfig.nome - Nome do agente
 * @param {string} agentConfig.prompt_sistema - Prompt base do agente
 * @param {string[]} activeSkillIds - IDs das skills ativas para este agente
 * @param {object} skillContents - Mapa de skill_id -> conteúdo markdown já carregado
 * @returns {string} System prompt completo com skills injetadas
 */
export function generateEnhancedSystemPrompt(agentConfig, activeSkillIds = [], skillContents = {}) {
  const parts = []

  // 1. Prompt base do agente
  parts.push(agentConfig.prompt_sistema || '')

  // 2. Contexto de produto da I9 Appify
  parts.push('\n\n---\n' + I9_PRODUCT_CONTEXT)

  // 3. Skills ativas injetadas
  if (activeSkillIds.length > 0) {
    parts.push('\n\n---\n## Skills Ativas\n')

    for (const skillId of activeSkillIds) {
      const skill = SKILLS_REGISTRY[skillId]
      const content = skillContents[skillId]

      if (skill && content) {
        const extracted = extractSkillContent(content)
        parts.push(`\n### [Skill: ${skill.name}]\n${extracted}\n`)
      }
    }
  }

  return parts.join('')
}

/**
 * Retorna lista de skills agrupadas por categoria para o frontend
 */
export function getSkillsByCategory() {
  const categories = {
    marketing: { label: 'Marketing & Copy', icon: 'Megaphone', skills: [] },
    design: { label: 'Design & UI', icon: 'Palette', skills: [] },
    orchestration: { label: 'Orquestração', icon: 'Network', skills: [] },
    prospecting: { label: 'Prospecção & GTM', icon: 'Target', skills: [] },
  }

  Object.values(SKILLS_REGISTRY).forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category].skills.push(skill)
    }
  })

  return categories
}

/**
 * Retorna as skills recomendadas para ativação imediata
 */
export function getRecommendedSkills() {
  return Object.values(SKILLS_REGISTRY).filter(s => s.recommended)
}

/**
 * Gera o SQL para popular a tabela skills_registry no Supabase
 */
export function generateSkillsSQL() {
  const values = Object.values(SKILLS_REGISTRY).map(skill => {
    const name = skill.name.replace(/'/g, "''")
    const desc = skill.description.replace(/'/g, "''")
    return `('${skill.id}', '${name}', '${skill.source}', '${skill.category}', '${desc}', '${skill.path}', ${skill.recommended})`
  })

  return `
-- Inserir skills no registro
INSERT INTO skills_registry (slug, nome, source, category, description, file_path, recommended)
VALUES
${values.join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  description = EXCLUDED.description,
  file_path = EXCLUDED.file_path,
  recommended = EXCLUDED.recommended;
`
}
