import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone, Mail, Building, X, MessageCircle, FileText, DollarSign,
    Clock, Smartphone, Globe, Bot, Send, StickyNote, Trash2, Search,
    Filter, Download, History, MoreHorizontal, ExternalLink, User
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '../../contexts/ToastContext'
import { TableRowSkeleton } from '../../components/Skeleton'

const statusConfig = {
    novo: { label: 'Novo', color: 'bg-blue-500', textColor: 'text-blue-500', emoji: '🆕' },
    qualificado: { label: 'Qualificado', color: 'bg-amber-500', textColor: 'text-amber-500', emoji: '⭐' },
    proposta: { label: 'Proposta', color: 'bg-purple-500', textColor: 'text-purple-500', emoji: '📄' },
    ganho: { label: 'Ganho', color: 'bg-emerald-500', textColor: 'text-emerald-500', emoji: '🎉' },
    perdido: { label: 'Perdido', color: 'bg-red-500', textColor: 'text-red-500', emoji: '❌' }
}

const serviceIcons = {
    app: { icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'App Mobile' },
    site: { icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Site/Landing' },
    automacao: { icon: Bot, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Automação IA' }
}

export default function Leads() {
    const [leads, setLeads] = useState([])
    const [filteredLeads, setFilteredLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState(null)
    const [notas, setNotas] = useState([])
    const [historico, setHistorico] = useState([])
    const [newNota, setNewNota] = useState('')
    const [notaLoading, setNotaLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterService, setFilterService] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [hoveredRow, setHoveredRow] = useState(null)
    const toast = useToast()

    useEffect(() => {
        fetchLeads()
        const channel = supabase
            .channel('leads-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                fetchLeads()
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [])

    useEffect(() => {
        let result = leads
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(l =>
                l.nome?.toLowerCase().includes(term) ||
                l.email?.toLowerCase().includes(term) ||
                l.empresa?.toLowerCase().includes(term) ||
                l.whatsapp?.includes(term)
            )
        }
        if (filterStatus) result = result.filter(l => l.status === filterStatus)
        if (filterService) result = result.filter(l => l.tipo_servico === filterService)
        setFilteredLeads(result)
    }, [leads, searchTerm, filterStatus, filterService])

    useEffect(() => {
        if (selectedLead) {
            fetchNotas(selectedLead.id)
            fetchHistorico(selectedLead.id)
        }
    }, [selectedLead?.id])

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
        if (!error) {
            setLeads(data || [])
            setFilteredLeads(data || [])
        }
        setLoading(false)
    }

    const fetchNotas = async (leadId) => {
        const { data } = await supabase
            .from('notas')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false })
        setNotas(data || [])
    }

    const fetchHistorico = async (leadId) => {
        const { data } = await supabase
            .from('atividades')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false })
            .limit(10)
        setHistorico(data || [])
    }

    const addNota = async () => {
        if (!newNota.trim() || !selectedLead) return
        setNotaLoading(true)
        const { data, error } = await supabase
            .from('notas')
            .insert({ lead_id: selectedLead.id, texto: newNota.trim() })
            .select()
            .single()
        if (!error && data) {
            setNotas([data, ...notas])
            setNewNota('')
            toast.success('Nota adicionada!')
            await logActivity(selectedLead.id, 'nota_adicionada', { texto: newNota.trim() })
        }
        setNotaLoading(false)
    }

    const deleteNota = async (notaId) => {
        await supabase.from('notas').delete().eq('id', notaId)
        setNotas(notas.filter(n => n.id !== notaId))
        toast.info('Nota removida')
    }

    const logActivity = async (leadId, tipo, dados = {}) => {
        await supabase.from('atividades').insert({ lead_id: leadId, tipo, dados })
    }

    const updateLeadStatus = async (leadId, newStatus, oldStatus) => {
        await supabase
            .from('leads')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', leadId)
        if (oldStatus !== newStatus) {
            await logActivity(leadId, 'status_alterado', { de: oldStatus, para: newStatus })
            toast.success(`${statusConfig[newStatus].emoji} Status: ${statusConfig[newStatus].label}`)
        }
    }

    const closeModal = () => {
        setSelectedLead(null)
        setNotas([])
        setHistorico([])
        setNewNota('')
    }

    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'WhatsApp', 'Empresa', 'Serviço', 'Orçamento', 'Status', 'Origem', 'Data']
        const rows = filteredLeads.map(l => [
            l.nome, l.email, l.whatsapp, l.empresa || '', l.tipo_servico || '',
            l.orcamento || '', l.status, l.origem, format(new Date(l.created_at), 'dd/MM/yyyy HH:mm')
        ])
        const csvContent = [headers.join(';'), ...rows.map(r => r.map(c => `"${c}"`).join(';'))].join('\n')
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
        toast.success('CSV exportado!')
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('')
        setFilterService('')
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                            {(searchTerm || filterStatus || filterService) ? ` (filtrado de ${leads.length})` : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl transition-colors ${showFilters
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <Filter size={20} />
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="">Todos os status</option>
                                    {Object.entries(statusConfig).map(([key, val]) => (
                                        <option key={key} value={key}>{val.emoji} {val.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterService}
                                    onChange={(e) => setFilterService(e.target.value)}
                                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="">Todos os serviços</option>
                                    {Object.entries(serviceIcons).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                                {(searchTerm || filterStatus || filterService) && (
                                    <button onClick={clearFilters} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117]">
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Lead</th>
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Contato</th>
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Serviço</th>
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Valor</th>
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead, idx) => {
                                const service = serviceIcons[lead.tipo_servico] || { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Outro' }
                                const ServiceIcon = service.icon
                                const status = statusConfig[lead.status] || statusConfig.novo

                                return (
                                    <motion.tr
                                        key={lead.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        onClick={() => setSelectedLead(lead)}
                                        onMouseEnter={() => setHoveredRow(lead.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        className="border-b border-gray-100 dark:border-[#21262d] hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                                                    {lead.nome?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{lead.nome}</p>
                                                    <p className="text-sm text-gray-500">{lead.empresa || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="space-y-1">
                                                {lead.email && (
                                                    <a
                                                        href={`mailto:${lead.email}`}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500"
                                                    >
                                                        <Mail size={12} />
                                                        <span className="truncate max-w-[150px]">{lead.email}</span>
                                                    </a>
                                                )}
                                                {lead.whatsapp && (
                                                    <a
                                                        href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1 text-sm text-green-500 hover:text-green-600"
                                                    >
                                                        <Phone size={12} />
                                                        {lead.whatsapp}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${service.bg}`}>
                                                <ServiceIcon size={14} className={service.color} />
                                                <span className={`text-sm ${service.color}`}>{service.label}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {lead.orcamento ? (
                                                <span className="font-semibold text-emerald-500">{lead.orcamento}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.color}/10`}>
                                                <span>{status.emoji}</span>
                                                <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm text-gray-500">
                                                <p>{format(new Date(lead.created_at), 'dd/MM/yy')}</p>
                                                <p className="text-xs">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <AnimatePresence>
                                                {hoveredRow === lead.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="flex gap-1"
                                                    >
                                                        {lead.whatsapp && (
                                                            <a
                                                                href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                                            >
                                                                <MessageCircle size={14} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedLead(lead) }}
                                                            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLeads.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <User size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum lead encontrado</p>
                    </div>
                )}
            </div>

            {/* Lead Detail Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-[#21262d] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedLead.nome?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.nome}</h2>
                                        <p className="text-gray-500">{serviceIcons[selectedLead.tipo_servico]?.label || 'Lead'}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    {selectedLead.whatsapp && (
                                        <a
                                            href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-center transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={18} />
                                            WhatsApp
                                        </a>
                                    )}
                                    {selectedLead.email && (
                                        <a
                                            href={`mailto:${selectedLead.email}`}
                                            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-center transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Mail size={18} />
                                            Email
                                        </a>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {selectedLead.empresa && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                            <Building size={18} className="text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{selectedLead.empresa}</span>
                                        </div>
                                    )}
                                    {selectedLead.orcamento && (
                                        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                            <DollarSign size={18} className="text-emerald-500" />
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLead.orcamento}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedLead.descricao && (
                                    <div className="p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                        <p className="text-sm text-gray-500 mb-2">Descrição:</p>
                                        <p className="text-gray-900 dark:text-white">{selectedLead.descricao}</p>
                                    </div>
                                )}

                                {/* Status */}
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Status:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(statusConfig).map(([key, val]) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    updateLeadStatus(selectedLead.id, key, selectedLead.status)
                                                    setSelectedLead({ ...selectedLead, status: key })
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedLead.status === key
                                                        ? `${val.color} text-white shadow-lg`
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {val.emoji} {val.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes & History */}
                                <div className="grid md:grid-cols-2 gap-6 border-t border-gray-200 dark:border-[#21262d] pt-6">
                                    {/* Notes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <StickyNote size={18} className="text-amber-500" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Notas</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{notas.length}</span>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={newNota}
                                                onChange={(e) => setNewNota(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addNota()}
                                                placeholder="Adicionar nota..."
                                                className="flex-1 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl py-2 px-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                            />
                                            <button
                                                onClick={addNota}
                                                disabled={!newNota.trim() || notaLoading}
                                                className="px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {notas.length === 0 ? (
                                                <p className="text-gray-400 text-sm text-center py-4">Nenhuma nota</p>
                                            ) : (
                                                notas.map(nota => (
                                                    <div key={nota.id} className="group flex items-start gap-2 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="text-gray-900 dark:text-white text-sm">{nota.texto}</p>
                                                            <p className="text-gray-400 text-xs mt-1">
                                                                {format(new Date(nota.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteNota(nota.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* History */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <History size={18} className="text-purple-500" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Histórico</h3>
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {historico.length === 0 ? (
                                                <p className="text-gray-400 text-sm text-center py-4">Nenhuma atividade</p>
                                            ) : (
                                                historico.map(ativ => (
                                                    <div key={ativ.id} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                                                        <div className="flex-1">
                                                            <p className="text-gray-900 dark:text-white text-sm">
                                                                {ativ.tipo === 'status_alterado'
                                                                    ? `Status: ${ativ.dados?.de} → ${ativ.dados?.para}`
                                                                    : ativ.tipo === 'nota_adicionada'
                                                                        ? 'Nota adicionada'
                                                                        : ativ.tipo}
                                                            </p>
                                                            <p className="text-gray-400 text-xs mt-1">
                                                                {format(new Date(ativ.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
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
