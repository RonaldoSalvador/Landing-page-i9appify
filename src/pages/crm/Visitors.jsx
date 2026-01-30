import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import { Eye, Monitor, Smartphone, Tablet, Globe, Clock, Users, TrendingUp, MousePointer } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet
}

export default function Visitors() {
    const [visitors, setVisitors] = useState([])
    const [stats, setStats] = useState({ total: 0, hoje: 0, returning: 0 })
    const [loading, setLoading] = useState(true)
    const [selectedVisitor, setSelectedVisitor] = useState(null)
    const [pageviews, setPageviews] = useState([])

    useEffect(() => {
        fetchVisitors()
    }, [])

    const fetchVisitors = async () => {
        try {
            const { data, error } = await supabase
                .from('visitors')
                .select('*')
                .order('last_visit', { ascending: false })
                .limit(100)

            if (error) throw error

            // Calculate stats
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const hojeCont = data?.filter(v => new Date(v.last_visit) >= today).length || 0
            const returning = data?.filter(v => v.total_visits > 1).length || 0

            setVisitors(data || [])
            setStats({
                total: data?.length || 0,
                hoje: hojeCont,
                returning
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPageviews = async (visitorId) => {
        const { data } = await supabase
            .from('pageviews')
            .select('*')
            .eq('visitor_id', visitorId)
            .order('created_at', { ascending: false })
            .limit(20)

        setPageviews(data || [])
    }

    const selectVisitor = async (visitor) => {
        setSelectedVisitor(visitor)
        await fetchPageviews(visitor.visitor_id)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Visitantes</h1>
                <p className="text-gray-400 mt-1">Rastreamento de visitantes anônimos</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                            <Users className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-gray-400 text-sm">Total Visitantes</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111] border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Eye className="text-green-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.hoje}</p>
                            <p className="text-gray-400 text-sm">Hoje</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#111] border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.returning}</p>
                            <p className="text-gray-400 text-sm">Retornaram</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Visitors List */}
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="font-bold text-white">Visitantes Recentes</h2>
                    </div>

                    <div className="divide-y divide-white/5">
                        {visitors.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Nenhum visitante ainda</p>
                                <p className="text-sm mt-2">Execute o SQL no Supabase para ativar o tracking</p>
                            </div>
                        ) : (
                            visitors.map(visitor => {
                                const DeviceIcon = deviceIcons[visitor.device] || Monitor
                                return (
                                    <div
                                        key={visitor.id}
                                        onClick={() => selectVisitor(visitor)}
                                        className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors ${selectedVisitor?.id === visitor.id ? 'bg-white/5' : ''
                                            }`}
                                    >
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                            <DeviceIcon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {visitor.visitor_id.slice(0, 12)}...
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {visitor.browser} • {visitor.device}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">{visitor.total_visits} visita{visitor.total_visits > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(visitor.last_visit), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Visitor Detail */}
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="font-bold text-white">Detalhes</h2>
                    </div>

                    {selectedVisitor ? (
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Monitor size={16} className="text-gray-500" />
                                    <span className="text-gray-400">Dispositivo:</span>
                                    <span className="text-white">{selectedVisitor.device}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe size={16} className="text-gray-500" />
                                    <span className="text-gray-400">Navegador:</span>
                                    <span className="text-white">{selectedVisitor.browser}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MousePointer size={16} className="text-gray-500" />
                                    <span className="text-gray-400">Origem:</span>
                                    <span className="text-white truncate">{selectedVisitor.referrer || 'Direto'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={16} className="text-gray-500" />
                                    <span className="text-gray-400">Primeira visita:</span>
                                    <span className="text-white">
                                        {format(new Date(selectedVisitor.first_visit), 'dd/MM/yyyy', { locale: ptBR })}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Páginas visitadas</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {pageviews.length === 0 ? (
                                        <p className="text-gray-600 text-sm">Nenhuma página registrada</p>
                                    ) : (
                                        pageviews.map(pv => (
                                            <div key={pv.id} className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2">
                                                <span className="text-white truncate">{pv.page}</span>
                                                <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                                                    {format(new Date(pv.created_at), 'HH:mm', { locale: ptBR })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <MousePointer size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Selecione um visitante</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
