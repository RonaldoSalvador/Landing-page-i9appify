import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, TrendingUp, DollarSign, ArrowRight, Smartphone, Globe, Bot, Eye, Bell, UserPlus, X, Kanban, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors = {
    novo: { bg: 'bg-blue-500', color: '#3b82f6', label: 'Novos' },
    qualificado: { bg: 'bg-amber-500', color: '#f59e0b', label: 'Qualificados' },
    proposta: { bg: 'bg-purple-500', color: '#a855f7', label: 'Proposta' },
    ganho: { bg: 'bg-emerald-500', color: '#10b981', label: 'Ganhos' },
    perdido: { bg: 'bg-red-500', color: '#ef4444', label: 'Perdidos' }
}

const serviceIcons = {
    app: Smartphone,
    site: Globe,
    automacao: Bot
}

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, novos: 0, ganhos: 0, visitantes: 0, valorTotal: 0 })
    const [recentLeads, setRecentLeads] = useState([])
    const [chartData, setChartData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [notificacoes, setNotificacoes] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [loading, setLoading] = useState(true)

// We moved useEffect below fetchData

    const fetchData = async () => {
        try {
            const { data: leads, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            const { count: visitorsCount } = await supabase
                .from('visitors')
                .select('*', { count: 'exact', head: true })

            const { data: notificacoesData } = await supabase
                .from('notificacoes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (notificacoesData) setNotificacoes(notificacoesData)

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const novosHoje = leads.filter(l => new Date(l.created_at) >= today).length
            const ganhos = leads.filter(l => l.status === 'ganho').length

            // Calculate total value
            const valorTotal = leads.reduce((sum, lead) => {
                const value = parseFloat(lead.orcamento?.replace(/[^\d,]/g, '').replace(',', '.')) || 0
                return sum + value
            }, 0)

            setStats({
                total: leads.length,
                novos: novosHoje,
                ganhos,
                visitantes: visitorsCount || 0,
                valorTotal
            })
            setRecentLeads(leads.slice(0, 5))

            // Prepare chart data (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = subDays(new Date(), 6 - i)
                const dayLeads = leads.filter(l => {
                    const leadDate = new Date(l.created_at)
                    return leadDate >= startOfDay(date) && leadDate <= endOfDay(date)
                }).length
                return {
                    date: format(date, 'EEE', { locale: ptBR }),
                    leads: dayLeads
                }
            })
            setChartData(last7Days)

            // Prepare status data for bar chart
            const statusCounts = Object.entries(statusColors).map(([status, config]) => ({
                name: config.label,
                value: leads.filter(l => l.status === status).length,
                color: config.color
            }))
            setStatusData(statusCounts)

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6 hover:border-emerald-500/30 dark:hover:border-emerald-400/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{label}</p>
        </motion.div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral do seu negócio</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-3 bg-gray-100 dark:bg-[#21262d] rounded-xl hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors"
                        >
                            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                            {notificacoes.filter(n => !n.lida).length > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-14 w-80 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
                                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notificacoes.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400">
                                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Nenhuma notificação</p>
                                            </div>
                                        ) : (
                                            notificacoes.slice(0, 5).map(notif => (
                                                <div key={notif.id} className="p-4 border-b border-gray-50 dark:border-[#21262d] hover:bg-gray-50 dark:hover:bg-[#21262d]">
                                                    <p className="text-sm text-gray-900 dark:text-white">{notif.mensagem}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {format(new Date(notif.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        to="/crm/pipeline"
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium"
                    >
                        <Kanban size={18} />
                        Ver Pipeline
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total de Leads" value={stats.total} color="bg-blue-500" />
                <StatCard icon={UserPlus} label="Novos Hoje" value={stats.novos} trend={12} color="bg-emerald-500" />
                <StatCard icon={TrendingUp} label="Convertidos" value={stats.ganhos} color="bg-amber-500" />
                <StatCard icon={Eye} label="Visitantes" value={stats.visitantes} color="bg-purple-500" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Leads por Dia</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Status Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Por Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Leads */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl"
            >
                <div className="p-6 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Leads Recentes</h3>
                    <Link to="/crm/leads" className="text-emerald-500 hover:text-emerald-400 text-sm flex items-center gap-1">
                        Ver todos <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-[#21262d]">
                    {recentLeads.map(lead => {
                        const ServiceIcon = serviceIcons[lead.tipo_servico] || Users
                        return (
                            <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                                        {lead.nome?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{lead.nome}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.empresa || lead.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]?.bg} bg-opacity-20 text-${statusColors[lead.status]?.color.replace('#', '')}`}
                                        style={{ backgroundColor: `${statusColors[lead.status]?.color}20`, color: statusColors[lead.status]?.color }}
                                    >
                                        {statusColors[lead.status]?.label || lead.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(lead.created_at), "dd/MM", { locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
