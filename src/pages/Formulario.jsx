import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Smartphone,
    Globe,
    Bot,
    Send,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Calendar
} from 'lucide-react'

const servicos = [
    {
        id: 'app',
        icon: Smartphone,
        label: 'Aplicativo Mobile',
        desc: 'iOS e Android personalizados'
    },
    {
        id: 'site',
        icon: Globe,
        label: 'Site ou Landing Page',
        desc: 'Institucional ou de conversão'
    },
    {
        id: 'automacao',
        icon: Bot,
        label: 'Automação com IA',
        desc: 'WhatsApp, Chatbots, Workflows'
    }
]

export default function Formulario() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
        empresa: '',
        tipo_servico: '',
        descricao: '',
        tem_reuniao: false,
        origem: 'formulario'
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const selectService = (id) => {
        setFormData(prev => ({ ...prev, tipo_servico: id }))
        setStep(2)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('leads')
                .insert([formData])

            if (error) throw error
            setSuccess(true)
        } catch (error) {
            console.error('Erro ao enviar:', error)
            alert('Erro ao enviar. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-full flex items-center justify-center border border-emerald-500/30"
                    >
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white mb-4">
                        Recebido com sucesso!
                    </h1>
                    <p className="text-gray-400 mb-8 text-lg">
                        O Ronaldo vai analisar seu projeto e entrar em contato em breve.
                    </p>

                    <div className="space-y-4">
                        <a
                            href="https://wa.me/5531993988889"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl font-semibold hover:bg-emerald-500/20 transition-all"
                        >
                            <Send size={20} />
                            Chamar no WhatsApp
                        </a>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-gray-300 border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition-all"
                        >
                            Voltar ao site
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
                            alt="I9 Appify"
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-cyan-400' : 'bg-white/20'}`} />
                        <div className={`w-8 h-0.5 transition-colors ${step >= 2 ? 'bg-cyan-400' : 'bg-white/20'}`} />
                        <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-cyan-400' : 'bg-white/20'}`} />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
                                    Passo 1 de 2
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                O que você precisa?
                            </h1>
                            <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto">
                                Selecione o tipo de projeto e conte mais sobre sua ideia.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6">
                                {servicos.map((servico) => {
                                    const Icon = servico.icon
                                    const isSelected = formData.tipo_servico === servico.id

                                    return (
                                        <motion.button
                                            key={servico.id}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => selectService(servico.id)}
                                            className={`group relative p-8 rounded-3xl border text-left transition-all duration-300 ${isSelected
                                                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]'
                                                    : 'bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isSelected
                                                    ? 'bg-cyan-500/20'
                                                    : 'bg-white/5 group-hover:bg-cyan-500/10'
                                                }`}>
                                                <Icon className={`w-7 h-7 transition-colors ${isSelected ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                                                    }`} />
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {servico.label}
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                {servico.desc}
                                            </p>

                                            <ArrowRight className={`absolute top-8 right-8 w-5 h-5 transition-all ${isSelected
                                                    ? 'text-cyan-400 opacity-100'
                                                    : 'text-gray-600 opacity-0 group-hover:opacity-100'
                                                }`} />
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Form */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-500 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                            >
                                ← Voltar
                            </button>

                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-cyan-400" />
                                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
                                    Passo 2 de 2
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-4">
                                Conta mais sobre o projeto
                            </h1>
                            <p className="text-gray-400 text-lg mb-10">
                                Preencha seus dados e descreva sua ideia.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Nome */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Seu nome *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            required
                                            placeholder="Como quer ser chamado?"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        />
                                    </div>

                                    {/* Empresa */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome da empresa
                                        </label>
                                        <input
                                            type="text"
                                            name="empresa"
                                            value={formData.empresa}
                                            onChange={handleChange}
                                            placeholder="Sua empresa ou negócio"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            E-mail *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="seu@email.com"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        />
                                    </div>

                                    {/* WhatsApp */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            required
                                            placeholder="(00) 00000-0000"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Descreva seu projeto *
                                    </label>
                                    <textarea
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        placeholder="Qual problema você quer resolver? O que você imagina pro projeto?"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                                    />
                                </div>

                                {/* Reunião */}
                                <label className="flex items-center gap-3 p-5 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/30 transition-all">
                                    <input
                                        type="checkbox"
                                        name="tem_reuniao"
                                        checked={formData.tem_reuniao}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500/20"
                                    />
                                    <div>
                                        <span className="text-white font-medium">Já tenho reunião agendada</span>
                                        <p className="text-gray-500 text-sm">Marque se você já agendou pelo WhatsApp</p>
                                    </div>
                                </label>

                                {/* Submit */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-lg rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Enviar projeto
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-center text-gray-600 text-sm">
                                    Seus dados estão seguros. Não compartilhamos com terceiros.
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
