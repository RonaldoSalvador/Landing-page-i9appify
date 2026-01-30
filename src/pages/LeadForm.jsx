import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { trackPageView, getVisitorIdForForm } from '../lib/tracking'
import { User, Mail, Phone, Building, FileText, DollarSign, CheckCircle, Loader2, ArrowLeft, Smartphone, Globe, Bot } from 'lucide-react'

const serviceTypes = {
    app: { title: 'Criação de App', icon: Smartphone, color: 'pink' },
    site: { title: 'Site / Landing Page', icon: Globe, color: 'purple' },
    automacao: { title: 'Automação com IA', icon: Bot, color: 'cyan' }
}

const orcamentoOptions = [
    'Até R$ 500',
    'R$ 500 - R$ 1.000',
    'R$ 1.000 - R$ 3.000',
    'R$ 3.000 - R$ 5.000',
    'Acima de R$ 5.000'
]

export default function LeadForm() {
    const { tipo } = useParams()
    const navigate = useNavigate()
    const service = serviceTypes[tipo] || serviceTypes.app

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
        empresa: '',
        descricao: '',
        orcamento: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Track pageview
    useEffect(() => {
        trackPageView(`/form/${tipo}`)
    }, [tipo])

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const visitorId = getVisitorIdForForm()
            const { error: insertError } = await supabase
                .from('leads')
                .insert({
                    ...formData,
                    tipo_servico: tipo,
                    origem: 'site',
                    status: 'novo',
                    visitor_id: visitorId
                })

            if (insertError) throw insertError
            setSuccess(true)
        } catch (err) {
            console.error(err)
            setError('Erro ao enviar. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const colorMap = {
        cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/50', text: 'text-pink-400' }
    }
    const theme = colorMap[service.color] || colorMap.cyan

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Recebemos sua solicitação!</h1>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Entraremos em contato em breve pelo WhatsApp ou email informado.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded-xl font-medium hover:bg-cyan-500/20 transition-colors"
                    >
                        Voltar para o site
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] py-12 px-4">
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className={`w-16 h-16 ${theme.bg} ${theme.border} border rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <service.icon className={theme.text} size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{service.title}</h1>
                    <p className="text-gray-400">Preencha o formulário e entraremos em contato</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    {error && (
                        <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-6">
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp *</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="(31) 99999-9999"
                                />
                            </div>
                        </div>

                        {/* Empresa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    name="empresa"
                                    value={formData.empresa}
                                    onChange={handleChange}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="Nome da empresa"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Orçamento */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Orçamento estimado</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                name="orcamento"
                                value={formData.orcamento}
                                onChange={handleChange}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
                            >
                                <option value="">Selecione...</option>
                                {orcamentoOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descreva seu projeto</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-gray-500" size={18} />
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                                placeholder="Conte-nos mais sobre o que você precisa..."
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-8 py-4 ${theme.bg} ${theme.text} ${theme.border} border rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Enviando...
                            </>
                        ) : (
                            'Enviar Solicitação'
                        )}
                    </button>
                </motion.form>
            </div>
        </div>
    )
}
