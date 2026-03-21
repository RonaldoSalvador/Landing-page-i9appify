import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Send, Plus, X, Search, Calendar, CheckCircle, Clock,
  XCircle, Loader2, Upload, FileSpreadsheet, Play, Pause,
  BarChart3, Users, Eye, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-gray-500', icon: FileSpreadsheet },
  scheduled: { label: 'Agendada', color: 'bg-blue-500', icon: Calendar },
  running: { label: 'Em Andamento', color: 'bg-yellow-500', icon: Play },
  paused: { label: 'Pausada', color: 'bg-orange-500', icon: Pause },
  completed: { label: 'Concluída', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
}

const statusFilters = ['Todas', 'Em Andamento', 'Agendadas', 'Concluídas', 'Canceladas']

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: '',
    template_name: '',
    template_language: 'pt_BR',
    channel_id: null,
    scheduled_at: '',
    contacts: [],
  })
  const [channels, setChannels] = useState([])
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchChannels()
  }, [])

  async function fetchCampaigns() {
    const { data } = await supabase
      .from('campaigns')
      .select('*, channels(nome, tipo)')
      .order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  async function fetchChannels() {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .eq('tipo', 'whatsapp_official')
      .eq('status', 'connected')
    setChannels(data || [])
  }

  const filteredCampaigns = campaigns.filter(c => {
    if (activeFilter !== 'Todas') {
      const statusMap = {
        'Em Andamento': 'running',
        'Agendadas': 'scheduled',
        'Concluídas': 'completed',
        'Canceladas': 'cancelled',
      }
      if (c.status !== statusMap[activeFilter]) return false
    }
    if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleFileUpload(e) {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
    if (!file) return
    // TODO: Parse .xlsx file using SheetJS
    // For now, just store the filename
    setFormData(prev => ({
      ...prev,
      contacts: [{ fileName: file.name, count: 'processando...' }]
    }))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Send size={28} className="text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disparos em Massa</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Envie templates WhatsApp para múltiplos contatos via Meta Official API</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowNewCampaign(false); fetchCampaigns() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              !showNewCampaign ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BarChart3 size={16} /> Campanhas
          </button>
          <button
            onClick={() => { setShowNewCampaign(true); setStep(1) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showNewCampaign ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Plus size={16} /> Nova Campanha
          </button>
        </div>
      </div>

      {showNewCampaign ? (
        /* Nova Campanha - Steps */
        <div>
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { num: 1, label: 'Upload da Lista' },
              { num: 2, label: 'Canal & Template' },
              { num: 3, label: 'Confirmar Disparo' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {s.num}
                </div>
                <span className={`text-sm font-medium ${step >= s.num ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <div className={`w-16 h-0.5 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Lista de Contatos</h2>
                <p className="text-gray-500 text-sm mb-4">Faça upload de um arquivo Excel (.xlsx ou .xls) com os contatos do disparo</p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Campanha *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Promoção Junho, Confirmação de Consulta..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(e) }}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragOver ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <FileSpreadsheet size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Arraste o arquivo ou clique para selecionar</p>
                  <p className="text-gray-400 text-sm mt-1">Suporta .xlsx, .xls — máximo de 10.000 contatos</p>
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="inline-block mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer font-medium text-sm">
                    Selecionar Arquivo
                  </label>
                </div>

                {/* Format info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">ℹ️ Formato esperado da planilha:</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">A primeira linha deve ser o cabeçalho das colunas.</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">A coluna de telefone deve se chamar exatamente <strong>telefone</strong> e conter o número com DDI (ex: 5511999999999).</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">As demais colunas viram variáveis do template.</p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.nome}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Canal & Template</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canal (WhatsApp Oficial) *</label>
                    {channels.length === 0 ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          Nenhum canal WhatsApp Oficial conectado. Adicione um canal primeiro.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={formData.channel_id || ''}
                        onChange={e => setFormData({ ...formData, channel_id: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Selecione um canal</option>
                        {channels.map(c => (
                          <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Template (Meta) *</label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={e => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="Nome exato do template aprovado na Meta"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agendamento (opcional)</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.channel_id || !formData.template_name}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <Send size={48} className="mx-auto mb-4 text-emerald-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmar Disparo</h2>
                <p className="text-gray-500 mb-6">Revise os dados antes de iniciar a campanha</p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto text-left space-y-2">
                  <p className="text-sm"><strong>Campanha:</strong> {formData.nome}</p>
                  <p className="text-sm"><strong>Template:</strong> {formData.template_name}</p>
                  <p className="text-sm"><strong>Agendamento:</strong> {formData.scheduled_at || 'Imediato'}</p>
                </div>

                <div className="flex justify-center gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">
                    ← Voltar
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.from('campaigns').insert({
                        org_id: 1,
                        channel_id: formData.channel_id,
                        nome: formData.nome,
                        template_name: formData.template_name,
                        template_language: formData.template_language,
                        status: formData.scheduled_at ? 'scheduled' : 'draft',
                        scheduled_at: formData.scheduled_at || null,
                      })
                      setShowNewCampaign(false)
                      fetchCampaigns()
                    }}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
                  >
                    ✓ Confirmar e Criar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Lista de Campanhas */
        <div>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar campanha..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {statusFilters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Campaigns List */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl">
              <Send size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nenhuma campanha ainda</h3>
              <p className="text-gray-500 text-sm">Crie seu primeiro disparo em massa pela aba "Nova Campanha"</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Campanha</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enviados</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Entregues</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Lidos</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map(c => {
                    const st = statusConfig[c.status] || statusConfig.draft
                    const StIcon = st.icon
                    return (
                      <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.nome}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${st.color}`}>
                            <StIcon size={12} /> {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.enviados || 0}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.entregues || 0}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.lidos || 0}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(c.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
