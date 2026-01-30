import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, Building, X, MessageCircle, FileText, DollarSign, Clock, Smartphone, Globe, Bot, Send, StickyNote, Trash2, Search, Filter, Download, Calendar, History } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const columns = [
    { id: 'novo', title: 'Novo', color: 'border-blue-500', bg: 'bg-blue-500' },
    { id: 'qualificado', title: 'Qualificado', color: 'border-yellow-500', bg: 'bg-yellow-500' },
    { id: 'proposta', title: 'Proposta', color: 'border-purple-500', bg: 'bg-purple-500' },
    { id: 'ganho', title: 'Ganho', color: 'border-green-500', bg: 'bg-green-500' },
    { id: 'perdido', title: 'Perdido', color: 'border-red-500', bg: 'bg-red-500' }
]

const serviceIcons = {
    app: { icon: Smartphone, color: 'text-pink-400', label: 'App Mobile' },
    site: { icon: Globe, color: 'text-purple-400', label: 'Site/Landing' },
    automacao: { icon: Bot, color: 'text-cyan-400', label: 'Automação IA' }
}

export default function Leads() {
    const [leads, setLeads] = useState([])
    const [filteredLeads, setFilteredLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState(null)
    const [draggedLead, setDraggedLead] = useState(null)
    const [notas, setNotas] = useState([])
    const [historico, setHistorico] = useState([])
    const [newNota, setNewNota] = useState('')
    const [notaLoading, setNotaLoading] = useState(false)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [filterService, setFilterService] = useState('')
    const [showFilters, setShowFilters] = useState(false)

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

    // Apply filters
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

        if (filterService) {
            result = result.filter(l => l.tipo_servico === filterService)
        }

        setFilteredLeads(result)
    }, [leads, searchTerm, filterService])

    // Fetch notas and historico when lead is selected
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

            // Log activity
            await logActivity(selectedLead.id, 'nota_adicionada', { texto: newNota.trim() })
        }
        setNotaLoading(false)
    }

    const deleteNota = async (notaId) => {
        await supabase.from('notas').delete().eq('id', notaId)
        setNotas(notas.filter(n => n.id !== notaId))
    }

    const logActivity = async (leadId, tipo, dados = {}) => {
        await supabase.from('atividades').insert({
            lead_id: leadId,
            tipo,
            dados
        })
    }

    const updateLeadStatus = async (leadId, newStatus, oldStatus) => {
        await supabase
            .from('leads')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', leadId)

        // Log status change
        if (oldStatus !== newStatus) {
            await logActivity(leadId, 'status_alterado', { de: oldStatus, para: newStatus })
        }
    }

    const handleDragStart = (lead) => {
        setDraggedLead(lead)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = async (e, status) => {
        e.preventDefault()
        if (draggedLead && draggedLead.status !== status) {
            await updateLeadStatus(draggedLead.id, status, draggedLead.status)
        }
        setDraggedLead(null)
    }

    const getLeadsByStatus = (status) => filteredLeads.filter(l => l.status === status)

    const closeModal = () => {
        setSelectedLead(null)
        setNotas([])
        setHistorico([])
        setNewNota('')
    }

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'WhatsApp', 'Empresa', 'Serviço', 'Orçamento', 'Status', 'Origem', 'Data']
        const rows = filteredLeads.map(l => [
            l.nome,
            l.email,
            l.whatsapp,
            l.empresa || '',
            l.tipo_servico || '',
            l.orcamento || '',
            l.status,
            l.origem,
            format(new Date(l.created_at), 'dd/MM/yyyy HH:mm')
        ])

        const csvContent = [
            headers.join(';'),
            ...rows.map(r => r.map(c => `"${c}"`).join(';'))
        ].join('\n')

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilterService('')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Search and Actions */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Leads</h1>
                        <p className="text-gray-400 mt-1">
                            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                            {searchTerm || filterService ? ` (filtrado de ${leads.length})` : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl transition-colors ${showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <Filter size={20} />
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-3 p-4 bg-[#111] border border-white/10 rounded-xl">
                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por nome, email, empresa..."
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                {/* Service Filter */}
                                <select
                                    value={filterService}
                                    onChange={(e) => setFilterService(e.target.value)}
                                    className="bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    <option value="">Todos os serviços</option>
                                    <option value="app">App Mobile</option>
                                    <option value="site">Site/Landing</option>
                                    <option value="automacao">Automação IA</option>
                                </select>

                                {/* Clear Filters */}
                                {(searchTerm || filterService) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max h-full">
                    {columns.map(column => (
                        <div
                            key={column.id}
                            className="w-72 flex-shrink-0 flex flex-col"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-3 bg-[#111] border-t-2 ${column.color} border-x border-b border-white/10 rounded-t-xl`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${column.bg}`} />
                                        <h3 className="font-bold text-white">{column.title}</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                                        {getLeadsByStatus(column.id).length}
                                    </span>
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 bg-[#0a0a0a] border-x border-b border-white/10 rounded-b-xl p-2 space-y-2 overflow-y-auto min-h-[200px]">
                                {getLeadsByStatus(column.id).map(lead => {
                                    const service = serviceIcons[lead.tipo_servico] || { icon: FileText, color: 'text-gray-400', label: 'Outro' }
                                    const ServiceIcon = service.icon

                                    return (
                                        <motion.div
                                            key={lead.id}
                                            layout
                                            draggable
                                            onDragStart={() => handleDragStart(lead)}
                                            onClick={() => setSelectedLead(lead)}
                                            className="p-4 bg-[#111] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all hover:shadow-lg"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center ${service.color}`}>
                                                    <ServiceIcon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{lead.nome}</p>
                                                    <p className="text-xs text-gray-500 truncate">{lead.empresa || lead.email}</p>
                                                </div>
                                            </div>
                                            {lead.orcamento && (
                                                <div className="mt-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full inline-block">
                                                    {lead.orcamento}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                <Clock size={12} />
                                                <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}</span>
                                            </div>
                                        </motion.div>
                                    )
                                })}

                                {getLeadsByStatus(column.id).length === 0 && (
                                    <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                                        Nenhum lead
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lead Detail Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedLead.nome}</h2>
                                    <p className="text-sm text-gray-500">{serviceIcons[selectedLead.tipo_servico]?.label || 'Lead'}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Contact Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <a
                                        href={`mailto:${selectedLead.email}`}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Mail size={18} className="text-cyan-400" />
                                        <span className="text-gray-300 truncate">{selectedLead.email}</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/55${selectedLead.whatsapp?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition-colors"
                                    >
                                        <Phone size={18} className="text-green-400" />
                                        <span className="text-green-300">{selectedLead.whatsapp}</span>
                                    </a>
                                </div>

                                {/* Details Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {selectedLead.empresa && (
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Building size={18} className="text-gray-500" />
                                            <span>{selectedLead.empresa}</span>
                                        </div>
                                    )}
                                    {selectedLead.orcamento && (
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <DollarSign size={18} className="text-green-500" />
                                            <span>{selectedLead.orcamento}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedLead.descricao && (
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <p className="text-gray-500 text-sm mb-2">Descrição do Projeto:</p>
                                        <p className="text-gray-300">{selectedLead.descricao}</p>
                                    </div>
                                )}

                                {/* Status Buttons */}
                                <div>
                                    <p className="text-gray-500 text-sm mb-3">Status:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {columns.map(col => (
                                            <button
                                                key={col.id}
                                                onClick={() => {
                                                    updateLeadStatus(selectedLead.id, col.id, selectedLead.status)
                                                    setSelectedLead({ ...selectedLead, status: col.id })
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedLead.status === col.id
                                                        ? `${col.bg} text-white shadow-lg`
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {col.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Two Column Layout for Notes and History */}
                                <div className="grid md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                                    {/* Notes Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <StickyNote size={18} className="text-yellow-400" />
                                            <h3 className="font-bold text-white">Notas</h3>
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                                {notas.length}
                                            </span>
                                        </div>

                                        {/* Add Note */}
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={newNota}
                                                onChange={(e) => setNewNota(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addNota()}
                                                placeholder="Adicionar nota..."
                                                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                                            />
                                            <button
                                                onClick={addNota}
                                                disabled={!newNota.trim() || notaLoading}
                                                className="px-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>

                                        {/* Notes List */}
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {notas.length === 0 ? (
                                                <p className="text-gray-600 text-sm text-center py-4">Nenhuma nota</p>
                                            ) : (
                                                notas.map(nota => (
                                                    <div key={nota.id} className="group flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="text-gray-300 text-sm">{nota.texto}</p>
                                                            <p className="text-gray-600 text-xs mt-1">
                                                                {format(new Date(nota.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteNota(nota.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/10 rounded transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Activity History */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <History size={18} className="text-purple-400" />
                                            <h3 className="font-bold text-white">Histórico</h3>
                                        </div>

                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {historico.length === 0 ? (
                                                <p className="text-gray-600 text-sm text-center py-4">Nenhuma atividade</p>
                                            ) : (
                                                historico.map(ativ => (
                                                    <div key={ativ.id} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                                        <div className="flex-1">
                                                            <p className="text-gray-300 text-sm">
                                                                {ativ.tipo === 'status_alterado'
                                                                    ? `Status: ${ativ.dados?.de} → ${ativ.dados?.para}`
                                                                    : ativ.tipo === 'nota_adicionada'
                                                                        ? 'Nota adicionada'
                                                                        : ativ.tipo
                                                                }
                                                            </p>
                                                            <p className="text-gray-600 text-xs mt-1">
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

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-white/5 flex gap-3 flex-shrink-0">
                                <a
                                    href={`https://wa.me/55${selectedLead.whatsapp?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    className="flex-1 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-medium text-center hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} />
                                    WhatsApp
                                </a>
                                <a
                                    href={`mailto:${selectedLead.email}`}
                                    className="flex-1 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium text-center hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Email
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
