import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

export default function CRMLayout() {
    return (
        <div className="min-h-screen bg-[#050505] flex">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}
