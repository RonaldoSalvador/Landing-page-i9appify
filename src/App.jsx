import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import LGPDBanner from './components/LGPDBanner'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import LeadForm from './pages/LeadForm'
import Formulario from './pages/Formulario'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import CRMLayout from './pages/crm/CRMLayout'
import Dashboard from './pages/crm/Dashboard'
import Leads from './pages/crm/Leads'
import Visitors from './pages/crm/Visitors'
import Settings from './pages/crm/Settings'
import Pipeline from './pages/crm/Pipeline'
import Atendimentos from './pages/crm/Atendimentos'
import Agents from './pages/crm/Agents'
import AgentTeam from './pages/crm/AgentTeam'
import Channels from './pages/crm/Channels'
import Campaigns from './pages/crm/Campaigns'
import Team from './pages/crm/Team'
import StoragePage from './pages/crm/StoragePage'
import Squads from './pages/crm/Squads'
import Calendar from './pages/crm/Calendar'
import Templates from './pages/crm/Templates'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/form/:tipo" element={<LeadForm />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Protected CRM Routes */}
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CRMLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="atendimentos" element={<Atendimentos />} />
            <Route path="canais" element={<Channels />} />
            <Route path="agentes" element={<Agents />} />
            <Route path="time" element={<AgentTeam />} />
            <Route path="disparos" element={<Campaigns />} />
            <Route path="atendentes" element={<Team />} />
            <Route path="storage" element={<StoragePage />} />
            <Route path="leads" element={<Leads />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="settings" element={<Settings />} />
            <Route path="squads" element={<Squads />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="templates" element={<Templates />} />
          </Route>
        </Routes>
        <LGPDBanner />
      </BrowserRouter>
    </AuthProvider>
  )
}
