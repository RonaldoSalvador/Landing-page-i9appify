// ============================================
// WEBHOOK RECEIVER - Multi-API WhatsApp
// Recebe webhooks de Z-API, Evolution API e WhatsApp Oficial
// Normaliza para formato padrão e processa a mensagem
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ============================================
// TIPOS
// ============================================
interface NormalizedMessage {
  phone: string
  name: string
  content: string
  mediaType: 'text' | 'audio' | 'image' | 'video' | 'document' | 'sticker' | 'location'
  mediaUrl?: string
  mediaFilename?: string
  externalId?: string
  timestamp: string
  isFromMe: boolean
}

interface ChannelInfo {
  id: number
  org_id: number
  tipo: string
  credentials: Record<string, string>
  config: Record<string, any>
}

// ============================================
// NORMALIZERS - Cada API tem seu formato
// ============================================

function normalizeZAPI(body: any): NormalizedMessage | null {
  // Z-API envia no formato: { phone, message: { ... }, ... }
  if (body.isStatusReply || body.isEdit) return null

  const isFromMe = body.fromMe || false
  const phone = (body.phone || body.chatId || '').replace('@c.us', '').replace(/\D/g, '')
  if (!phone) return null

  let content = ''
  let mediaType: NormalizedMessage['mediaType'] = 'text'
  let mediaUrl = ''

  if (body.text?.message) {
    content = body.text.message
  } else if (body.audio?.audioUrl) {
    mediaType = 'audio'
    mediaUrl = body.audio.audioUrl
    content = '[Áudio recebido]'
  } else if (body.image?.imageUrl) {
    mediaType = 'image'
    mediaUrl = body.image.imageUrl
    content = body.image.caption || '[Imagem recebida]'
  } else if (body.video?.videoUrl) {
    mediaType = 'video'
    mediaUrl = body.video.videoUrl
    content = body.video.caption || '[Vídeo recebido]'
  } else if (body.document?.documentUrl) {
    mediaType = 'document'
    mediaUrl = body.document.documentUrl
    content = body.document.fileName || '[Documento recebido]'
  } else {
    content = body.body || body.caption || ''
  }

  return {
    phone,
    name: body.senderName || body.pushName || phone,
    content,
    mediaType,
    mediaUrl: mediaUrl || undefined,
    externalId: body.messageId || body.id,
    timestamp: body.momment || new Date().toISOString(),
    isFromMe,
  }
}

function normalizeEvolution(body: any): NormalizedMessage | null {
  // Evolution API v2 webhook format
  const data = body.data || body
  if (!data?.key?.remoteJid) return null

  const isFromMe = data.key?.fromMe || false
  const phone = data.key.remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace(/\D/g, '')
  if (!phone) return null

  const msg = data.message || {}
  let content = ''
  let mediaType: NormalizedMessage['mediaType'] = 'text'
  let mediaUrl = ''

  if (msg.conversation || msg.extendedTextMessage?.text) {
    content = msg.conversation || msg.extendedTextMessage?.text || ''
  } else if (msg.audioMessage) {
    mediaType = 'audio'
    mediaUrl = msg.audioMessage.url || ''
    content = '[Áudio recebido]'
  } else if (msg.imageMessage) {
    mediaType = 'image'
    mediaUrl = msg.imageMessage.url || ''
    content = msg.imageMessage.caption || '[Imagem recebida]'
  } else if (msg.videoMessage) {
    mediaType = 'video'
    mediaUrl = msg.videoMessage.url || ''
    content = msg.videoMessage.caption || '[Vídeo recebido]'
  } else if (msg.documentMessage) {
    mediaType = 'document'
    mediaUrl = msg.documentMessage.url || ''
    content = msg.documentMessage.fileName || '[Documento recebido]'
  }

  return {
    phone,
    name: data.pushName || phone,
    content,
    mediaType,
    mediaUrl: mediaUrl || undefined,
    externalId: data.key?.id,
    timestamp: new Date((data.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
    isFromMe,
  }
}

function normalizeWhatsAppOfficial(body: any): NormalizedMessage | null {
  // Meta WhatsApp Cloud API webhook format
  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  if (!value?.messages?.[0]) return null

  const message = value.messages[0]
  const contact = value.contacts?.[0]
  const phone = message.from?.replace(/\D/g, '') || ''
  if (!phone) return null

  let content = ''
  let mediaType: NormalizedMessage['mediaType'] = 'text'
  let mediaUrl = ''

  switch (message.type) {
    case 'text':
      content = message.text?.body || ''
      break
    case 'audio':
      mediaType = 'audio'
      // Para baixar mídia da API oficial, precisa fazer GET com o media_id
      mediaUrl = `media://${message.audio?.id}`
      content = '[Áudio recebido]'
      break
    case 'image':
      mediaType = 'image'
      mediaUrl = `media://${message.image?.id}`
      content = message.image?.caption || '[Imagem recebida]'
      break
    case 'video':
      mediaType = 'video'
      mediaUrl = `media://${message.video?.id}`
      content = message.video?.caption || '[Vídeo recebido]'
      break
    case 'document':
      mediaType = 'document'
      mediaUrl = `media://${message.document?.id}`
      content = message.document?.filename || '[Documento recebido]'
      break
    default:
      content = `[${message.type}]`
  }

  return {
    phone,
    name: contact?.profile?.name || phone,
    content,
    mediaType,
    mediaUrl: mediaUrl || undefined,
    externalId: message.id,
    timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
    isFromMe: false,
  }
}

// ============================================
// DETECTAR PROVEDOR pelo payload
// ============================================
function detectProvider(body: any, headers: Headers): string {
  // WhatsApp Oficial (Meta) tem o campo "object": "whatsapp_business_account"
  if (body.object === 'whatsapp_business_account') return 'whatsapp_official'

  // Z-API geralmente tem "phone" e "isGroup"
  if (body.phone !== undefined && (body.isGroup !== undefined || body.isStatusReply !== undefined)) return 'zapi'

  // Evolution API tem "instance" e "data.key"
  if (body.instance || body.data?.key || body.event) return 'evolution'

  // Fallback: tentar pelo header
  const userAgent = headers.get('user-agent') || ''
  if (userAgent.includes('Z-API')) return 'zapi'
  if (userAgent.includes('Evolution')) return 'evolution'

  return 'unknown'
}

// ============================================
// BUSCAR CANAL pelo provedor e credenciais
// ============================================
async function findChannel(provider: string, body: any): Promise<ChannelInfo | null> {
  let query = supabase.from('channels').select('*').eq('status', 'connected')

  switch (provider) {
    case 'zapi':
      // Z-API: busca pelo instance_id nas credenciais
      const instanceId = body.instanceId || ''
      const { data: zapiChannels } = await query.eq('tipo', 'zapi')
      return zapiChannels?.find((c: any) => c.credentials?.instance_id === instanceId) || zapiChannels?.[0] || null

    case 'evolution':
      // Evolution: busca pelo nome da instância
      const instanceName = body.instance || body.data?.instance || ''
      const { data: evoChannels } = await query.in('tipo', ['evolution', 'whatsapp_qrcode'])
      return evoChannels?.find((c: any) => c.credentials?.instance_name === instanceName) || evoChannels?.[0] || null

    case 'whatsapp_official':
      // Oficial: busca pelo phone_number_id
      const phoneNumberId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id || ''
      const { data: officialChannels } = await query.eq('tipo', 'whatsapp_official')
      return officialChannels?.find((c: any) => c.credentials?.phone_number_id === phoneNumberId) || officialChannels?.[0] || null

    default:
      return null
  }
}

// ============================================
// PROCESSAR MENSAGEM
// ============================================
async function processMessage(msg: NormalizedMessage, channel: ChannelInfo) {
  if (msg.isFromMe) return // Ignora mensagens enviadas por nós

  const orgId = channel.org_id

  // 1. Buscar ou criar contato
  let { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('org_id', orgId)
    .eq('telefone', msg.phone)
    .single()

  if (!contact) {
    const { data: newContact } = await supabase
      .from('contacts')
      .insert({
        org_id: orgId,
        nome: msg.name,
        telefone: msg.phone,
        source: 'whatsapp',
      })
      .select('id')
      .single()
    contact = newContact
  }

  // 2. Buscar ou criar conversa
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('org_id', orgId)
    .eq('contact_id', contact!.id)
    .in('status', ['open', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    // Buscar agente IA ativo para esta org
    const { data: agent } = await supabase
      .from('agentes')
      .select('id')
      .eq('status', 'ativo')
      .limit(1)
      .single()

    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        org_id: orgId,
        contact_id: contact!.id,
        channel_id: channel.id,
        ai_agent_id: agent?.id || null,
        is_bot_active: !!agent,
        status: 'open',
      })
      .select('*')
      .single()
    conversation = newConv
  }

  // 3. Se é áudio, transcrever antes de processar
  let finalContent = msg.content
  let audioTranscription = null
  if (msg.mediaType === 'audio' && msg.mediaUrl) {
    try {
      const transcribeResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            audioUrl: msg.mediaUrl,
            channelType: channel.tipo,
            credentials: channel.credentials,
          }),
        }
      )
      const transcribeResult = await transcribeResponse.json()
      if (transcribeResult.text) {
        audioTranscription = transcribeResult.text
        finalContent = transcribeResult.text
      }
    } catch (e) {
      console.error('Erro ao transcrever áudio:', e)
    }
  }

  // 4. Salvar mensagem
  const { data: savedMessage } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation!.id,
      sender_type: 'contact',
      sender_id: msg.phone,
      sender_name: msg.name,
      content: finalContent,
      media_url: msg.mediaUrl,
      media_type: msg.mediaType,
      is_audio_transcription: !!audioTranscription,
      audio_transcription: audioTranscription,
      external_id: msg.externalId,
      delivery_status: 'delivered',
    })
    .select('id')
    .single()

  // 5. Manter compatibilidade com chat_history existente
  await supabase.from('chat_history').insert({
    agente_id: conversation!.ai_agent_id,
    telefone_whatsapp: msg.phone,
    role: 'user',
    mensagem: finalContent,
    tipo_midia: msg.mediaType,
    midia_url: msg.mediaUrl,
  })

  // 6. Se bot está ativo, encaminhar para o agente IA
  if (conversation!.is_bot_active && conversation!.ai_agent_id) {
    await forwardToAIAgent(conversation!, msg, finalContent, channel)
  }
}

// ============================================
// ENCAMINHAR PARA AGENTE IA (n8n ou Dify)
// ============================================
async function forwardToAIAgent(conversation: any, msg: NormalizedMessage, content: string, channel: ChannelInfo) {
  const { data: agent } = await supabase
    .from('agentes')
    .select('*')
    .eq('id', conversation.ai_agent_id)
    .single()

  if (!agent) return

  // Buscar histórico recente
  const { data: history } = await supabase
    .from('messages')
    .select('sender_type, content')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: false })
    .limit(15)

  const formattedHistory = (history || []).reverse().map((m: any) => ({
    role: m.sender_type === 'contact' ? 'user' : 'assistant',
    content: m.content,
  }))

  // Chamada para o agente IA existente (agente-ronaldo) ou webhook externo
  const startTime = Date.now()

  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/agente-ronaldo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          phone: msg.phone,
          message: content,
          agentId: agent.id,
          conversationId: conversation.id,
          history: formattedHistory,
        }),
      }
    )

    const result = await response.json()
    const latency = Date.now() - startTime

    if (result.reply) {
      // Calcular typing delay
      const typingDelay = Math.min(result.reply.length * 50, 8000)

      // Salvar resposta do bot
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'bot',
        sender_id: agent.id.toString(),
        sender_name: agent.nome,
        content: result.reply,
        media_type: 'text',
        typing_delay_ms: typingDelay,
        model_used: agent.modelo,
        tokens_input: result.tokensInput,
        tokens_output: result.tokensOutput,
        latency_ms: latency,
        tools_used: result.toolsUsed || [],
        delivery_status: 'pending',
      })

      // Simular "digitando..." e enviar a resposta
      await new Promise(resolve => setTimeout(resolve, typingDelay))

      // Enviar via send-message
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            channelId: channel.id,
            phone: msg.phone,
            message: result.reply,
            conversationId: conversation.id,
          }),
        }
      )
    }
  } catch (e) {
    console.error('Erro ao chamar agente IA:', e)
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
Deno.serve(async (req) => {
  // Verificação de webhook do WhatsApp Oficial (GET challenge)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('WEBHOOK_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // POST - Mensagem recebida
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const headers = req.headers
      const provider = detectProvider(body, headers)

      console.log(`[webhook-receiver] Provider: ${provider}`)

      let normalizedMsg: NormalizedMessage | null = null

      switch (provider) {
        case 'zapi':
          normalizedMsg = normalizeZAPI(body)
          break
        case 'evolution':
          normalizedMsg = normalizeEvolution(body)
          break
        case 'whatsapp_official':
          normalizedMsg = normalizeWhatsAppOfficial(body)
          break
        default:
          console.warn('[webhook-receiver] Provider desconhecido')
          return new Response(JSON.stringify({ error: 'Unknown provider' }), { status: 400 })
      }

      if (!normalizedMsg) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
      }

      // Buscar canal
      const channel = await findChannel(provider, body)
      if (!channel) {
        console.warn('[webhook-receiver] Canal não encontrado')
        return new Response(JSON.stringify({ error: 'Channel not found' }), { status: 404 })
      }

      // Processar mensagem (async, não bloqueia o webhook)
      processMessage(normalizedMsg, channel).catch(e => console.error('Erro processando:', e))

      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    } catch (e) {
      console.error('[webhook-receiver] Erro:', e)
      return new Response(JSON.stringify({ error: e.message }), { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
