import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  HardDrive, Plus, X, Upload, Music, Video, Image, FileText,
  Trash2, Loader2, Copy, CheckCircle, ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const mediaTypes = [
  { tipo: 'audio', label: 'Áudio', icon: Music, extensions: 'MP3, OGG', color: 'bg-purple-500' },
  { tipo: 'video', label: 'Vídeo', icon: Video, extensions: 'MP4', color: 'bg-red-500' },
  { tipo: 'imagem', label: 'Imagem', icon: Image, extensions: 'JPG, PNG, WEBP', color: 'bg-blue-500' },
  { tipo: 'documento', label: 'Documento', icon: FileText, extensions: 'PDF, Office', color: 'bg-emerald-500' },
]

export default function StoragePage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({ nome: '', file: null })
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    const { data } = await supabase
      .from('storage_files')
      .select('*')
      .order('created_at', { ascending: false })
    setFiles(data || [])
    setLoading(false)
  }

  async function handleUpload() {
    if (!formData.nome || !formData.file) return
    setUploading(true)

    const file = formData.file
    const ext = file.name.split('.').pop()
    const path = `storage/${Date.now()}_${file.name}`

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('i9appify')
      .upload(path, file)

    if (uploadError) {
      alert('Erro no upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('i9appify').getPublicUrl(path)

    // Salvar referência no banco
    await supabase.from('storage_files').insert({
      org_id: 1,
      nome: formData.nome,
      tipo_midia: selectedType,
      mime_type: file.type,
      file_url: publicUrl,
      file_size_bytes: file.size,
    })

    setUploading(false)
    setShowUploadModal(false)
    setFormData({ nome: '', file: null })
    setSelectedType(null)
    fetchFiles()
  }

  async function handleDelete(id, url) {
    if (!confirm('Remover este arquivo?')) return
    await supabase.from('storage_files').delete().eq('id', id)
    fetchFiles()
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(`[legenda](${url})`)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  function formatSize(bytes) {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const iconForType = (tipo) => {
    const config = mediaTypes.find(m => m.tipo === tipo)
    return config || mediaTypes[3]
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <HardDrive size={28} className="text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Storage</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Anexe arquivos (áudio, vídeo, imagem e documento) para o Agente de IA enviar na conversa.
            Forneça o link gerado no prompt do Agente e instrua o modelo a enviar no formato markdown: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">[legenda](URL)</code>
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
        >
          <Upload size={18} /> Adicionar Arquivo
        </button>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">URL</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-16">
                  <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-gray-500">Nenhum arquivo encontrado.</td>
              </tr>
            ) : (
              files.map((file, i) => {
                const config = iconForType(file.tipo_midia)
                const TypeIcon = config.icon
                return (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                        <TypeIcon size={16} className="text-white" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.nome}</p>
                        <p className="text-xs text-gray-500">{formatSize(file.file_size_bytes)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <code className="text-xs text-gray-500 truncate">{file.file_url}</code>
                        <button
                          onClick={() => copyUrl(file.file_url)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Copiar markdown"
                        >
                          {copied === file.file_url ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                        </button>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(file.id, file.file_url)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#161b22] rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Upload size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload de Arquivo</h2>
                    <p className="text-sm text-gray-500">Adicione novos arquivos ao storage do cliente</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Arquivo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Contrato assinado, Áudio de boas vindas..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Mídia *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mediaTypes.map(mt => {
                      const Icon = mt.icon
                      return (
                        <button
                          key={mt.tipo}
                          onClick={() => setSelectedType(mt.tipo)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            selectedType === mt.tipo
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon size={18} className={selectedType === mt.tipo ? 'text-emerald-500' : 'text-gray-400'} />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{mt.label}</p>
                            <p className="text-xs text-gray-500">{mt.extensions}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo</label>
                  <input
                    type="file"
                    onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!formData.nome || !selectedType || !formData.file || uploading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Salvar Arquivo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
