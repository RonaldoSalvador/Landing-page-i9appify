// ============================================
// WIDGET CAPTURE - Captura de Leads do Widget
// Recebe dados do widget embeddable e cria contato + conversa
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Widget-Id',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const {
      widgetId,
      nome,
      telefone,
      email,
      mensagem,
      pageUrl,
      pageTitle,
      referrer,
      userAgent,
    } = await req.json()

    // Buscar config do widget
    let orgId: number
    let widgetConfig: any = null

    if (widgetId) {
      const { data } = await supabase
        .from('widget_configs')
        .select('*')
        .eq('id', widgetId)
        .eq('is_active', true)
        .single()
      widgetConfig = data
      orgId = data?.org_id
    }

    if (!orgId!) {
      // Se não tem widget específico, usa a primeira org
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      orgId = org?.id || 1
    }

    // Salvar lead do widget (o trigger auto_create_contact_from_widget cuida do resto)
    const { data: widgetLead, error } = await supabase
      .from('widget_leads')
      .insert({
        org_id: orgId,
        widget_id: widgetConfig?.id || null,
        nome,
        telefone,
        email,
        mensagem_inicial: mensagem,
        page_url: pageUrl,
        page_title: pageTitle,
        referrer,
        user_agent: userAgent,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      })
      .select('*, contact_id')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }

    // Também criar lead no sistema existente (compatibilidade)
    await supabase.from('leads').insert({
      nome: nome || 'Visitante Widget',
      email: email || '',
      whatsapp: telefone || '',
      origem: 'widget',
      status: 'novo',
      descricao: `Capturado pelo widget na página: ${pageUrl}. Mensagem: ${mensagem || 'nenhuma'}`,
    })

    // Se o widget tem um agente IA e canal vinculado, iniciar conversa
    if (widgetConfig?.channel_id && telefone) {
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          org_id: orgId,
          contact_id: widgetLead.contact_id,
          channel_id: widgetConfig.channel_id,
          ai_agent_id: widgetConfig.ai_agent_id,
          is_bot_active: !!widgetConfig.ai_agent_id,
          status: 'open',
        })
        .select('id')
        .single()

      // Enviar mensagem de boas-vindas pelo WhatsApp
      if (conversation && widgetConfig.channel_id) {
        const greeting = widgetConfig.greeting_message || 'Olá! Como posso te ajudar?'
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            channelId: widgetConfig.channel_id,
            phone: telefone,
            message: greeting.replace('{{nome}}', nome || 'Visitante'),
            conversationId: conversation.id,
          }),
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      leadId: widgetLead.id,
      contactId: widgetLead.contact_id,
      message: 'Lead capturado com sucesso!',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[widget-capture] Erro:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
