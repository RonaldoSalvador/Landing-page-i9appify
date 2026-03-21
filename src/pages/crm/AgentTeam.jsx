import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import {
  Cpu, Bot, Zap, MessageCircle, Calendar, TrendingUp,
  Circle, Activity, Clock, Target, Users, BarChart3,
  Sparkles, Shield, Brain, Wrench, Plus, ArrowRight,
  Megaphone, Palette, Network, MousePointer, CheckCircle2, XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { SKILLS_REGISTRY, getSkillsByCategory } from '../../lib/skills/index.js'

const roleIcons = {
  vendas: { icon: Target, color: 'from-orange-400 to-red-500' },
  atendimento: { icon: MessageCircle, color: 'from-blue-400 to-cyan-500' },
  suporte: { icon: Shield, color: 'from-green-400 to-emerald-500' },
  marketing: { icon: Sparkles, color: 'from-purple-400 to-pink-500' },
  agendamento: { icon: Calendar, color: 'from-yellow-400 to-orange-500' },
  default: { icon: Brain, color: 'from-indigo-400 to-violet-500' },
}

const categoryIcons = {
  marketing: { icon: Megaphone, color: '#f97316' },
  design: { icon: Palette, color: '#06b6d4' },
  orchestration: { icon: Network, color: '#a855f7' },
  prospecting: { icon: Target, color: '#10b981' },
}

function detectRole(agent) {
  const name = (agent.nome + ' ' + (agent.descricao || '') + ' ' + (agent.prompt_sistema || '')).toLowerCase()
  if (name.includes('vend') || name.includes('comercial')) return 'vendas'
  if (name.includes('atend') || name.includes('chat')) return 'atendimento'
  if (name.includes('suporte') || name.includes('help')) return 'suporte'
  if (name.includes('market') || name.includes('copy')) return 'marketing'
  if (name.includes('agenda') || name.includes('calendar')) return 'agendamento'
  return 'default'
}

export default function AgentTeam() {
  const [agents, setAgents] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [agentsRes, statsRes] = await Promise.all([
      supabase.from('agentes').select('*').order('created_at'),
      supabase.from('agent_stats').select('*').order('data', { ascending: false }).limit(50),
    ])
    setAgents(agentsRes.data || [])
    setStats(statsRes.data || [])
    setLoading(false)
  }

  function getAgentStats(agentId) {
    const agentStats = stats.filter(s => s.agente_id === agentId)
    return {
      totalMensagens: agentStats.reduce((acc, s) => acc + (s.mensagens_enviadas || 0), 0),
      totalConversas: agentStats.reduce((acc, s) => acc + (s.conversas_iniciadas || 0), 0),
      totalLeads: agentStats.reduce((acc, s) => acc + (s.leads_criados || 0), 0),
      tempoMedio: agentStats.length > 0 ? Math.round(agentStats.reduce((acc, s) => acc + (s.tempo_medio_resposta_ms || 0), 0) / agentStats.length / 1000) : 0,
    }
  }

  const totalStats = {
    agentes: agents.filter(a => a.status === 'ativo').length,
    mensagens: stats.reduce((acc, s) => acc + (s.mensagens_enviadas || 0), 0),
    leads: stats.reduce((acc, s) => acc + (s.leads_criados || 0), 0),
    conversas: stats.reduce((acc, s) => acc + (s.conversas_iniciadas || 0), 0),
  }

  const skillCategories = getSkillsByCategory()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time de Agentes IA</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Painel operacional da equipe de agentes</p>
          </div>
        </div>
        <Link
          to="/crm/agentes"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Gerenciar Agentes
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Agentes Ativos', value: totalStats.agentes, icon: Bot, color: '#a855f7' },
          { label: 'Mensagens Enviadas', value: totalStats.mensagens, icon: MessageCircle, color: '#3b82f6' },
          { label: 'Leads Gerados', value: totalStats.leads, icon: Users, color: '#10b981' },
          { label: 'Conversas', value: totalStats.conversas, icon: Activity, color: '#f97316' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{kpi.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agents Section */}
      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-8"
        >
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot size={32} className="text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum agente cadastrado</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Crie seu primeiro agente IA para atender leads automaticamente via WhatsApp.
              Os agentes respondem 24h com inteligência artificial.
            </p>
            <Link
              to="/crm/agentes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Criar Primeiro Agente
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Setup Guide */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#30363d]">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Como configurar:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Criar Agente', desc: 'Defina nome, modelo IA e prompt de comportamento' },
                { step: '2', title: 'Conectar WhatsApp', desc: 'Configure Z-API ou Evolution API com as credenciais' },
                { step: '3', title: 'Ativar Skills', desc: 'Adicione skills de copywriting, vendas e prospecção' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-500">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Agent Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent, i) => {
            const role = detectRole(agent)
            const roleConfig = roleIcons[role]
            const RoleIcon = roleConfig.icon
            const agentStats = getAgentStats(agent.id)
            const isActive = agent.status === 'ativo'

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                className={`relative bg-white dark:bg-[#161b22] border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  selectedAgent?.id === agent.id
                    ? 'border-violet-400 dark:border-violet-500 shadow-violet-500/5'
                    : 'border-gray-200 dark:border-[#30363d]'
                }`}
              >
                {/* Status */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isActive ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <XCircle size={14} className="text-gray-400" />
                  )}
                  <span className={`text-xs ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                    {isActive ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleConfig.color} flex items-center justify-center shadow-lg`}>
                    <RoleIcon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{agent.nome}</h3>
                    <p className="text-xs text-gray-500">{agent.modelo} • {role}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {agent.descricao || agent.empresa || 'Sem descrição'}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: agentStats.totalMensagens, label: 'Msgs' },
                    { value: agentStats.totalLeads, label: 'Leads' },
                    { value: `${agentStats.tempoMedio}s`, label: 'Resp.' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 dark:bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-base font-bold text-gray-900 dark:text-white">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tools */}
                {agent.ferramentas_habilitadas?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-[#21262d]">
                    {agent.ferramentas_habilitadas.map(tool => (
                      <span key={tool} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-500">
                        {tool.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Schedule */}
                {agent.horario_inicio && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <Clock size={12} />
                    {agent.horario_inicio} - {agent.horario_fim}
                    {agent.trabalha_fim_semana && ' (incl. fins de semana)'}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Skills Disponíveis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Skills Disponíveis</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
            {Object.keys(SKILLS_REGISTRY).length} skills
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Object.entries(skillCategories).map(([catKey, category]) => {
            const catConfig = categoryIcons[catKey]
            const CatIcon = catConfig?.icon || Zap

            return (
              <motion.div
                key={catKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-[#30363d] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${catConfig?.color}15` }}>
                    <CatIcon size={16} style={{ color: catConfig?.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{category.label}</h3>
                    <p className="text-xs text-gray-400">{category.skills.length} skills</p>
                  </div>
                </div>

                {/* Skills List */}
                <div className="divide-y divide-gray-50 dark:divide-[#21262d]">
                  {category.skills.map(skill => (
                    <div key={skill.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{skill.name}</p>
                          {skill.recommended && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-xs font-medium flex-shrink-0">
                              Recomendada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{skill.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded flex-shrink-0">
                        {skill.source}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
