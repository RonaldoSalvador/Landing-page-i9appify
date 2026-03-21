import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Monitor, Smartphone, Tablet, Globe, Clock, Users, TrendingUp, MousePointer, Search, X, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import { format, formatDistanceToNow, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet
}

const deviceColors = {
    Desktop: '#3b82f6',
    Mobile: '#10b981',
    Tablet: '#f59e0b'
}

export default function Visitors() {
    const [visitors, setVisitors] = useState([])
    const [stats, setStats] = useState({ total: 0, hoje: 0, returning: 0, avgVisits: 0 })
    const [chartData, setChartData] = useState([])
    const [deviceData, setDeviceData] = useState([])
    const [browserData, setBrowserData] = useState([])
    const [topPages, setTopPages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedVisitor, setSelectedVisitor] = useState(null)
    const [pageviews, setPageviews] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [deviceFilter, setDeviceFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)

    const ITEMS_PER_PAGE = 8

    useEffect(() => {
        fetchVisitors()
        fetchTopPages()
    }, [])

    const fetchVisitors = async () => {
        try {
            const { data, error } = await supabase
                .from('visitors')
                .select('*')
                .order('last_visit', { ascending: false })

            if (error) throw error

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const hojeCont = data?.filter(v => new Date(v.last_visit) >= today).length || 0
            const returning = data?.filter(v => v.total_visits > 1).length || 0
            const avgVisits = data?.length > 0
                ? (data.reduce((sum, v) => sum + (v.total_visits || 1), 0) / data.length).toFixed(1)
                : 0

            setVisitors(data || [])
            setStats({ total: data?.length || 0, hoje: hojeCont, returning, avgVisits })

            // Chart: visitors per day (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = subDays(new Date(), 6 - i)
                const dayCount = data?.filter(v => {
                    const d = new Date(v.last_visit)
                    return d >= startOfDay(date) && d <= endOfDay(date)
                }).length || 0
                return {
                    date: format(date, 'EEE', { locale: ptBR }),
                    fullDate: format(date, 'dd/MM'),
                    visitantes: dayCount
                }
            })
            setChartData(last7Days)

            // Device breakdown
            const devices = {}
            data?.forEach(v => {
                const d = v.device || 'Outro'
                devices[d] = (devices[d] || 0) + 1
            })
            setDeviceData(Object.entries(devices).map(([name, value]) => ({
                name,
                value,
                color: deviceColors[name] || '#6b7280'
            })))

            // Browser breakdown (top 5)
            const browsers = {}
            data?.forEach(v => {
                const b = v.browser || 'Desconhecido'
                browsers[b] = (browsers[b] || 0) + 1
            })
            const sortedBrowsers = Object.entries(browsers)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, value]) => ({ name, value }))
            setBrowserData(sortedBrowsers)

        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchTopPages = async () => {
        const { data } = await supabase
            .from('pageviews')
            .select('page')
            .limit(500)

        if (data) {
            const pages = {}
            data.forEach(pv => {
                const p = pv.page || '/'
                pages[p] = (pages[p] || 0) + 1
            })
            const sorted = Object.entries(pages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([page, views]) => ({ page, views }))
            setTopPages(sorted)
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

    // Filter
    const filtered = visitors.filter(v => {
        const matchSearch = !searchTerm ||
            v.visitor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.browser?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchDevice = deviceFilter === 'all' || v.device === deviceFilter
        return matchSearch && matchDevice
    })

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    useEffect(() => { setCurrentPage(1) }, [searchTerm, deviceFilter])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visitantes</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Analytics de visitantes do site</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Visitantes', value: stats.total, icon: Users, color: '#06b6d4' },
                    { label: 'Hoje', value: stats.hoje, icon: Eye, color: '#10b981' },
                    { label: 'Retornaram', value: stats.returning, icon: TrendingUp, color: '#a855f7' },
                    { label: 'Média Visitas', value: stats.avgVisits, icon: MousePointer, color: '#f59e0b' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visitors per Day Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Visitantes por Dia</h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVisitantes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: 12
                                    }}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitantes"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorVisitantes)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Dispositivos</h3>
                    <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={60}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: 12
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {deviceData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-gray-500 dark:text-gray-400">{d.name}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Second Row: Top Pages + Top Browsers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Páginas Mais Visitadas</h3>
                    <div className="space-y-2">
                        {topPages.length === 0 ? (
                            <p className="text-gray-400 text-sm">Nenhum dado</p>
                        ) : topPages.map((p, i) => {
                            const maxViews = topPages[0]?.views || 1
                            const pct = (p.views / maxViews) * 100
                            return (
                                <div key={p.page} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-900 dark:text-white truncate">{p.page}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{p.views}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Top Browsers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Navegadores</h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={browserData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    width={70}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: 12
                                    }}
                                />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Visitors Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden"
            >
                {/* Table Header */}
                <div className="p-4 border-b border-gray-100 dark:border-[#30363d]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Visitantes Recentes</h3>
                        <div className="flex items-center gap-2 flex-1">
                            {/* Device Filter Chips */}
                            <div className="flex items-center gap-1">
                                {['all', 'Desktop', 'Mobile', 'Tablet'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDeviceFilter(d)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                            deviceFilter === d
                                                ? 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400'
                                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {d === 'all' ? 'Todos' : d}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs ml-auto">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                            <span className="text-xs text-gray-400">{filtered.length} resultados</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#30363d]">
                                <th className="text-left py-2.5 px-4 font-medium">Dispositivo</th>
                                <th className="text-left py-2.5 px-4 font-medium">Navegador</th>
                                <th className="text-left py-2.5 px-4 font-medium">Origem</th>
                                <th className="text-center py-2.5 px-4 font-medium">Visitas</th>
                                <th className="text-right py-2.5 px-4 font-medium">Última visita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#21262d]">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        <Eye size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nenhum visitante encontrado</p>
                                    </td>
                                </tr>
                            ) : paginated.map(visitor => {
                                const DeviceIcon = deviceIcons[visitor.device] || Monitor
                                return (
                                    <tr
                                        key={visitor.id}
                                        onClick={() => selectVisitor(visitor)}
                                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors text-sm ${
                                            selectedVisitor?.id === visitor.id ? 'bg-cyan-50 dark:bg-cyan-500/5' : ''
                                        }`}
                                    >
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <DeviceIcon size={14} style={{ color: deviceColors[visitor.device] || '#6b7280' }} />
                                                <span className="text-gray-900 dark:text-white">{visitor.device || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">{visitor.browser || 'N/A'}</td>
                                        <td className="py-2.5 px-4 text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                            {visitor.referrer || 'Direto'}
                                        </td>
                                        <td className="py-2.5 px-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                visitor.total_visits > 3
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : visitor.total_visits > 1
                                                    ? 'bg-amber-500/10 text-amber-500'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                                            }`}>
                                                {visitor.total_visits}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-gray-400 text-xs">
                                            {formatDistanceToNow(new Date(visitor.last_visit), { addSuffix: true, locale: ptBR })}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-3 border-t border-gray-100 dark:border-[#30363d] flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page
                                if (totalPages <= 5) page = i + 1
                                else if (currentPage <= 3) page = i + 1
                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                                else page = currentPage - 2 + i
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-cyan-500 text-white'
                                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Visitor Detail Slide-over */}
            <AnimatePresence>
                {selectedVisitor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end"
                        onClick={() => setSelectedVisitor(null)}
                    >
                        <div className="absolute inset-0 bg-black/30" />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-sm bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-[#30363d] h-full overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Detail Header */}
                            <div className="p-5 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between sticky top-0 bg-white dark:bg-[#161b22] z-10">
                                <h3 className="font-bold text-gray-900 dark:text-white">Detalhes do Visitante</h3>
                                <button
                                    onClick={() => setSelectedVisitor(null)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Visitor ID */}
                                <div className="bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl p-3">
                                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">Visitor ID</p>
                                    <p className="text-xs text-gray-900 dark:text-white font-mono break-all">{selectedVisitor.visitor_id}</p>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Monitor, label: 'Dispositivo', value: selectedVisitor.device },
                                        { icon: Globe, label: 'Navegador', value: selectedVisitor.browser },
                                        { icon: Eye, label: 'Visitas', value: selectedVisitor.total_visits },
                                        { icon: MousePointer, label: 'Origem', value: selectedVisitor.referrer || 'Direto' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <item.icon size={12} className="text-gray-400" />
                                                <span className="text-xs text-gray-500">{item.label}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Primeira visita</span>
                                        <span className="text-gray-900 dark:text-white">{format(new Date(selectedVisitor.first_visit), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Última visita</span>
                                        <span className="text-gray-900 dark:text-white">{format(new Date(selectedVisitor.last_visit), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                                    </div>
                                </div>

                                {/* Pageviews */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Páginas visitadas</h4>
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                        {pageviews.length === 0 ? (
                                            <p className="text-gray-400 text-sm">Nenhuma página registrada</p>
                                        ) : pageviews.map(pv => (
                                            <div key={pv.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                                                <span className="text-gray-900 dark:text-white truncate">{pv.page}</span>
                                                <span className="text-gray-400 flex-shrink-0 ml-2">
                                                    {format(new Date(pv.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
