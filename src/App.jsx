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
            <Route path="leads" element={<Leads />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="templates" element={<Templates />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <LGPDBanner />
      </BrowserRouter>
    </AuthProvider>
  )
}

