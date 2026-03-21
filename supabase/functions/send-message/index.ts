// ============================================
// SEND MESSAGE - Multi-API WhatsApp
// Envia mensagens via Z-API, Evolution API ou WhatsApp Oficial
// Adapter Pattern: uma interface, múltiplos provedores
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ============================================
// ADAPTERS
// ============================================

async function sendViaZAPI(credentials: any, phone: string, message: string, mediaUrl?: string, mediaType?: string) {
  const { instance_id, token, client_token } = credentials
  const baseUrl = `https://api.z-api.io/instances/${instance_id}/token/${token}`

  let endpoint = '/send-text'
  let body: any = { phone, message }

  if (mediaUrl && mediaType) {
    switch (mediaType) {
      case 'image':
        endpoint = '/send-image'
        body = { phone, image: mediaUrl, caption: message }
        break
      case 'audio':
        endpoint = '/send-audio'
        body = { phone, audio: mediaUrl }
        break
      case 'document':
        endpoint = '/send-document/{extension}'
        body = { phone, document: mediaUrl, fileName: 'documento' }
        break
      case 'video':
        endpoint = '/send-video'
        body = { phone, video: mediaUrl, caption: message }
        break
    }
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': client_token,
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()
  return { success: response.ok, externalId: result.messageId || result.zapiMessageId, raw: result }
}

async function sendViaEvolution(credentials: any, phone: string, message: string, mediaUrl?: string, mediaType?: string) {
  const { api_url, api_key, instance_name } = credentials
  const baseUrl = `${api_url}`

  let endpoint = `/message/sendText/${instance_name}`
  let body: any = {
    number: phone,
    text: message,
  }

  if (mediaUrl && mediaType) {
    endpoint = `/message/sendMedia/${instance_name}`
    body = {
      number: phone,
      mediatype: mediaType,
      media: mediaUrl,
      caption: message,
    }
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': api_key,
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()
  return { success: response.ok, externalId: result.key?.id, raw: result }
}

async function sendViaWhatsAppOfficial(credentials: any, phone: string, message: string, mediaUrl?: string, mediaType?: string) {
  const { phone_number_id, access_token } = credentials
  const baseUrl = `https://graph.facebook.com/v21.0/${phone_number_id}/messages`

  let body: any = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message },
  }

  if (mediaUrl && mediaType) {
    switch (mediaType) {
      case 'image':
        body = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'image',
          image: { link: mediaUrl, caption: message },
        }
        break
      case 'audio':
        body = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'audio',
          audio: { link: mediaUrl },
        }
        break
      case 'document':
        body = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'document',
          document: { link: mediaUrl, caption: message },
        }
        break
      case 'video':
        body = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'video',
          video: { link: mediaUrl, caption: message },
        }
        break
    }
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()
  return { success: response.ok, externalId: result.messages?.[0]?.id, raw: result }
}

// ============================================
// ENVIAR TEMPLATE (para Disparos em Massa - só API Oficial)
// ============================================
async function sendTemplateViaOfficial(credentials: any, phone: string, templateName: string, language: string, variables: Record<string, string>) {
  const { phone_number_id, access_token } = credentials

  const components: any[] = []
  const varValues = Object.values(variables)
  if (varValues.length > 0) {
    components.push({
      type: 'body',
      parameters: varValues.map(v => ({ type: 'text', text: v })),
    })
  }

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${phone_number_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()
  return { success: response.ok, externalId: result.messages?.[0]?.id, raw: result }
}

// ============================================
// SIMULAR "DIGITANDO..." antes de enviar
// ============================================
async function simulateTyping(credentials: any, channelType: string, phone: string) {
  try {
    switch (channelType) {
      case 'zapi': {
        const { instance_id, token, client_token } = credentials
        await fetch(`https://api.z-api.io/instances/${instance_id}/token/${token}/send-typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Client-Token': client_token },
          body: JSON.stringify({ phone, duration: 3000 }),
        })
        break
      }
      case 'evolution':
      case 'whatsapp_qrcode': {
        const { api_url, api_key, instance_name } = credentials
        await fetch(`${api_url}/chat/presence/${instance_name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': api_key },
          body: JSON.stringify({ number: phone, presence: 'composing' }),
        })
        break
      }
      // WhatsApp Oficial não suporta "typing" nativo
    }
  } catch (e) {
    console.warn('Erro ao simular typing:', e)
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const {
      channelId,
      phone,
      message,
      conversationId,
      mediaUrl,
      mediaType,
      templateName,
      templateLanguage,
      templateVariables,
      simulateTypingDelay,
    } = await req.json()

    if (!channelId || !phone) {
      return new Response(JSON.stringify({ error: 'channelId and phone required' }), { status: 400 })
    }

    // Buscar canal
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single()

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: 'Channel not found' }), { status: 404 })
    }

    // Simular "digitando..."
    if (simulateTypingDelay !== false) {
      await simulateTyping(channel.credentials, channel.tipo, phone)
      const delay = Math.min((message || '').length * 50, 8000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    let result: any

    // Template (disparos em massa) - só API Oficial
    if (templateName) {
      if (channel.tipo !== 'whatsapp_official') {
        return new Response(JSON.stringify({ error: 'Templates only supported on Official API' }), { status: 400 })
      }
      result = await sendTemplateViaOfficial(channel.credentials, phone, templateName, templateLanguage || 'pt_BR', templateVariables || {})
    }
    // Mensagem normal
    else {
      switch (channel.tipo) {
        case 'zapi':
          result = await sendViaZAPI(channel.credentials, phone, message, mediaUrl, mediaType)
          break
        case 'evolution':
        case 'whatsapp_qrcode':
          result = await sendViaEvolution(channel.credentials, phone, message, mediaUrl, mediaType)
          break
        case 'whatsapp_official':
          result = await sendViaWhatsAppOfficial(channel.credentials, phone, message, mediaUrl, mediaType)
          break
        default:
          return new Response(JSON.stringify({ error: `Unsupported channel type: ${channel.tipo}` }), { status: 400 })
      }
    }

    // Atualizar status de entrega na mensagem (se tiver conversationId)
    if (conversationId && result.success) {
      await supabase
        .from('messages')
        .update({ delivery_status: 'sent', external_id: result.externalId })
        .eq('conversation_id', conversationId)
        .eq('delivery_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
    }

    return new Response(JSON.stringify({ success: result.success, externalId: result.externalId }), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[send-message] Erro:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
