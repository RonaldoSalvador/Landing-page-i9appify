import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { ToastProvider } from '../../contexts/ToastContext'
import WelcomeScreen from '../../components/WelcomeScreen'

export default function CRMLayout() {
    const [showWelcome, setShowWelcome] = useState(false)

    useEffect(() => {
        // Show welcome screen only once per session
        const hasSeenWelcome = sessionStorage.getItem('crm-welcome-seen')
        if (!hasSeenWelcome) {
            setShowWelcome(true)
        }
    }, [])

    const handleWelcomeComplete = () => {
        setShowWelcome(false)
        sessionStorage.setItem('crm-welcome-seen', 'true')
    }

    return (
        <ThemeProvider>
            <ToastProvider>
                {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}

                <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex transition-colors duration-300">
                    <Sidebar />
                    <main className="flex-1 p-6 lg:p-8 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </ToastProvider>
        </ThemeProvider>
    )
}
