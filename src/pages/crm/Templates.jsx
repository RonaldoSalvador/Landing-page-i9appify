import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, X, Copy, Check, Edit2, Trash2, Send } from 'lucide-react'
import { gerarLinkWhatsApp, aplicarTemplate } from '../../lib/api-webhook'

export default function Templates() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [copied, setCopied] = useState(null)

    const [form, setForm] = useState({
        nome: '',
        tipo: 'whatsapp',
        conteudo: '',
        variaveis: []
    })

// We moved useEffect below fetchTemplates

    const fetchTemplates = async () => {
        const { data } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false })

        setTemplates(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const openCreateModal = () => {
        setEditingTemplate(null)
        setForm({ nome: '', tipo: 'whatsapp', conteudo: '', variaveis: [] })
        setShowModal(true)
    }

    const openEditModal = (template) => {
        setEditingTemplate(template)
        setForm({
            nome: template.nome,
            tipo: template.tipo,
            conteudo: template.conteudo,
            variaveis: template.variaveis || []
        })
        setShowModal(true)
    }

    const saveTemplate = async () => {
        if (!form.nome || !form.conteudo) return

        // Extract variables from content
        const matches = form.conteudo.match(/{{[^}]+}}/g) || []
        const variaveis = [...new Set(matches)]

        if (editingTemplate) {
            await supabase
                .from('templates')
                .update({ ...form, variaveis })
                .eq('id', editingTemplate.id)
        } else {
            await supabase
                .from('templates')
                .insert({ ...form, variaveis })
        }

        fetchTemplates()
        setShowModal(false)
    }

    const deleteTemplate = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este template?')) return
        await supabase.from('templates').delete().eq('id', id)
        fetchTemplates()
    }

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Templates</h1>
                    <p className="text-gray-400 mt-1">Mensagens prontas para WhatsApp e Email</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Novo Template</span>
                </button>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center text-gray-500 py-12">Carregando...</div>
            ) : templates.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum template criado ainda.</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 text-cyan-400 hover:underline"
                    >
                        Criar primeiro template
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{template.nome}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${template.tipo === 'whatsapp'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {template.tipo === 'whatsapp' ? 'WhatsApp' : 'Email'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(template)}
                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteTemplate(template.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {template.conteudo}
                            </p>

                            {template.variaveis?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {template.variaveis.map((v, i) => (
                                        <span key={i} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => copyToClipboard(template.conteudo, template.id)}
                                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            >
                                {copied === template.id ? (
                                    <>
                                        <Check size={14} className="text-green-400" />
                                        <span className="text-green-400">Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        <span>Copiar mensagem</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={form.nome}
                                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                        placeholder="Ex: Boas-vindas"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, tipo: 'whatsapp' })}
                                            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${form.tipo === 'whatsapp'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                                }`}
                                        >
                                            WhatsApp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, tipo: 'email' })}
                                            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${form.tipo === 'email'
                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                                }`}
                                        >
                                            Email
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Mensagem *</label>
                                    <textarea
                                        value={form.conteudo}
                                        onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                                        rows={5}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                                        placeholder="Olá {{nome}}! Como posso ajudar?"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use {'{{nome}}'}, {'{{empresa}}'}, {'{{email}}'} para variáveis
                                    </p>
                                </div>

                                <button
                                    onClick={saveTemplate}
                                    disabled={!form.nome || !form.conteudo}
                                    className="w-full py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                                >
                                    {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
