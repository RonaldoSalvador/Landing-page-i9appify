import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, Users, LogOut, Menu, X, Eye, CalendarDays, Settings, MessageSquare } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { path: '/crm', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/crm/leads', icon: Users, label: 'Leads' },
    { path: '/crm/visitors', icon: Eye, label: 'Visitantes' },
    { path: '/crm/calendar', icon: CalendarDays, label: 'Agenda' },
    { path: '/crm/templates', icon: MessageSquare, label: 'Templates' },
    { path: '/crm/settings', icon: Settings, label: 'Configurações' }
]

export default function Sidebar() {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <img
                    src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
                    alt="I9 Appify"
                    className="h-12"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col transform transition-transform lg:transform-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <NavContent />
            </aside>
        </>
    )
}
