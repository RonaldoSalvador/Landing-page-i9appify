import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Workflow,
  RefreshCw,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Loader2,
  Key
} from 'lucide-react'

const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n.i9appify.com.br'
const N8N_API_KEY_ENV = import.meta.env.VITE_N8N_API_KEY || ''

export default function N8nWorkflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | active | inactive
  const [toggling, setToggling] = useState(null) // workflow id being toggled
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showKeyConfig, setShowKeyConfig] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadApiKey()
  }, [])

  useEffect(() => {
    if (apiKey) fetchWorkflows()
  }, [apiKey])

  const loadApiKey = async () => {
    // Prioridade 1: variável de ambiente (.env)
    if (N8N_API_KEY_ENV) {
      setApiKey(N8N_API_KEY_ENV)
      setApiKeyInput(N8N_API_KEY_ENV)
      return
    }
    // Prioridade 2: salvo no Supabase (configurado via UI)
    const { data } = await supabase
      .from('configuracoes')
      .select('n8n_api_key')
      .maybeSingle()

    if (data?.n8n_api_key) {
      setApiKey(data.n8n_api_key)
      setApiKeyInput(data.n8n_api_key)
    } else {
      setLoading(false)
      setShowKeyConfig(true)
    }
  }

  const saveApiKey = async () => {
    if (!apiKeyInput.trim()) return
    setSavingKey(true)
    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({ n8n_api_key: apiKeyInput.trim() }, { onConflict: 'id' })
      if (error) throw error
      setApiKey(apiKeyInput.trim())
      setShowKeyConfig(false)
      setSuccess('Chave salva com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar chave: ' + err.message)
    } finally {
      setSavingKey(false)
    }
  }

  const fetchWorkflows = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${N8N_URL}/api/v1/workflows?limit=100`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
      const json = await res.json()
      setWorkflows(json.data || [])
    } catch (err) {
      setError('Não foi possível conectar ao n8n. Verifique a chave e URL. ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  const toggleWorkflow = async (workflow) => {
    if (toggling) return
    setToggling(workflow.id)
    const endpoint = workflow.active
      ? `${N8N_URL}/api/v1/workflows/${workflow.id}/deactivate`
      : `${N8N_URL}/api/v1/workflows/${workflow.id}/activate`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const updated = await res.json()
      setWorkflows(prev =>
        prev.map(w => w.id === workflow.id ? { ...w, active: updated.active } : w)
      )
      setSuccess(`"${workflow.name}" ${updated.active ? 'ativado' : 'desativado'} com sucesso!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao alterar status: ' + err.message)
      setTimeout(() => setError(''), 4000)
    } finally {
      setToggling(null)
    }
  }

  const filtered = workflows.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? w.active :
      !w.active
    return matchSearch && matchFilter
  })

  const activeCount = workflows.filter(w => w.active).length
  const inactiveCount = workflows.filter(w => !w.active).length

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl">
            <Workflow size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows n8n</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie seus fluxos de automação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <Key size={15} />
            API Key
          </button>

          <button
            onClick={fetchWorkflows}
            disabled={loading || !apiKey}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>

          <a
            href={N8N_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <ExternalLink size={15} />
            Abrir n8n
          </a>
        </div>
      </motion.div>

      {/* API Key Config Panel */}
      <AnimatePresence>
        {showKeyConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <Key size={16} />
                <span className="font-semibold text-sm">Configurar API Key do n8n</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gere sua API Key em: <strong>{N8N_URL}/settings/api</strong>
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="Cole sua API Key aqui..."
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                  onKeyDown={e => e.key === 'Enter' && saveApiKey()}
                />
                <button
                  onClick={saveApiKey}
                  disabled={savingKey || !apiKeyInput.trim()}
                  className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-40 font-medium"
                >
                  {savingKey ? <Loader2 size={14} className="animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"
          >
            <CheckCircle2 size={16} />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {!loading && workflows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: workflows.length, icon: Workflow, color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
            { label: 'Ativos', value: activeCount, icon: Zap, color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
            { label: 'Pausados', value: inactiveCount, icon: Square, color: 'gray', bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-4 ${stat.bg} border ${stat.border} flex items-center gap-3`}
            >
              <stat.icon size={20} className={stat.text} />
              <div>
                <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      {!loading && workflows.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar workflows..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'inactive', label: 'Pausados' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin text-purple-400" />
            <p className="text-sm">Carregando workflows...</p>
          </div>
        </div>
      )}

      {/* No API Key */}
      {!loading && !apiKey && (
        <div className="rounded-2xl bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Key size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Configure a API Key do n8n para começar</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Clique em "API Key" no canto superior direito
          </p>
        </div>
      )}

      {/* Workflow List */}
      {!loading && apiKey && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((workflow, i) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 overflow-hidden"
              >
                {/* Main Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Status Indicator */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    workflow.active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-400 dark:bg-gray-600'
                  }`} />

                  {/* Name & Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{workflow.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      ID: {workflow.id} · Atualizado: {formatDate(workflow.updatedAt)}
                    </p>
                  </div>

                  {/* Tags */}
                  {workflow.tags?.length > 0 && (
                    <div className="hidden md:flex gap-1">
                      {workflow.tags.slice(0, 2).map(tag => (
                        <span key={tag.id} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status Badge */}
                  <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                  }`}>
                    {workflow.active ? <><Zap size={11} /> Ativo</> : <><Square size={11} /> Pausado</>}
                  </span>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleWorkflow(workflow)}
                    disabled={toggling === workflow.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                      workflow.active
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {toggling === workflow.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : workflow.active ? (
                      <><PowerOff size={14} /> Desligar</>
                    ) : (
                      <><Power size={14} /> Ligar</>
                    )}
                  </button>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedId(expandedId === workflow.id ? null : workflow.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {expandedId === workflow.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expandedId === workflow.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/5"
                    >
                      <div className="px-5 py-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">Criado em</p>
                          <p className="text-gray-700 dark:text-gray-300">{formatDate(workflow.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">Nodes</p>
                          <p className="text-gray-700 dark:text-gray-300">{workflow.nodes?.length ?? '—'} nós</p>
                        </div>
                        <div className="col-span-2">
                          <a
                            href={`${N8N_URL}/workflow/${workflow.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-xs transition-colors"
                          >
                            <ExternalLink size={12} />
                            Abrir no n8n
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <Workflow size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum workflow encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
