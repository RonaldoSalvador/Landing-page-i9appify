import { supabase } from './supabaseClient'

// Gerar ou recuperar visitor_id único
const getVisitorId = () => {
    let visitorId = localStorage.getItem('i9_visitor_id')
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
        localStorage.setItem('i9_visitor_id', visitorId)
    }
    return visitorId
}

// Detectar dispositivo e navegador
const getDeviceInfo = () => {
    const ua = navigator.userAgent
    let device = 'Desktop'
    if (/mobile/i.test(ua)) device = 'Mobile'
    if (/tablet|ipad/i.test(ua)) device = 'Tablet'

    let browser = 'Unknown'
    if (/chrome/i.test(ua)) browser = 'Chrome'
    else if (/firefox/i.test(ua)) browser = 'Firefox'
    else if (/safari/i.test(ua)) browser = 'Safari'
    else if (/edge/i.test(ua)) browser = 'Edge'

    return { device, browser }
}

// Rastrear visita
export const trackVisit = async () => {
    try {
        const visitorId = getVisitorId()
        const { device, browser } = getDeviceInfo()
        const referrer = document.referrer || 'direct'

        // Verificar se visitante já existe
        const { data: existing } = await supabase
            .from('visitors')
            .select('id, total_visits')
            .eq('visitor_id', visitorId)
            .single()

        if (existing) {
            // Atualizar visita existente
            await supabase
                .from('visitors')
                .update({
                    last_visit: new Date().toISOString(),
                    total_visits: (existing.total_visits || 0) + 1
                })
                .eq('id', existing.id)
        } else {
            // Criar novo visitante
            await supabase
                .from('visitors')
                .insert({
                    visitor_id: visitorId,
                    device,
                    browser,
                    referrer
                })
        }
    } catch (error) {
        console.log('Tracking error:', error)
    }
}

// Rastrear visualização de página
export const trackPageView = async (page) => {
    try {
        const visitorId = getVisitorId()

        await supabase
            .from('pageviews')
            .insert({
                visitor_id: visitorId,
                page
            })
    } catch (error) {
        console.log('PageView tracking error:', error)
    }
}

// Rastrear evento customizado
export const trackEvent = async (eventType, eventData = {}) => {
    try {
        const visitorId = getVisitorId()

        await supabase
            .from('events')
            .insert({
                visitor_id: visitorId,
                event_type: eventType,
                event_data: eventData
            })
    } catch (error) {
        console.log('Event tracking error:', error)
    }
}

// Pegar visitor_id para usar no formulário de leads
export const getVisitorIdForForm = () => getVisitorId()
