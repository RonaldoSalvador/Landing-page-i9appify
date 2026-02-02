// CRM API para ClawdBot - Supabase Edge Function
// Deploy: npx supabase functions deploy crm-api

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// API Key para autenticação do ClawdBot
const API_KEY = Deno.env.get('CLAWDBOT_API_KEY') || 'i9appify-clawdbot-2024-secret'

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Helpers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
}

function errorResponse(message: string, status = 400) {
    return jsonResponse({ error: message, success: false }, status)
}

// Normaliza telefone (remove +55, espaços, etc)
function normalizeTelefone(tel: string): string {
    return tel.replace(/\D/g, '').slice(-11)
}

// Verifica API Key
function checkApiKey(req: Request): boolean {
    const key = req.headers.get('x-api-key')
    return key === API_KEY
}

// Router
Deno.serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Auth check
    if (!checkApiKey(req)) {
        return errorResponse('API Key inválida', 401)
    }

    const url = new URL(req.url)
    const path = url.pathname.replace('/crm-api', '')
    const method = req.method

    try {
        // ========== LEADS ==========

        // POST /leads - Criar lead
        if (method === 'POST' && path === '/leads') {
            const body = await req.json()
            const { nome, telefone, email, empresa, necessidade, origem = 'whatsapp' } = body

            if (!nome || !telefone) {
                return errorResponse('Nome e telefone são obrigatórios')
            }

            const { data, error } = await supabase
                .from('leads')
                .insert({
                    nome,
                    whatsapp: normalizeTelefone(telefone),
                    email: email || '',
                    empresa: empresa || '',
                    tipo_servico: necessidade || '',
                    origem,
                    status: 'novo',
                    created_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return jsonResponse({ success: true, lead: data }, 201)
        }

        // GET /leads/:telefone - Buscar por telefone
        if (method === 'GET' && path.startsWith('/leads/')) {
            const telefone = path.split('/')[2]

            if (!telefone) {
                return errorResponse('Telefone é obrigatório')
            }

            const telNormalizado = normalizeTelefone(telefone)

            const { data, error } = await supabase
                .from('leads')
                .select('*, reunioes(*), atividades(*)')
                .ilike('whatsapp', `%${telNormalizado.slice(-9)}%`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (!data) {
                return jsonResponse({ exists: false, lead: null })
            }

            return jsonResponse({ exists: true, lead: data })
        }

        // GET /leads - Listar leads
        if (method === 'GET' && path === '/leads') {
            const status = url.searchParams.get('status')
            const limit = parseInt(url.searchParams.get('limit') || '50')

            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)

            if (status) {
                query = query.eq('status', status)
            }

            const { data, error } = await query
            if (error) throw error

            return jsonResponse({ leads: data, total: data.length })
        }

        // PATCH /leads/:id - Atualizar lead
        if (method === 'PATCH' && path.match(/^\/leads\/\d+$/)) {
            const id = path.split('/')[2]
            const body = await req.json()

            const { data, error } = await supabase
                .from('leads')
                .update({ ...body, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return jsonResponse({ success: true, lead: data })
        }

        // ========== INTERAÇÕES ==========

        // POST /interacoes - Registrar interação
        if (method === 'POST' && path === '/interacoes') {
            const body = await req.json()
            const { lead_id, tipo, resumo, dados } = body

            if (!lead_id || !tipo) {
                return errorResponse('lead_id e tipo são obrigatórios')
            }

            const { data, error } = await supabase
                .from('atividades')
                .insert({
                    lead_id,
                    tipo,
                    dados: { resumo, ...dados },
                    created_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return jsonResponse({ success: true, interacao: data }, 201)
        }

        // GET /interacoes/:lead_id - Histórico
        if (method === 'GET' && path.match(/^\/interacoes\/\d+$/)) {
            const lead_id = path.split('/')[2]

            const { data, error } = await supabase
                .from('atividades')
                .select('*')
                .eq('lead_id', lead_id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return jsonResponse({ interacoes: data })
        }

        // ========== REUNIÕES ==========

        // POST /reunioes - Criar reunião
        if (method === 'POST' && path === '/reunioes') {
            const body = await req.json()
            const { lead_id, titulo, data_hora, link_meet, duracao = 30, tipo = 'call' } = body

            if (!lead_id || !data_hora) {
                return errorResponse('lead_id e data_hora são obrigatórios')
            }

            const { data, error } = await supabase
                .from('reunioes')
                .insert({
                    lead_id,
                    titulo: titulo || 'Reunião I9 Appify',
                    data_hora,
                    link_meet,
                    duracao,
                    tipo,
                    status: 'agendada',
                    origem: 'whatsapp',
                    created_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            return jsonResponse({ success: true, reuniao: data }, 201)
        }

        // GET /reunioes - Listar reuniões
        if (method === 'GET' && path === '/reunioes') {
            const status = url.searchParams.get('status')
            const data_inicio = url.searchParams.get('data_inicio')

            let query = supabase
                .from('reunioes')
                .select('*, leads(nome, whatsapp, empresa)')
                .order('data_hora', { ascending: true })

            if (status) query = query.eq('status', status)
            if (data_inicio) query = query.gte('data_hora', data_inicio)

            const { data, error } = await query
            if (error) throw error

            return jsonResponse({ reunioes: data })
        }

        // PATCH /reunioes/:id - Atualizar reunião
        if (method === 'PATCH' && path.match(/^\/reunioes\/\d+$/)) {
            const id = path.split('/')[2]
            const body = await req.json()

            const { data, error } = await supabase
                .from('reunioes')
                .update(body)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return jsonResponse({ success: true, reuniao: data })
        }

        // ========== STATS ==========

        // GET /stats - Dashboard
        if (method === 'GET' && path === '/stats') {
            const hoje = new Date().toISOString().split('T')[0]
            const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

            // Leads hoje
            const { count: leadsHoje } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', hoje)

            // Leads semana
            const { count: leadsSemana } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', semanaAtras)

            // Reuniões pendentes
            const { count: reunioesPendentes } = await supabase
                .from('reunioes')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'agendada')
                .gte('data_hora', new Date().toISOString())

            // Total leads
            const { count: totalLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })

            return jsonResponse({
                leads_hoje: leadsHoje || 0,
                leads_semana: leadsSemana || 0,
                reunioes_pendentes: reunioesPendentes || 0,
                total_leads: totalLeads || 0
            })
        }

        // Rota não encontrada
        return errorResponse('Endpoint não encontrado', 404)

    } catch (err) {
        console.error('Erro:', err)
        return errorResponse(err.message || 'Erro interno', 500)
    }
})
