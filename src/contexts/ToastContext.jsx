import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext()

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
}

const colors = {
    success: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-500',
        bar: 'bg-emerald-500'
    },
    error: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/30',
        icon: 'text-red-500',
        bar: 'bg-red-500'
    },
    warning: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        border: 'border-amber-500/30',
        icon: 'text-amber-500',
        bar: 'bg-amber-500'
    },
    info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-500',
        bar: 'bg-blue-500'
    }
}

function Toast({ id, message, type = 'success', duration = 4000, onClose }) {
    const Icon = icons[type]
    const color = colors[type]

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative overflow-hidden min-w-[300px] max-w-[400px] ${color.bg} border ${color.border} rounded-xl shadow-2xl backdrop-blur-sm`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className={`flex-shrink-0 ${color.icon}`}>
                    <Icon size={22} />
                </div>
                <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                    {message}
                </p>
                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress bar */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${color.bar}`}
                onAnimationComplete={() => onClose(id)}
            />
        </motion.div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type, duration }])
        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <Toast
                            key={t.id}
                            {...t}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
