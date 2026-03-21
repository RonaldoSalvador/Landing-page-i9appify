import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Wifi, Plus, X, Phone, MessageCircle, Instagram,
  CheckCircle, XCircle, Loader2, Settings2, Trash2, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const channelTypes = [
  {
    tipo: 'whatsapp_official',
    nome: 'WhatsApp Oficial',
    descricao: 'Conecte via API Oficial (Meta Cloud)',
    icon: '🟢',
    color: 'bg-green-500',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: 'Ex: 123456789...' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Token permanente da Meta', type: 'password' },
      { key: 'business_account_id', label: 'Business Account ID', placeholder: 'WABA ID' },
    ]
  },
  {
    tipo: 'zapi',
    nome: 'Z-API (QR Code)',
    descricao: 'Conecte usando o QR Code do seu WhatsApp',
    icon: '📱',
    color: 'bg-emerald-500',
    fields: [
      { key: 'instance_id', label: 'Instance ID', placeholder: 'Ex: 3D6F8ABC123...' },
      { key: 'token', label: 'Token', placeholder: 'Token da instância', type: 'password' },
      { key: 'client_token', label: 'Client-Token', placeholder: 'Security Token', type: 'password' },
    ]
  },
  {
    tipo: 'evolution',
    nome: 'Evolution API',
    descricao: 'Conecte via Evolution API (self-hosted)',
    icon: '⚡',
    color: 'bg-blue-500',
    fields: [
      { key: 'api_url', label: 'URL da API', placeholder: 'https://evolution.seudominio.com' },
      { key: 'api_key', label: 'API Key', placeholder: 'Chave da API', type: 'password' },
      { key: 'instance_name', label: 'Nome da Instância', placeholder: 'Ex: i9appify' },
    ]
  },
  {
    tipo: 'instagram',
    nome: 'Instagram',
    descricao: 'Indisponível no momento',
    icon: '📷',
    color: 'bg-purple-500',
    disabled: true,
  }
]

export default function Channels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [editingChannel, setEditingChannel] = useState(null)
  const [formData, setFormData] = useState({ nome: '', telefone: '', credentials: {} })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchChannels()
    const sub = supabase.channel('channels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchChannels)
      .subscribe()
    return () => sub.unsubscribe()
  }, [])

  async function fetchChannels() {
    const { data } = await supabase.from('channels').select('*').order('created_at', { ascending: false })
    setChannels(data || [])
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      org_id: 1, // TODO: usar org do contexto
      tipo: selectedType.tipo,
      nome: formData.nome || selectedType.nome,
      telefone: formData.telefone,
      credentials: formData.credentials,
      status: 'disconnected',
      webhook_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver`,
    }

    if (editingChannel) {
      await supabase.from('channels').update(payload).eq('id', editingChannel.id)
    } else {
      await supabase.from('channels').insert(payload)
    }

    setSaving(false)
    setShowConfigModal(false)
    setSelectedType(null)
    setEditingChannel(null)
    setFormData({ nome: '', telefone: '', credentials: {} })
    fetchChannels()
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja remover este canal?')) return
    await supabase.from('channels').delete().eq('id', id)
    fetchChannels()
  }

  async function toggleStatus(channel) {
    const newStatus = channel.status === 'connected' ? 'disconnected' : 'connected'
    await supabase.from('channels').update({ status: newStatus, ultimo_status_em: new Date().toISOString() }).eq('id', channel.id)
    fetchChannels()
  }

  function openEdit(channel) {
    const type = channelTypes.find(t => t.tipo === channel.tipo)
    setSelectedType(type)
    setEditingChannel(channel)
    setFormData({ nome: channel.nome, telefone: channel.telefone, credentials: channel.credentials || {} })
    setShowConfigModal(true)
  }

  const statusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} className="text-green-500" />
      case 'connecting': return <Loader2 size={16} className="text-yellow-500 animate-spin" />
      default: return <XCircle size={16} className="text-red-400" />
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Wifi size={28} className="text-cyan-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canais</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os canais de comunicação do cliente</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} /> Adicionar Canal
        </button>
      </div>

      {/* Lista de Canais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card de Adicionar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Plus size={24} className="text-gray-400 group-hover:text-emerald-500" />
          </div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Adicionar Canal</span>
        </motion.button>

        {/* Canais existentes */}
        {channels.map((channel, i) => {
          const type = channelTypes.find(t => t.tipo === channel.tipo)
          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type?.icon || '📡'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{channel.nome}</h3>
                    <p className="text-sm text-gray-500">{type?.nome || channel.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {statusIcon(channel.status)}
                  <span className="text-xs text-gray-500 capitalize">{channel.status}</span>
                </div>
              </div>

              {channel.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Phone size={14} /> {channel.telefone}
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => toggleStatus(channel)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    channel.status === 'connected'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {channel.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
                <button onClick={() => openEdit(channel)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Settings2 size={16} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete(channel.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal: Escolher Tipo de Canal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#161b22] rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Wifi size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Canal</h2>
                    <p className="text-sm text-gray-500">Escolha o tipo de canal que deseja conectar</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {channelTypes.map(type => (
                  <button
                    key={type.tipo}
                    disabled={type.disabled}
                    onClick={() => {
                      setSelectedType(type)
                      setShowAddModal(false)
                      setShowConfigModal(true)
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      type.disabled
                        ? 'border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{type.nome}</h3>
                      <p className="text-sm text-gray-500">{type.descricao}</p>
                    </div>
                    {!type.disabled && <span className="text-gray-400">›</span>}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  🔒 Conexão segura e criptografada
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Configurar Canal */}
      <AnimatePresence>
        {showConfigModal && selectedType && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowConfigModal(false); setSelectedType(null); setEditingChannel(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#161b22] rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingChannel ? 'Editar' : 'Configurar'} {selectedType.nome}
                  </h2>
                  <p className="text-sm text-gray-500">Preencha as credenciais de conexão</p>
                </div>
                <button onClick={() => { setShowConfigModal(false); setSelectedType(null); setEditingChannel(null) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Canal</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder={`Ex: ${selectedType.nome} Principal`}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="5511999999999"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {selectedType.fields?.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={formData.credentials[field.key] || ''}
                      onChange={e => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, [field.key]: e.target.value }
                      })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}

                {/* Webhook URL info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">URL do Webhook (configure no painel do provedor):</p>
                  <code className="text-xs text-blue-800 dark:text-blue-300 break-all">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver
                  </code>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => { setShowConfigModal(false); setSelectedType(null); setEditingChannel(null) }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {editingChannel ? 'Salvar Alterações' : 'Criar Canal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
