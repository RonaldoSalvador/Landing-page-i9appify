import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Plus, X, Edit2, Trash2, Play, Pause, Search,
  MessageSquare, Calendar, Users, Zap, MoreVertical,
  Activity, Clock, Brain, Phone, Building2, ChevronRight,
  Settings2, Eye, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react'

// Static color map to avoid dynamic Tailwind class purging
const COLOR_MAP = {
  emerald: { text: 'text-emerald-500', text600: 'text-emerald-600', textDark: 'dark:text-emerald-400', bg10: 'bg-emerald-500/10', bgHex: '#10b981' },
  blue: { text: 'text-blue-500', text600: 'text-blue-600', textDark: 'dark:text-blue-400', bg10: 'bg-blue-500/10', bgHex: '#3b82f6' },
  yellow: { text: 'text-yellow-500', text600: 'text-yellow-600', textDark: 'dark:text-yellow-400', bg10: 'bg-yellow-500/10', bgHex: '#eab308' },
  purple: { text: 'text-purple-500', text600: 'text-purple-600', textDark: 'dark:text-purple-400', bg10: 'bg-purple-500/10', bgHex: '#a855f7' },
  gray: { text: 'text-gray-500', text600: 'text-gray-600', textDark: 'dark:text-gray-400', bg10: 'bg-gray-500/10', bgHex: '#6b7280' },
}

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: 'emerald', icon: Play },
  pausado: { label: 'Pausado', color: 'yellow', icon: Pause },
  inativo: { label: 'Inativo', color: 'gray', icon: ToggleLeft }
}

const MODEL_OPTIONS = [
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', desc: 'Rápido e econômico' },
  { value: 'gpt-4.1', label: 'GPT-4.1', desc: 'Mais inteligente' },
  { value: 'gpt-4o', label: 'GPT-4o', desc: 'Multimodal avançado' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Multimodal econômico' }
]

const FERRAMENTAS_DISPONIVEIS = [
  { id: 'crm_api', label: 'CRM (Leads)', icon: Users, desc: 'Criar e atualizar leads' },
  { id: 'google_calendar', label: 'Google Calendar', icon: Calendar, desc: 'Agendar reuniões' },
  { id: 'knowledge_base', label: 'Base de Conhecimento', icon: Brain, desc: 'Consultar docs' },
  { id: 'gmail', label: 'Gmail', icon: MessageSquare, desc: 'Enviar emails' }
]

export default function Agents() {
  const [agentes, setAgentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [stats, setStats] = useState({})
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    empresa: '',
    descricao: '',
    modelo: 'gpt-4.1-mini',
    telefone_whatsapp: '',
    instancia_evolution: '',
    evolution_api_url: '',
    evolution_api_key: '',
    prompt_sistema: '',
    temperatura: 0.7,
    max_tokens: 1024,
    ferramentas_habilitadas: ['crm_api', 'google_calendar', 'knowledge_base'],
    knowledge_base_doc_id: '',
    status: 'ativo',
    modo: 'autonomo',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    trabalha_fim_semana: false,
    google_calendar_id: '',
    gmail_enabled: false
  })

  useEffect(() => {
    fetchAgentes()
  }, [])

  const fetchAgentes = async () => {
    const { data, error } = await supabase
      .from('agentes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setAgentes(data || [])
    setLoading(false)
  }

  const fetchStats = async (agenteId) => {
    const { data } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agente_id', agenteId)
      .order('data', { ascending: false })
      .limit(7)

    if (data) {
      setStats(prev => ({ ...prev, [agenteId]: data }))
    }
  }

  const openCreateModal = () => {
    setEditingAgent(null)
    setForm({
      nome: '', empresa: '', descricao: '', modelo: 'gpt-4.1-mini',
      telefone_whatsapp: '', instancia_evolution: '', evolution_api_url: '',
      evolution_api_key: '', prompt_sistema: '', temperatura: 0.7, max_tokens: 1024,
      ferramentas_habilitadas: ['crm_api', 'google_calendar', 'knowledge_base'],
      knowledge_base_doc_id: '', status: 'ativo', modo: 'autonomo',
      horario_inicio: '08:00', horario_fim: '18:00', trabalha_fim_semana: false,
      google_calendar_id: '', gmail_enabled: false
    })
    setActiveTab('info')
    setShowModal(true)
  }

  const openEditModal = (agent) => {
    setEditingAgent(agent)
    setForm({
      nome: agent.nome || '',
      empresa: agent.empresa || '',
      descricao: agent.descricao || '',
      modelo: agent.modelo || 'gpt-4.1-mini',
      telefone_whatsapp: agent.telefone_whatsapp || '',
      instancia_evolution: agent.instancia_evolution || '',
      evolution_api_url: agent.evolution_api_url || '',
      evolution_api_key: agent.evolution_api_key || '',
      prompt_sistema: agent.prompt_sistema || '',
      temperatura: agent.temperatura || 0.7,
      max_tokens: agent.max_tokens || 1024,
      ferramentas_habilitadas: agent.ferramentas_habilitadas || ['crm_api'],
      knowledge_base_doc_id: agent.knowledge_base_doc_id || '',
      status: agent.status || 'ativo',
      modo: agent.modo || 'autonomo',
      horario_inicio: agent.horario_inicio || '08:00',
      horario_fim: agent.horario_fim || '18:00',
      trabalha_fim_semana: agent.trabalha_fim_semana || false,
      google_calendar_id: agent.google_calendar_id || '',
      gmail_enabled: agent.gmail_enabled || false
    })
    setActiveTab('info')
    setShowModal(true)
  }

  const saveAgent = async () => {
    if (!form.nome || !form.telefone_whatsapp) return

    const payload = { ...form }

    if (editingAgent) {
      await supabase.from('agentes').update(payload).eq('id', editingAgent.id)
    } else {
      await supabase.from('agentes').insert(payload)
    }

    fetchAgentes()
    setShowModal(false)
  }

  const toggleStatus = async (agent) => {
    const newStatus = agent.status === 'ativo' ? 'pausado' : 'ativo'
    await supabase.from('agentes').update({ status: newStatus }).eq('id', agent.id)
    fetchAgentes()
  }

  const deleteAgent = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este agente? Todas as conversas serão perdidas.')) return
    await supabase.from('agentes').delete().eq('id', id)
    fetchAgentes()
  }

  const openDetail = (agent) => {
    setSelectedAgent(agent)
    fetchStats(agent.id)
    setShowDetail(true)
  }

  const filtered = agentes.filter(a =>
    a.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.telefone_whatsapp?.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Agentes IA</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie seus agentes de atendimento inteligente
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors font-medium"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Agente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, empresa ou telefone..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: agentes.length, icon: Bot, color: 'blue' },
          { label: 'Ativos', value: agentes.filter(a => a.status === 'ativo').length, icon: Play, color: 'emerald' },
          { label: 'Pausados', value: agentes.filter(a => a.status === 'pausado').length, icon: Pause, color: 'yellow' },
          { label: 'Leads Gerados', value: agentes.reduce((acc, a) => acc + (a.leads_criados || 0), 0), icon: Users, color: 'purple' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} className={COLOR_MAP[stat.color]?.text || 'text-gray-500'} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Agent Cards */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Carregando agentes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bot size={56} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum agente encontrado</p>
          <button onClick={openCreateModal} className="mt-4 text-emerald-500 hover:underline">
            Criar primeiro agente
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((agent, i) => {
            const statusCfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.inativo
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${COLOR_MAP[statusCfg.color]?.bg10 || 'bg-gray-500/10'} flex items-center justify-center`}>
                        <Bot size={22} className={COLOR_MAP[statusCfg.color]?.text || 'text-gray-500'} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{agent.nome}</h3>
                        {agent.empresa && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Building2 size={11} />
                            <span>{agent.empresa}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLOR_MAP[statusCfg.color]?.bg10 || ''} ${COLOR_MAP[statusCfg.color]?.text600 || ''} ${COLOR_MAP[statusCfg.color]?.textDark || ''}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {agent.descricao && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{agent.descricao}</p>
                  )}

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Brain size={11} />
                      {agent.modelo || 'gpt-4.1-mini'}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Phone size={11} />
                      {agent.telefone_whatsapp}
                    </span>
                    {agent.ferramentas_habilitadas?.length > 0 && (
                      <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Zap size={11} />
                        {agent.ferramentas_habilitadas.length} ferramentas
                      </span>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{agent.total_mensagens || 0} msgs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{agent.leads_criados || 0} leads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{agent.reunioes_agendadas || 0} reuniões</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-gray-100 dark:border-white/5 px-5 py-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleStatus(agent)}
                      className={`p-2 rounded-lg transition-colors ${
                        agent.status === 'ativo'
                          ? 'text-yellow-500 hover:bg-yellow-500/10'
                          : 'text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                      title={agent.status === 'ativo' ? 'Pausar' : 'Ativar'}
                    >
                      {agent.status === 'ativo' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => openEditModal(agent)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => openDetail(agent)}
                    className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <span>Detalhes</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl mb-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Bot size={20} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingAgent ? 'Editar Agente' : 'Novo Agente'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-white/5 px-6">
                {[
                  { id: 'info', label: 'Informações', icon: Bot },
                  { id: 'prompt', label: 'Prompt IA', icon: Brain },
                  { id: 'tools', label: 'Ferramentas', icon: Zap },
                  { id: 'config', label: 'Configurações', icon: Settings2 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nome do Agente *</label>
                        <input
                          type="text"
                          value={form.nome}
                          onChange={e => setForm({ ...form, nome: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="Ex: Ronaldo IA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Empresa</label>
                        <input
                          type="text"
                          value={form.empresa}
                          onChange={e => setForm({ ...form, empresa: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="Ex: I9 Appify"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Descrição</label>
                      <textarea
                        value={form.descricao}
                        onChange={e => setForm({ ...form, descricao: e.target.value })}
                        rows={2}
                        className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                        placeholder="Descreva o papel deste agente..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">WhatsApp *</label>
                        <input
                          type="tel"
                          value={form.telefone_whatsapp}
                          onChange={e => setForm({ ...form, telefone_whatsapp: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="5531999999999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Instância Evolution</label>
                        <input
                          type="text"
                          value={form.instancia_evolution}
                          onChange={e => setForm({ ...form, instancia_evolution: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="zapevo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Evolution API URL</label>
                        <input
                          type="url"
                          value={form.evolution_api_url}
                          onChange={e => setForm({ ...form, evolution_api_url: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="https://evolution.seudominio.com.br"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Evolution API Key</label>
                        <input
                          type="password"
                          value={form.evolution_api_key}
                          onChange={e => setForm({ ...form, evolution_api_key: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Modelo IA</label>
                      <div className="grid grid-cols-2 gap-2">
                        {MODEL_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, modelo: opt.value })}
                            className={`p-3 rounded-xl text-left transition-colors border ${
                              form.modelo === opt.value
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs opacity-70">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'prompt' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Dica</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Defina a personalidade, tom de voz, regras de negócio e objetivos do agente.
                        Quanto mais detalhado, melhor o agente se comporta.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Prompt do Sistema</label>
                      <textarea
                        value={form.prompt_sistema}
                        onChange={e => setForm({ ...form, prompt_sistema: e.target.value })}
                        rows={16}
                        className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-sm"
                        placeholder={`# IDENTIDADE\nVocê é o [Nome], agente de IA da [Empresa].\n\n# PERSONALIDADE\n- Profissional e amigável\n- Respostas curtas (2-3 frases)\n\n# OBJETIVO\nQualificar leads e agendar demonstrações.\n\n# REGRAS\n- Nunca invente informações\n- Sempre consulte a base de conhecimento`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {form.prompt_sistema.length} caracteres
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Temperatura: {form.temperatura}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={form.temperatura}
                          onChange={e => setForm({ ...form, temperatura: parseFloat(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Preciso</span>
                          <span>Criativo</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Max Tokens</label>
                        <input
                          type="number"
                          min={256}
                          max={4096}
                          step={256}
                          value={form.max_tokens}
                          onChange={e => setForm({ ...form, max_tokens: parseInt(e.target.value) })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Google Docs ID (Base de Conhecimento)</label>
                      <input
                        type="text"
                        value={form.knowledge_base_doc_id}
                        onChange={e => setForm({ ...form, knowledge_base_doc_id: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="1m4abaDkIkqoQqtm5bLOqWcF64Kkl4U1lnflm4sd18h4"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'tools' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selecione as ferramentas que este agente pode usar durante as conversas.
                    </p>
                    {FERRAMENTAS_DISPONIVEIS.map(tool => {
                      const isActive = form.ferramentas_habilitadas.includes(tool.id)
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            const updated = isActive
                              ? form.ferramentas_habilitadas.filter(f => f !== tool.id)
                              : [...form.ferramentas_habilitadas, tool.id]
                            setForm({ ...form, ferramentas_habilitadas: updated })
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-emerald-500/20' : 'bg-gray-200 dark:bg-white/10'
                          }`}>
                            <tool.icon size={18} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-medium text-sm ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {tool.label}
                            </p>
                            <p className="text-xs text-gray-500">{tool.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isActive ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </button>
                      )
                    })}

                    {form.ferramentas_habilitadas.includes('google_calendar') && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Google Calendar ID</label>
                        <input
                          type="email"
                          value={form.google_calendar_id}
                          onChange={e => setForm({ ...form, google_calendar_id: e.target.value })}
                          className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="i9appify@gmail.com"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'config' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Status</label>
                      <div className="flex gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setForm({ ...form, status: key })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                              form.status === key
                                ? `${COLOR_MAP[cfg.color]?.bg10 || ''} ${COLOR_MAP[cfg.color]?.text600 || ''} ${COLOR_MAP[cfg.color]?.textDark || ''} border-emerald-500/30`
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10'
                            }`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Modo de Operação</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'autonomo', label: 'Autônomo', desc: 'Responde sozinho' },
                          { id: 'hibrido', label: 'Híbrido', desc: 'IA + humano' },
                          { id: 'manual', label: 'Manual', desc: 'Apenas sugestões' }
                        ].map(modo => (
                          <button
                            key={modo.id}
                            type="button"
                            onClick={() => setForm({ ...form, modo: modo.id })}
                            className={`flex-1 py-3 rounded-xl text-center transition-colors border ${
                              form.modo === modo.id
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10'
                            }`}
                          >
                            <p className="font-medium text-sm">{modo.label}</p>
                            <p className="text-xs opacity-70">{modo.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Início do Expediente</label>
                        <input
                          type="time"
                          value={form.horario_inicio}
                          onChange={e => setForm({ ...form, horario_inicio: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Fim do Expediente</label>
                        <input
                          type="time"
                          value={form.horario_fim}
                          onChange={e => setForm({ ...form, horario_fim: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Trabalha fim de semana</p>
                        <p className="text-xs text-gray-500">Agente responde sábado e domingo</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, trabalha_fim_semana: !form.trabalha_fim_semana })}
                        className="text-2xl"
                      >
                        {form.trabalha_fim_semana
                          ? <ToggleRight size={32} className="text-emerald-500" />
                          : <ToggleLeft size={32} className="text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveAgent}
                  disabled={!form.nome || !form.telefone_whatsapp}
                  className="flex-1 py-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  {editingAgent ? 'Salvar Alterações' : 'Criar Agente'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {showDetail && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-end"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[#0d1117] border-l border-gray-200 dark:border-white/10 h-full overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAgent.nome}</h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Agent Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Empresa</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.empresa || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Modelo</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">WhatsApp</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.telefone_whatsapp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Instância</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.instancia_evolution || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Horário</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedAgent.horario_inicio} - {selectedAgent.horario_fim}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <h3 className="font-bold text-gray-900 dark:text-white">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Mensagens', value: selectedAgent.total_mensagens || 0, icon: MessageSquare },
                      { label: 'Conversas', value: selectedAgent.total_conversas || 0, icon: Activity },
                      { label: 'Leads', value: selectedAgent.leads_criados || 0, icon: Users },
                      { label: 'Reuniões', value: selectedAgent.reunioes_agendadas || 0, icon: Calendar }
                    ].map(stat => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <stat.icon size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{stat.label}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Prompt Preview */}
                  {selectedAgent.prompt_sistema && (
                    <>
                      <h3 className="font-bold text-gray-900 dark:text-white">Prompt</h3>
                      <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                          {selectedAgent.prompt_sistema}
                        </pre>
                      </div>
                    </>
                  )}

                  {/* Tools */}
                  {selectedAgent.ferramentas_habilitadas?.length > 0 && (
                    <>
                      <h3 className="font-bold text-gray-900 dark:text-white">Ferramentas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.ferramentas_habilitadas.map(f => (
                          <span key={f} className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg">
                            {FERRAMENTAS_DISPONIVEIS.find(t => t.id === f)?.label || f}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => { setShowDetail(false); openEditModal(selectedAgent) }}
                      className="flex-1 py-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleStatus(selectedAgent)}
                      className={`flex-1 py-3 border rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        selectedAgent.status === 'ativo'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {selectedAgent.status === 'ativo' ? <Pause size={16} /> : <Play size={16} />}
                      {selectedAgent.status === 'ativo' ? 'Pausar' : 'Ativar'}
                    </button>
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
