import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X } from 'lucide-react'

export default function LGPDBanner() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('i9_lgpd_consent')
        if (!consent) {
            // Mostrar após 1 segundo
            const timer = setTimeout(() => setShowBanner(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('i9_lgpd_consent', 'accepted')
        setShowBanner(false)
    }

    const handleReject = () => {
        localStorage.setItem('i9_lgpd_consent', 'rejected')
        setShowBanner(false)
    }

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
                >
                    <div className="max-w-4xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="text-cyan-400" size={24} />
                            </div>

                            <div className="flex-1">
                                <p className="text-white font-medium mb-1">🍪 Utilizamos cookies</p>
                                <p className="text-gray-400 text-sm">
                                    Este site utiliza cookies para melhorar sua experiência e analisar o tráfego.
                                    Ao continuar navegando, você concorda com nossa{' '}
                                    <a href="#" className="text-cyan-400 hover:underline">Política de Privacidade</a>.
                                </p>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleReject}
                                    className="flex-1 md:flex-none px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm font-medium"
                                >
                                    Recusar
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors text-sm font-medium"
                                >
                                    Aceitar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
