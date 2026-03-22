import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    Eye,
    Settings,
    Kanban,
    Sun,
    Moon,
    Sparkles,
    Bot,
    MessageSquare,
    Wifi,
    Send,
    UsersRound,
    HardDrive,
    Cpu,
    Building2,
    CalendarDays,
    FileText
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
    { path: '/crm', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/crm/atendimentos', icon: MessageSquare, label: 'Bate papo' },
    { path: '/crm/canais', icon: Wifi, label: 'Canais' },
    { path: '/crm/agentes', icon: Bot, label: 'Agentes' },
    { path: '/crm/time', icon: Cpu, label: 'Time de Agentes' },
    { path: '/crm/disparos', icon: Send, label: 'Disparos' },
    { path: '/crm/atendentes', icon: UsersRound, label: 'Atendentes' },
    { path: '/crm/storage', icon: HardDrive, label: 'Storage' },
    { path: '/crm/leads', icon: Users, label: 'Leads' },
    { path: '/crm/pipeline', icon: Kanban, label: 'Pipeline' },
    { path: '/crm/visitors', icon: Eye, label: 'Visitantes' },
    { path: '/crm/squads', icon: Building2, label: 'Squads' },
    { path: '/crm/calendar', icon: CalendarDays, label: 'Calendário' },
    { path: '/crm/templates', icon: FileText, label: 'Templates' },
    { path: '/crm/settings', icon: Settings, label: 'Configurações' }
]

// Premium Theme Toggle Component
function ThemeToggle({ theme, toggleTheme }) {
    return (
        <button
            onClick={toggleTheme}
            className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden group"
        >
            {/* Animated Background */}
            <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                        : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)'
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Stars/Sparkles for dark mode */}
            <AnimatePresence>
                {theme === 'dark' && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Icon Container */}
            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ y: 30, rotate: -45, opacity: 0 }}
                            animate={{ y: 0, rotate: 0, opacity: 1 }}
                            exit={{ y: -30, rotate: 45, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                            }}
                            className="absolute"
                        >
                            <Moon size={22} className="text-yellow-300 drop-shadow-lg" fill="#fde047" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ y: -30, rotate: 45, opacity: 0 }}
                            animate={{ y: 0, rotate: 0, opacity: 1 }}
                            exit={{ y: 30, rotate: -45, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                            }}
                            className="absolute"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                                <Sun size={24} className="text-orange-500 drop-shadow-lg" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Label */}
            <div className="relative z-10 flex flex-col items-start">
                <motion.span
                    className="font-semibold text-sm"
                    animate={{ color: theme === 'dark' ? '#fff' : '#1a1a2e' }}
                >
                    {theme === 'dark' ? 'Modo Noturno' : 'Modo Diurno'}
                </motion.span>
                <motion.span
                    className="text-xs opacity-70"
                    animate={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}
                >
                    Clique para trocar
                </motion.span>
            </div>

            {/* Switch Toggle */}
            <div className="relative z-10 ml-auto w-12 h-6 rounded-full bg-black/20 p-0.5">
                <motion.div
                    className="w-5 h-5 rounded-full shadow-lg"
                    animate={{
                        x: theme === 'dark' ? 0 : 24,
                        backgroundColor: theme === 'dark' ? '#fde047' : '#fb923c'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
            </div>
        </button>
    )
}

export default function Sidebar() {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
                <img
                    src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
                    alt="I9 Appify"
                    className="h-12"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <NavLink
                            to={item.path}
                            end={item.end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-l-4 border-emerald-500'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white shadow-lg"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-white/5 flex flex-col transform transition-transform lg:transform-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <NavContent />
            </aside>
        </>
    )
}
