import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Search,
  Workflow,
  Users,
  Crown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Zap,
  Square,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Sparkles,
  RefreshCw
} from 'lucide-react'

const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n.i9appify.com.br'
const N8N_API_KEY_ENV = import.meta.env.VITE_N8N_API_KEY || ''

const PLANS = [
  { id: 'starter', label: 'Starter', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  { id: 'pro', label: 'Pro', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'enterprise', label: 'Enterprise', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
]

export default function Clientes() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [workflows, setWorkflows] = useState([])
  const [loadingFlows, setLoadingFlows] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    plan: 'starter',
    owner_name: ''
  })

  useEffect(() => {
    fetchOrgs()
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    if (N8N_API_KEY_ENV) { setApiKey(N8N_API_KEY_ENV); return }
    const { data } = await supabase
      .from('configuracoes')
      .select('n8n_api_key')
      .maybeSingle()
    if (data?.n8n_api_key) setApiKey(data.n8n_api_key)
  }

  const fetchOrgs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('organizations')
      .select('*, org_members(count)')
      .order('created_at', { ascending: false })

    if (!error) setOrgs(data || [])
    setLoading(false)
  }

  const fetchWorkflowsForOrg = async (orgNome) => {
    if (!apiKey) return
    setLoadingFlows(true)
    try {
      const res = await fetch(`${N8N_URL}/api/v1/workflows?limit=100`, {
        headers: { 'X-N8N-API-KEY': apiKey }
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      const orgSlug = orgNome.toLowerCase().replace(/\s+/g, '-')
      const related = (json.data || []).filter(w =>
        w.name.toLowerCase().includes(orgNome.toLowerCase()) ||
        w.name.toLowerCase().includes(orgSlug) ||
        w.tags?.some(t => t.name.toLowerCase().includes(orgNome.toLowerCase()))
      )
      setWorkflows(related)
    } catch {
      setWorkflows([])
    } finally {
      setLoadingFlows(false)
    }
  }

  const handleExpand = async (org) => {
    if (expandedId === org.id) {
      setExpandedId(null)
      setWorkflows([])
      return
    }
    setExpandedId(org.id)
    fetchWorkflowsForOrg(org.nome)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nome da organização é obrigatório')
      return
    }
    setSaving(true)
    setError('')

    try {
      const { data, error: dbErr } = await supabase
        .from('organizations')
        .insert({
          nome: form.name.trim(),
          plano: form.plan,
          descricao: [form.owner_name, form.email, form.phone, form.website]
            .filter(Boolean).join(' | ')
        })
        .select()
        .single()

      if (dbErr) throw dbErr

      setSuccess(`Cliente "${form.name}" cadastrado com sucesso!`)
      setForm({ name: '', email: '', phone: '', website: '', plan: 'starter', owner_name: '' })
      setShowForm(false)
      fetchOrgs()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar cliente')
    } finally {
      setSaving(false)
    }
  }

  const filtered = orgs.filter(o =>
    o.nome?.toLowerCase().includes(search.toLowerCase()) ||
    o.descricao?.toLowerCase().includes(search.toLowerCase())
  )

  const getPlanStyle = (plan) => PLANS.find(p => p.id === plan) || PLANS[0]

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
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
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Building2 size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organizações e seus workflows no n8n
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"
          >
            <CheckCircle2 size={16} /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles size={16} />
                  <span className="font-semibold">Novo Cliente / Organização</span>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Nome da Empresa *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Escritório Silva Advogados"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="contato@empresa.com"
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+55 11 99999-9999"
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Website</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                      placeholder="https://empresa.com.br"
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Nome do Responsável</label>
                  <div className="relative">
                    <Crown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.owner_name}
                      onChange={e => setForm({ ...form, owner_name: e.target.value })}
                      placeholder="Nome do dono/gestor"
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Plano</label>
                  <div className="flex gap-2">
                    {PLANS.map(plan => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setForm({ ...form, plan: plan.id })}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.plan === plan.id
                            ? `${plan.bg} ${plan.border} ${plan.color}`
                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-40"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-400" />
        </div>
      )}

      {/* Org List */}
      {!loading && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((org, i) => {
              const plan = getPlanStyle(org.plano)
              return (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 overflow-hidden"
                >
                  {/* Main Row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-sm">
                        {org.nome?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{org.nome}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {org.descricao && (
                          <span className="text-xs text-gray-400 truncate max-w-xs">{org.descricao}</span>
                        )}
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(org.created_at)}</span>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${plan.bg} ${plan.border} ${plan.color}`}>
                      {plan.label}
                    </span>

                    {/* Members Count */}
                    <div className="hidden md:flex items-center gap-1.5 text-gray-400 text-sm">
                      <Users size={14} />
                      <span>{org.org_members?.[0]?.count ?? 0}</span>
                    </div>

                    {/* Expand to see workflows */}
                    <button
                      onClick={() => handleExpand(org)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded-lg hover:bg-purple-500/20 transition-all"
                    >
                      <Workflow size={13} />
                      Fluxos
                      {expandedId === org.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expanded: n8n Workflows */}
                  <AnimatePresence>
                    {expandedId === org.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100 dark:border-white/5"
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                              <Workflow size={14} />
                              Workflows n8n vinculados a "{org.nome}"
                            </div>
                            <button
                              onClick={() => fetchWorkflowsForOrg(org.nome)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              <RefreshCw size={13} className={loadingFlows ? 'animate-spin' : ''} />
                            </button>
                          </div>

                          {loadingFlows ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                              <Loader2 size={14} className="animate-spin" />
                              Buscando workflows...
                            </div>
                          ) : workflows.length > 0 ? (
                            <div className="space-y-2">
                              {workflows.map(w => (
                                <div key={w.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.active ? 'bg-emerald-400' : 'bg-gray-400 dark:bg-gray-600'}`} />
                                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{w.name}</span>
                                  <span className={`text-xs ${w.active ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {w.active ? 'Ativo' : 'Pausado'}
                                  </span>
                                  <a
                                    href={`${N8N_URL}/workflow/${w.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-purple-400 transition-colors"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 py-2">
                              {apiKey
                                ? `Nenhum workflow com "${org.nome}" no nome ou tags.`
                                : 'Configure a API Key do n8n em Configurações para ver os workflows.'
                              }
                              <a
                                href={`${N8N_URL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-xs"
                              >
                                <ExternalLink size={11} /> Criar workflow no n8n
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-500 dark:text-gray-400">Nenhum cliente cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Cliente" para começar</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
