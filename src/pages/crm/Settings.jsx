import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Bell, Webhook, Save, Check, AlertCircle, Eye, EyeOff, Send } from 'lucide-react'

export default function Settings() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Password change
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [showPasswords, setShowPasswords] = useState(false)

    // Notifications
    const [notifications, setNotifications] = useState({
        telegram_enabled: false,
        telegram_chat_id: '',
        webhook_enabled: false,
        webhook_url: ''
    })

    // Test notification
    const [testLoading, setTestLoading] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const { data } = await supabase
            .from('configuracoes')
            .select('*')
            .single()

        if (data) {
            setNotifications({
                telegram_enabled: data.telegram_enabled || false,
                telegram_chat_id: data.telegram_chat_id || '',
                webhook_enabled: data.webhook_enabled || false,
                webhook_url: data.webhook_url || ''
            })
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (passwords.new !== passwords.confirm) {
            setError('As senhas não coincidem')
            setLoading(false)
            return
        }

        if (passwords.new.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            })

            if (error) throw error
            setSuccess('Senha alterada com sucesso!')
            setPasswords({ current: '', new: '', confirm: '' })
        } catch (err) {
            setError(err.message || 'Erro ao alterar senha')
        } finally {
            setLoading(false)
        }
    }

    const handleNotificationSave = async () => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const { error } = await supabase
                .from('configuracoes')
                .upsert({
                    id: 1, // Single config row
                    ...notifications,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setSuccess('Configurações salvas!')
        } catch (err) {
            setError(err.message || 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    const testWebhook = async () => {
        if (!notifications.webhook_url) return
        setTestLoading(true)

        try {
            const response = await fetch(notifications.webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'test',
                    message: 'Teste de webhook do CRM i9 Appify',
                    timestamp: new Date().toISOString()
                })
            })

            if (response.ok) {
                setSuccess('Webhook testado com sucesso!')
            } else {
                setError('Erro no webhook: ' + response.status)
            }
        } catch (err) {
            setError('Erro ao testar webhook: ' + err.message)
        } finally {
            setTestLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400 mt-1">Gerencie sua conta e notificações</p>
            </div>

            {/* Alerts */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400"
                >
                    <Check size={20} />
                    <span>{success}</span>
                </motion.div>
            )}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Account Info */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                        <User className="text-cyan-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Conta</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-white">
                            <Mail size={18} className="text-gray-500" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <form onSubmit={handlePasswordChange} className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Lock className="text-purple-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Alterar Senha</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-purple-500/50"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirmar Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !passwords.new || !passwords.confirm}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? 'Salvando...' : 'Alterar Senha'}
                    </button>
                </div>
            </form>

            {/* Notifications */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Bell className="text-yellow-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Notificações</h2>
                </div>

                <div className="space-y-6">
                    {/* Telegram */}
                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Send className="text-blue-400" size={16} />
                                </div>
                                <span className="font-medium text-white">Telegram</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.telegram_enabled}
                                    onChange={(e) => setNotifications({ ...notifications, telegram_enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                        </div>
                        {notifications.telegram_enabled && (
                            <input
                                type="text"
                                value={notifications.telegram_chat_id}
                                onChange={(e) => setNotifications({ ...notifications, telegram_chat_id: e.target.value })}
                                placeholder="Chat ID do Telegram"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm"
                            />
                        )}
                    </div>

                    {/* Webhook */}
                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Webhook className="text-orange-400" size={16} />
                                </div>
                                <span className="font-medium text-white">Webhook (n8n, Zapier, etc)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.webhook_enabled}
                                    onChange={(e) => setNotifications({ ...notifications, webhook_enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                        {notifications.webhook_enabled && (
                            <div className="space-y-3">
                                <input
                                    type="url"
                                    value={notifications.webhook_url}
                                    onChange={(e) => setNotifications({ ...notifications, webhook_url: e.target.value })}
                                    placeholder="https://seu-webhook.com/endpoint"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={testWebhook}
                                    disabled={!notifications.webhook_url || testLoading}
                                    className="text-sm text-orange-400 hover:text-orange-300 disabled:opacity-50"
                                >
                                    {testLoading ? 'Testando...' : 'Testar webhook'}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleNotificationSave}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-medium hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? 'Salvando...' : 'Salvar Notificações'}
                    </button>
                </div>
            </div>

            {/* API Info */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Webhook className="text-green-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">API / Webhook</h2>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl p-4 overflow-x-auto">
                    <p className="text-gray-400 text-sm mb-2">Endpoint para criar leads:</p>
                    <code className="text-green-400 text-sm break-all">
                        POST https://ldqjunoqeepcdctheidd.supabase.co/rest/v1/leads
                    </code>
                    <p className="text-gray-500 text-xs mt-3">
                        Veja a documentação completa em <code className="text-cyan-400">src/lib/api-webhook.js</code>
                    </p>
                </div>
            </div>
        </div>
    )
}
