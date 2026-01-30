import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, TrendingUp, Clock, ArrowRight, Smartphone, Globe, Bot, Eye, Calendar, Bell, UserPlus, Video, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, startOfDay, endOfDay, isToday, isTomorrow, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors = {
    novo: { bg: 'bg-blue-500', color: '#3b82f6' },
    qualificado: { bg: 'bg-yellow-500', color: '#eab308' },
    proposta: { bg: 'bg-purple-500', color: '#a855f7' },
    ganho: { bg: 'bg-green-500', color: '#22c55e' },
    perdido: { bg: 'bg-red-500', color: '#ef4444' }
}

const serviceIcons = {
    app: Smartphone,
    site: Globe,
    automacao: Bot
}

const notificationIcons = {
    'novo_lead': UserPlus,
    'nova_reuniao': Calendar,
    'default': Bell
}

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, novos: 0, ganhos: 0, visitantes: 0 })
    const [recentLeads, setRecentLeads] = useState([])
    const [chartData, setChartData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [reunioes, setReunioes] = useState([])
    const [notificacoes, setNotificacoes] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch all leads
            const { data: leads, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Fetch visitors count
            const { count: visitorsCount } = await supabase
                .from('visitors')
                .select('*', { count: 'exact', head: true })

            // Fetch upcoming reunions
            const { data: reunioesData } = await supabase
                .from('reunioes')
                .select('*, leads(nome, empresa)')
                .gte('data_hora', new Date().toISOString())
                .order('data_hora', { ascending: true })
                .limit(5)

            if (reunioesData) setReunioes(reunioesData)

            // Fetch notifications
            const { data: notificacoesData } = await supabase
                .from('notificacoes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (notificacoesData) setNotificacoes(notificacoesData)

            // Calculate stats
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const novosHoje = leads.filter(l => new Date(l.created_at) >= today).length
            const ganhos = leads.filter(l => l.status === 'ganho').length

            setStats({
                total: leads.length,
                novos: novosHoje,
                ganhos,
                visitantes: visitorsCount || 0
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
                    date: format(date, 'dd/MM', { locale: ptBR }),
                    leads: dayLeads
                }
            })
            setChartData(last7Days)

            // Prepare status data for pie chart
            const statusCounts = ['novo', 'qualificado', 'proposta', 'ganho', 'perdido'].map(status => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: leads.filter(l => l.status === status).length,
                color: statusColors[status].color
            })).filter(s => s.value > 0)
            setStatusData(statusCounts)

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
                {subtext && <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
        </motion.div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header with Notifications */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Visão geral do seu CRM</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Bell size={20} className="text-gray-400" />
                            {notificacoes.filter(n => !n.lida).length > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-14 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="font-bold text-white">Notificações</h3>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-gray-500 hover:text-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notificacoes.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Nenhuma notificação</p>
                                            </div>
                                        ) : (
                                            notificacoes.map(notif => {
                                                const NotifIcon = notificationIcons[notif.tipo] || notificationIcons.default
                                                return (
                                                    <Link
                                                        key={notif.id}
                                                        to={notif.link || '#'}
                                                        onClick={() => setShowNotifications(false)}
                                                        className={`flex gap-3 p-4 hover:bg-white/5 transition-colors ${!notif.lida ? 'bg-white/[0.02]' : ''}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.tipo === 'novo_lead' ? 'bg-cyan-500/20 text-cyan-400' :
                                                            notif.tipo === 'nova_reuniao' ? 'bg-green-500/20 text-green-400' :
                                                                'bg-white/10 text-gray-400'
                                                            }`}>
                                                            <NotifIcon size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{notif.titulo}</p>
                                                            <p className="text-xs text-gray-500 truncate">{notif.mensagem}</p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {format(new Date(notif.created_at), "dd/MM HH:mm")}
                                                            </p>
                                                        </div>
                                                        {!notif.lida && (
                                                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />
                                                        )}
                                                    </Link>
                                                )
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">Última atualização</p>
                        <p className="text-white font-medium">{format(new Date(), "dd 'de' MMMM, HH:mm", { locale: ptBR })}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total de Leads" value={stats.total} color="bg-cyan-500/20" />
                <StatCard icon={Clock} label="Novos Hoje" value={stats.novos} color="bg-blue-500/20" subtext="hoje" />
                <StatCard icon={TrendingUp} label="Convertidos" value={stats.ganhos} color="bg-green-500/20" />
                <StatCard icon={Eye} label="Visitantes" value={stats.visitantes} color="bg-purple-500/20" />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Leads últimos 7 dias</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Por Status</h2>
                    {statusData.length > 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a1a',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {statusData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-400">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Sem dados ainda
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Leads Recentes</h2>
                    <Link
                        to="/crm/leads"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                        Ver todos <ArrowRight size={16} />
                    </Link>
                </div>

                {recentLeads.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum lead ainda</p>
                        <p className="text-sm mt-2">Compartilhe o formulário para capturar leads</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recentLeads.map(lead => {
                            const ServiceIcon = serviceIcons[lead.tipo_servico] || Users
                            return (
                                <Link
                                    key={lead.id}
                                    to="/crm/leads"
                                    className="block p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                            <ServiceIcon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{lead.nome}</p>
                                            <p className="text-sm text-gray-500 truncate">{lead.empresa || lead.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${statusColors[lead.status]?.bg || 'bg-gray-500'}`} />
                                            <span className="text-xs text-gray-400 capitalize hidden sm:inline">{lead.status}</span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(lead.created_at), "dd/MM", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Video size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Próximas Reuniões</h2>
                            <p className="text-sm text-gray-500">{reunioes.length} agendadas</p>
                        </div>
                    </div>
                    <Link
                        to="/crm/calendar"
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                        Ver agenda <ArrowRight size={16} />
                    </Link>
                </div>

                {reunioes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhuma reunião agendada</p>
                        <p className="text-sm mt-2">As reuniões do ClawdBot aparecerão aqui</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {reunioes.map(reuniao => {
                            const dataReuniao = new Date(reuniao.data_hora)
                            const horasAte = differenceInHours(dataReuniao, new Date())

                            let badge = { text: format(dataReuniao, "dd/MM"), color: 'bg-gray-500/20 text-gray-400' }
                            if (isToday(dataReuniao)) {
                                badge = { text: 'Hoje', color: 'bg-green-500/20 text-green-400' }
                            } else if (isTomorrow(dataReuniao)) {
                                badge = { text: 'Amanhã', color: 'bg-yellow-500/20 text-yellow-400' }
                            }

                            return (
                                <div key={reuniao.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center min-w-[60px]">
                                            <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
                                                {badge.text}
                                            </span>
                                            <p className="text-lg font-bold text-white mt-1">
                                                {format(dataReuniao, "HH:mm")}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{reuniao.titulo}</p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {reuniao.leads?.nome || 'Sem lead vinculado'}
                                                {reuniao.leads?.empresa && ` • ${reuniao.leads.empresa}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {reuniao.link_meet && (
                                                <a
                                                    href={reuniao.link_meet}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                                                >
                                                    Entrar
                                                </a>
                                            )}
                                            <span className={`w-2 h-2 rounded-full ${reuniao.status === 'agendada' ? 'bg-green-500' :
                                                    reuniao.status === 'realizada' ? 'bg-blue-500' :
                                                        'bg-gray-500'
                                                }`} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <a
                    href="/form/app"
                    target="_blank"
                    className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400 hover:bg-pink-500/20 transition-colors text-center"
                >
                    <Smartphone className="mx-auto mb-2" size={24} />
                    <span className="text-sm font-medium">Formulário App</span>
                </a>
                <a
                    href="/form/site"
                    target="_blank"
                    className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors text-center"
                >
                    <Globe className="mx-auto mb-2" size={24} />
                    <span className="text-sm font-medium">Formulário Site</span>
                </a>
                <a
                    href="/form/automacao"
                    target="_blank"
                    className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-colors text-center"
                >
                    <Bot className="mx-auto mb-2" size={24} />
                    <span className="text-sm font-medium">Formulário Automação</span>
                </a>
            </div>
        </div>
    )
}
