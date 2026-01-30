/**
 * API Webhook para integração com ClawdBot e n8n
 * 
 * Este módulo documenta como integrar o ClawdBot com o CRM
 * 
 * URL para configurar no ClawdBot:
 * POST https://YOUR-PROJECT.supabase.co/rest/v1/leads
 * 
 * Headers necessários:
 * - apikey: sua_anon_key_do_supabase
 * - Authorization: Bearer sua_anon_key_do_supabase
 * - Content-Type: application/json
 * - Prefer: return=minimal
 */

// Formato do JSON que o ClawdBot deve enviar:
export const webhookPayloadExample = {
  nome: "Nome do contato",
  email: "email@exemplo.com",
  whatsapp: "5531999999999",
  empresa: "Nome da empresa",
  tipo_servico: "automacao", // ou "app" ou "site"
  descricao: "Mensagem capturada do WhatsApp",
  orcamento: "Não informado",
  status: "novo",
  origem: "whatsapp" // Importante: marcar como whatsapp!
}

// Função para enviar lead via JavaScript (se precisar)
export async function enviarLeadParaCRM(leadData) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      ...leadData,
      origem: leadData.origem || 'whatsapp',
      status: 'novo',
      created_at: new Date().toISOString()
    })
  })

  return response.json()
}

/**
 * CONFIGURAÇÃO NO CLAWDBOT:
 * 
 * 1. Acesse o painel do ClawdBot
 * 2. Vá em Configurações > Webhooks
 * 3. Adicione um novo webhook:
 *    - URL: https://ldqjunoqeepcdctheidd.supabase.co/rest/v1/leads
 *    - Método: POST
 *    - Headers:
 *      apikey: [sua_anon_key]
 *      Authorization: Bearer [sua_anon_key]
 *      Content-Type: application/json
 *    - Body: Mapear os campos capturados para o formato JSON acima
 * 
 * 4. Configure os gatilhos (triggers):
 *    - Quando um novo contato for capturado
 *    - Quando completar o fluxo de qualificação
 * 
 * CONFIGURAÇÃO NO N8N:
 * 
 * 1. Use o nó "HTTP Request"
 * 2. Configure:
 *    - Method: POST
 *    - URL: https://ldqjunoqeepcdctheidd.supabase.co/rest/v1/leads
 *    - Authentication: Header Auth
 *      Name: apikey
 *      Value: [sua_anon_key]
 *    - Body: JSON com os campos do lead
 */

// Templates de mensagem para WhatsApp (definidos no banco)
export const templatesDisponiveis = [
  {
    nome: 'Boas-vindas',
    conteudo: 'Olá {{nome}}! 👋 Obrigado pelo interesse na I9 Appify. Em que posso ajudar?',
    variaveis: ['{{nome}}']
  },
  {
    nome: 'Follow-up',
    conteudo: 'Oi {{nome}}, tudo bem? Passou a considerar nossa proposta para {{empresa}}?',
    variaveis: ['{{nome}}', '{{empresa}}']
  },
  {
    nome: 'Proposta Enviada',
    conteudo: 'Olá {{nome}}! Acabei de enviar a proposta para o seu email. Qualquer dúvida, estou à disposição!',
    variaveis: ['{{nome}}']
  }
]

// Função para aplicar template
export function aplicarTemplate(template, lead) {
  let mensagem = template.conteudo

  mensagem = mensagem.replace(/{{nome}}/g, lead.nome || '')
  mensagem = mensagem.replace(/{{empresa}}/g, lead.empresa || '')
  mensagem = mensagem.replace(/{{email}}/g, lead.email || '')
  mensagem = mensagem.replace(/{{whatsapp}}/g, lead.whatsapp || '')

  return mensagem
}

// Gerar link do WhatsApp com template
export function gerarLinkWhatsApp(telefone, mensagem) {
  const numero = telefone.replace(/\D/g, '')
  const texto = encodeURIComponent(mensagem)
  return `https://wa.me/${numero}?text=${texto}`
}
