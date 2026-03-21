import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  UsersRound, Plus, X, Mail, Shield, ShieldCheck, Eye, UserPlus,
  CheckCircle, Loader2, Crown, Circle, Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const roleConfig = {
  owner: { label: 'Proprietário', color: 'text-yellow-500', icon: Crown, bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  admin: { label: 'Administrador', color: 'text-blue-500', icon: ShieldCheck, bg: 'bg-blue-100 dark:bg-blue-900/20' },
  agent: { label: 'Atendente', color: 'text-emerald-500', icon: Shield, bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  viewer: { label: 'Visualizador', color: 'text-gray-500', icon: Eye, bg: 'bg-gray-100 dark:bg-gray-800' },
}

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    const { data } = await supabase
      .from('org_members')
      .select('*')
      .order('created_at', { ascending: true })
    setMembers(data || [])
    setLoading(false)
  }

  async function handleInvite() {
    if (!email) return
    setSaving(true)

    // Nota: o atendente deve primeiro criar conta no sistema
    const { error } = await supabase.from('org_members').insert({
      org_id: 1, // TODO: usar org do contexto
      email,
      role: 'agent',
      nome: email.split('@')[0],
    })

    if (error) {
      alert(error.message)
    } else {
      setEmail('')
      setShowAddModal(false)
      fetchMembers()
    }
    setSaving(false)
  }

  async function handleRemove(id) {
    if (!confirm('Remover este atendente?')) return
    await supabase.from('org_members').delete().eq('id', id)
    fetchMembers()
  }

  async function handleRoleChange(id, newRole) {
    await supabase.from('org_members').update({ role: newRole }).eq('id', id)
    fetchMembers()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <UsersRound size={28} className="text-purple-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Atendentes</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os usuários com acesso a este cliente</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
        >
          <UserPlus size={18} /> Convidar Atendente
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-purple-400 dark:hover:border-purple-500 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
            <Plus size={24} className="text-gray-400 group-hover:text-purple-500" />
          </div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Convidar Atendente</span>
        </motion.button>

        {/* Member Cards */}
        {members.map((member, i) => {
          const role = roleConfig[member.role] || roleConfig.agent
          const RoleIcon = role.icon
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {(member.nome || member.email || '?')[0].toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#161b22] ${
                      member.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.nome || 'Sem nome'}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${role.bg} ${role.color}`}>
                  <RoleIcon size={12} /> {role.label}
                </span>

                {member.role !== 'owner' && (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value)}
                      className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400"
                    >
                      <option value="admin">Admin</option>
                      <option value="agent">Atendente</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-400 text-xs"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal: Adicionar Atendente */}
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
              className="bg-white dark:bg-[#161b22] rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <UserPlus size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Atendente</h2>
                    <p className="text-sm text-gray-500">Convide um novo usuário para este cliente</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Importante:</strong><br />
                    O atendente deve primeiro criar uma conta no sistema.<br />
                    Depois de criada a conta, cadastre o e-mail do atendente abaixo.
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail do Atendente</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">
                  Cancelar
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!email || saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Adicionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
