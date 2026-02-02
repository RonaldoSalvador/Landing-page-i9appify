import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, Calendar, Users, Zap } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function WelcomeScreen({ onComplete }) {
    const [stats, setStats] = useState({ novosHoje: 0, reunioesHoje: 0, totalLeads: 0 })
    const [show, setShow] = useState(true)

    useEffect(() => {
        fetchQuickStats()

        // Auto-dismiss after 4 seconds
        const timer = setTimeout(() => {
            setShow(false)
            setTimeout(onComplete, 500) // Wait for exit animation
        }, 4000)

        return () => clearTimeout(timer)
    }, [onComplete])

    const fetchQuickStats = async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: leads } = await supabase
            .from('leads')
            .select('id, created_at')

        const { data: reunioes } = await supabase
            .from('reunioes')
            .select('id, data_hora')
            .gte('data_hora', today.toISOString())
            .lt('data_hora', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

        const novosHoje = leads?.filter(l => new Date(l.created_at) >= today).length || 0

        setStats({
            novosHoje,
            reunioesHoje: reunioes?.length || 0,
            totalLeads: leads?.length || 0
        })
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Bom dia'
        if (hour < 18) return 'Boa tarde'
        return 'Boa noite'
    }

    const getEmoji = () => {
        const hour = new Date().getHours()
        if (hour < 12) return '☀️'
        if (hour < 18) return '🌤️'
        return '🌙'
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                    onClick={() => {
                        setShow(false)
                        onComplete()
                    }}
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-emerald-500/30 rounded-full"
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight,
                                    scale: 0
                                }}
                                animate={{
                                    y: [null, -100],
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                    ease: 'easeOut'
                                }}
                            />
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 text-center px-6 max-w-lg">
                        {/* Greeting */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <motion.span
                                className="text-6xl"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {getEmoji()}
                            </motion.span>
                            <h1 className="text-4xl font-bold text-white mt-4">
                                {getGreeting()}!
                            </h1>
                            <p className="text-gray-400 mt-2">
                                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </p>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                                    <Users className="text-emerald-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.novosHoje}</p>
                                <p className="text-xs text-gray-400">Novos hoje</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                                    <Calendar className="text-blue-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.reunioesHoje}</p>
                                <p className="text-xs text-gray-400">Reuniões</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                                    <TrendingUp className="text-amber-400" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalLeads}</p>
                                <p className="text-xs text-gray-400">Total leads</p>
                            </motion.div>
                        </motion.div>

                        {/* Loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-8 flex items-center justify-center gap-2 text-gray-500"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                                <Sparkles size={16} />
                            </motion.div>
                            <span className="text-sm">Carregando seu dashboard...</span>
                        </motion.div>

                        {/* Skip hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="mt-6 text-xs text-gray-600"
                        >
                            Clique em qualquer lugar para pular
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
