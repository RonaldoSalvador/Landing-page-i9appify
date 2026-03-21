import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone,
    Mail,
    Building2,
    DollarSign,
    MoreHorizontal,
    X,
    MessageCircle,
    Calendar,
    Edit3,
    ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '../../contexts/ToastContext'
import { PipelineColumnSkeleton } from '../../components/Skeleton'

const columns = [
    { id: 'novo', title: 'Novos Leads', color: 'bg-blue-500', textColor: 'text-blue-500', emoji: '🆕' },
    { id: 'qualificado', title: 'Qualificados', color: 'bg-amber-500', textColor: 'text-amber-500', emoji: '⭐' },
    { id: 'proposta', title: 'Proposta Enviada', color: 'bg-purple-500', textColor: 'text-purple-500', emoji: '📄' },
    { id: 'ganho', title: 'Ganhos', color: 'bg-emerald-500', textColor: 'text-emerald-500', emoji: '🎉' },
    { id: 'perdido', title: 'Perdidos', color: 'bg-red-500', textColor: 'text-red-500', emoji: '❌' }
]

// Quick Actions Component
const QuickActions = ({ lead, setSelectedLead }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-20"
        onClick={e => e.stopPropagation()}
    >
        <div className="flex items-center gap-1 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-full p-1 shadow-xl">
            {lead.whatsapp && (
                <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    title="WhatsApp"
                >
                    <MessageCircle size={14} />
                </motion.a>
            )}
            {lead.email && (
                <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={`mailto:${lead.email}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    title="Email"
                >
                    <Mail size={14} />
                </motion.a>
            )}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLead(lead)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                title="Ver detalhes"
            >
                <ExternalLink size={14} />
            </motion.button>
        </div>
    </motion.div>
)

const LeadCard = ({ lead, draggedLead, hoveredCard, setHoveredCard, handleDragStart, setSelectedLead }) => {
    const isDragging = draggedLead?.id === lead.id
    const isHovered = hoveredCard === lead.id && !draggedLead

    return (
        <motion.div
            layoutId={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => handleDragStart(e, lead)}
            onClick={() => setSelectedLead(lead)}
            onMouseEnter={() => !draggedLead && setHoveredCard(lead.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`group relative bg-white dark:bg-[#161b22] border rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg dark:hover:shadow-emerald-500/5 ${isDragging ? 'opacity-50 border-emerald-500 border-dashed bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-[#30363d] hover:border-emerald-500/50 dark:hover:border-emerald-400/50'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {lead.nome?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {lead.nome}
                        </h4>
                        {lead.empresa && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Building2 size={10} />
                                {lead.empresa}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                    onClick={e => { e.stopPropagation(); setSelectedLead(lead) }}
                >
                    <MoreHorizontal size={14} className="text-gray-400" />
                </button>
            </div>

            <div className="space-y-2 text-xs">
                {lead.tipo_servico && (
                    <div className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                        {lead.tipo_servico}
                    </div>
                )}

                {lead.orcamento && (
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                        <DollarSign size={12} />
                        {lead.orcamento}
                    </p>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363d] flex items-center justify-between text-xs text-gray-400">
                <span>{format(new Date(lead.created_at), "dd MMM", { locale: ptBR })}</span>
                {(lead.whatsapp || lead.email) && (
                    <div className="flex gap-1">
                        {lead.whatsapp && <Phone size={10} className="text-green-500" />}
                        {lead.email && <Mail size={10} className="text-blue-500" />}
                    </div>
                )}
            </div>

            {/* Quick Actions on Hover */}
            <AnimatePresence>
                {isHovered && <QuickActions lead={lead} setSelectedLead={setSelectedLead} />}
            </AnimatePresence>
        </motion.div>
    )
}

export default function Pipeline() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [draggedLead, setDraggedLead] = useState(null)
    const [selectedLead, setSelectedLead] = useState(null)
    const [hoveredCard, setHoveredCard] = useState(null)
    const toast = useToast()

// We moved useEffect below fetchLeads

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setLeads(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleDragStart = (e, lead) => {
        setDraggedLead(lead)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e, newStatus) => {
        e.preventDefault()
        if (!draggedLead || draggedLead.status === newStatus) {
            setDraggedLead(null)
            return
        }

        const oldStatus = draggedLead.status
        const column = columns.find(c => c.id === newStatus)

        // Optimistic update
        setLeads(prev => prev.map(l =>
            l.id === draggedLead.id ? { ...l, status: newStatus } : l
        ))

        // Show toast
        toast.success(`${column.emoji} Lead movido para ${column.title}`)

        // Update in database
        await supabase
            .from('leads')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', draggedLead.id)

        setDraggedLead(null)
    }

    const getColumnLeads = (status) => {
        return leads.filter(l => l.status === status)
    }

    const getColumnValue = (status) => {
        const columnLeads = getColumnLeads(status)
        return columnLeads.reduce((sum, lead) => {
            const value = parseFloat(lead.orcamento?.replace(/[^\d,]/g, '').replace(',', '.')) || 0
            return sum + value
        }, 0)
    }

    if (loading) {
        return (
            <div className="h-full">
                <div className="mb-6">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <PipelineColumnSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Arraste os cards para mover • Passe o mouse para ações rápidas
                </p>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-6">
                {columns.map(column => {
                    const columnLeads = getColumnLeads(column.id)
                    const columnValue = getColumnValue(column.id)

                    return (
                        <motion.div
                            key={column.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                            className="flex-shrink-0 w-72 bg-gray-100/50 dark:bg-[#0d1117] rounded-xl"
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-[#30363d]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{column.emoji}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {column.title}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-200 dark:bg-[#30363d] px-2 py-0.5 rounded-full">
                                            {columnLeads.length}
                                        </span>
                                    </div>
                                </div>
                                {columnValue > 0 && (
                                    <p className={`text-sm mt-1 ${column.textColor} font-medium`}>
                                        R$ {columnValue.toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>

                            {/* Cards */}
                            <div className="p-3 space-y-3 min-h-[400px]">
                                <AnimatePresence>
                                    {columnLeads.map(lead => (
                                        <LeadCard
                                            key={lead.id}
                                            lead={lead}
                                            draggedLead={draggedLead}
                                            hoveredCard={hoveredCard}
                                            setHoveredCard={setHoveredCard}
                                            handleDragStart={handleDragStart}
                                            setSelectedLead={setSelectedLead}
                                        />
                                    ))}
                                </AnimatePresence>

                                {columnLeads.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-[#30363d] rounded-lg"
                                    >
                                        <span className="text-2xl mb-2 block">📥</span>
                                        Arraste leads aqui
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Lead Detail Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedLead(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-[#161b22] rounded-2xl p-6 max-w-lg w-full border border-gray-200 dark:border-[#30363d] shadow-2xl"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {selectedLead.nome?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedLead.nome}
                                        </h2>
                                        {selectedLead.empresa && (
                                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Building2 size={14} />
                                                {selectedLead.empresa}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex gap-2 mb-6">
                                {selectedLead.whatsapp && (
                                    <a
                                        href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp
                                    </a>
                                )}
                                {selectedLead.email && (
                                    <a
                                        href={`mailto:${selectedLead.email}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                                    >
                                        <Mail size={18} />
                                        Email
                                    </a>
                                )}
                            </div>

                            <div className="space-y-3">
                                {selectedLead.whatsapp && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                        <Phone size={18} className="text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">{selectedLead.whatsapp}</span>
                                    </div>
                                )}

                                {selectedLead.email && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                        <Mail size={18} className="text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">{selectedLead.email}</span>
                                    </div>
                                )}

                                {selectedLead.tipo_servico && (
                                    <div className="p-3 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Serviço</p>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedLead.tipo_servico}</p>
                                    </div>
                                )}

                                {selectedLead.orcamento && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Orçamento</p>
                                        <p className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">{selectedLead.orcamento}</p>
                                    </div>
                                )}

                                {selectedLead.descricao && (
                                    <div className="p-3 bg-gray-50 dark:bg-[#0d1117] rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Descrição</p>
                                        <p className="text-gray-900 dark:text-white">{selectedLead.descricao}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
