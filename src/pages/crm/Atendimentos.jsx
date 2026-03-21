import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Search, Send, Bot, User, Phone, Clock,
  Pause, Play, ArrowLeft, Image, Mic, FileText, MoreVertical,
  ChevronDown, Filter, X, RefreshCw, Sparkles, Building2
} from 'lucide-react'

export default function Atendimentos() {
  const [conversas, setConversas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversa, setSelectedConversa] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [agentes, setAgentes] = useState([])
  const [filterAgente, setFilterAgente] = useState('todos')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchAgentes()
    fetchConversas()

    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_history'
      }, payload => {
        if (selectedConversa && payload.new.telefone_whatsapp === selectedConversa.telefone_whatsapp) {
          setMensagens(prev => [...prev, payload.new])
          scrollToBottom()
        }
        fetchConversas()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConversa])

  const fetchAgentes = async () => {
    const { data } = await supabase.from('agentes').select('id, nome, empresa').order('nome')
    setAgentes(data || [])
  }

  const fetchConversas = async () => {
    const { data } = await supabase
      .from('conversas')
      .select('*, agentes(nome, empresa)')
      .order('ultima_mensagem_em', { ascending: false })

    setConversas(data || [])
    setLoading(false)
  }

  const fetchMensagens = async (conversa) => {
    setSelectedConversa(conversa)
    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .eq('agente_id', conversa.agente_id)
      .eq('telefone_whatsapp', conversa.telefone_whatsapp)
      .order('created_at', { ascending: true })
      .limit(100)

    setMensagens(data || [])
    setTimeout(scrollToBottom, 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const togglePause = async (conversa) => {
    const newStatus = conversa.status === 'pausada' ? 'ativa' : 'pausada'
    await supabase
      .from('conversas')
      .update({
        status: newStatus,
        pausada_por: newStatus === 'pausada' ? 'humano' : null,
        pausada_em: newStatus === 'pausada' ? new Date().toISOString() : null
      })
      .eq('id', conversa.id)

    fetchConversas()
    if (selectedConversa?.id === conversa.id) {
      setSelectedConversa({ ...conversa, status: newStatus })
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const getMediaIcon = (tipo) => {
    switch (tipo) {
      case 'audio': return <Mic size={12} className="text-blue-400" />
      case 'image': return <Image size={12} className="text-purple-400" />
      case 'document': return <FileText size={12} className="text-orange-400" />
      default: return null
    }
  }

  const filteredConversas = conversas.filter(c => {
    const matchSearch = c.telefone_whatsapp?.includes(searchTerm) ||
      c.agentes?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'todas' || c.status === filterStatus
    const matchAgente = filterAgente === 'todos' || c.agente_id?.toString() === filterAgente
    return matchSearch && matchStatus && matchAgente
  })

  return (
    <div className="flex h-[calc(100vh-2rem)] -m-6 bg-white dark:bg-[#0d1117]">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-white/5 flex flex-col ${
        selectedConversa ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MessageSquare size={22} className="text-emerald-500" />
            Atendimentos
          </h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="todas">Todas</option>
              <option value="ativa">Ativas</option>
              <option value="pausada">Pausadas</option>
              <option value="encerrada">Encerradas</option>
              <option value="transbordo">Transbordo</option>
            </select>
            <select
              value={filterAgente}
              onChange={e => setFilterAgente(e.target.value)}
              className="flex-1 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="todos">Todos Agentes</option>
              {agentes.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : filteredConversas.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-sm text-gray-500 font-medium">Nenhuma conversa encontrada</p>
              <p className="text-xs text-gray-400 mt-1">As conversas aparecem quando clientes enviam mensagens</p>
            </div>
          ) : (
            filteredConversas.map((conversa, index) => (
              <motion.button
                key={conversa.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => fetchMensagens(conversa)}
                className={`w-full text-left p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 ${
                  selectedConversa?.id === conversa.id ? 'bg-emerald-50 dark:bg-emerald-500/5 border-l-3 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    conversa.status === 'ativa' ? 'bg-emerald-500/10' :
                    conversa.status === 'pausada' ? 'bg-yellow-500/10' :
                    conversa.status === 'transbordo' ? 'bg-red-500/10' :
                    'bg-gray-100 dark:bg-white/10'
                  }`}>
                    <Phone size={16} className={
                      conversa.status === 'ativa' ? 'text-emerald-500' :
                      conversa.status === 'pausada' ? 'text-yellow-500' :
                      conversa.status === 'transbordo' ? 'text-red-500' :
                      'text-gray-400'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {conversa.telefone_whatsapp}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conversa.ultima_mensagem_em)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Bot size={11} />
                        {conversa.agentes?.nome || 'Agente'}
                      </span>
                      {conversa.status === 'pausada' && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-medium">
                          Pausada
                        </span>
                      )}
                      {conversa.status === 'transbordo' && (
                        <span className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-medium">
                          Transbordo
                        </span>
                      )}
                    </div>
                    {conversa.resumo && (
                      <p className="text-xs text-gray-400 truncate mt-1">{conversa.resumo}</p>
                    )}
                  </div>
                  {conversa.total_mensagens > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                      {conversa.total_mensagens}
                    </span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConversa ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversa ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversa(null)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedConversa.status === 'ativa' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'
                }`}>
                  <Phone size={16} className={selectedConversa.status === 'ativa' ? 'text-emerald-500' : 'text-yellow-500'} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {selectedConversa.telefone_whatsapp}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Bot size={11} />
                    <span>{selectedConversa.agentes?.nome}</span>
                    <span>•</span>
                    <span className={`font-medium ${
                      selectedConversa.status === 'ativa' ? 'text-emerald-500' :
                      selectedConversa.status === 'pausada' ? 'text-yellow-500' : 'text-gray-400'
                    }`}>
                      {selectedConversa.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePause(selectedConversa)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedConversa.status === 'pausada'
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                  }`}
                >
                  {selectedConversa.status === 'pausada' ? <Play size={14} /> : <Pause size={14} />}
                  {selectedConversa.status === 'pausada' ? 'Retomar IA' : 'Pausar IA'}
                </button>
                <button
                  onClick={() => fetchMensagens(selectedConversa)}
                  className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg transition-colors"
                  title="Atualizar"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-[#0a0e14]">
              {mensagens.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-white/5'
                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
                  }`}>
                    <div className={`flex items-center gap-1.5 mb-1 text-xs ${
                      msg.role === 'assistant' ? 'text-emerald-500' : 'text-white/70'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={11} /> : <User size={11} />}
                      <span className="font-medium">{msg.role === 'assistant' ? 'Agente' : 'Cliente'}</span>
                      {msg.tipo_midia && msg.tipo_midia !== 'text' && (
                        <>
                          <span>•</span>
                          {getMediaIcon(msg.tipo_midia)}
                          <span className="capitalize">{msg.tipo_midia}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.mensagem}</p>

                    <div className={`flex items-center gap-2 mt-2 text-xs ${
                      msg.role === 'assistant' ? 'text-gray-400' : 'text-white/50'
                    }`}>
                      <Clock size={10} />
                      <span>{formatTime(msg.created_at)}</span>
                      {msg.ferramentas_usadas?.length > 0 && (
                        <>
                          <span>•</span>
                          <Sparkles size={10} />
                          <span>{msg.ferramentas_usadas.join(', ')}</span>
                        </>
                      )}
                      {msg.latencia_ms && (
                        <>
                          <span>•</span>
                          <span>{msg.latencia_ms}ms</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Info bar */}
            <div className="p-3 border-t border-gray-200 dark:border-white/5 text-center bg-white dark:bg-[#0d1117]">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Sparkles size={12} className="text-emerald-500" />
                As respostas são geradas automaticamente pelo agente IA. Pause para assumir manualmente.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50/50 dark:bg-[#0a0e14]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Central de Atendimentos
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Selecione uma conversa para visualizar as mensagens em tempo real
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
