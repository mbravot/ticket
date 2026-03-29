import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'
import { getMe } from '../api/auth.api'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Tickets from '../pages/Tickets'
import TicketDetalle from '../pages/TicketDetalle'
import NuevoTicket from '../pages/NuevoTicket'
import Usuarios from '../pages/admin/Usuarios'
import Reportes from '../pages/admin/Reportes'
import Catalogos from '../pages/admin/Catalogos'

function AuthInit({ children }) {
  const { token, initialized, setUser, setInitialized, logout } = useAuthStore()

  useEffect(() => {
    if (!token) { setInitialized(); return }
    getMe()
      .then((data) => { if (data.ok) setUser(data.user); else logout() })
      .catch(() => logout())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    )
  }

  return children
}

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/nuevo" element={<NuevoTicket />} />
            <Route path="/tickets/:id" element={<TicketDetalle />} />
            <Route path="/admin/usuarios" element={<RequireAdmin><Usuarios /></RequireAdmin>} />
            <Route path="/admin/reportes" element={<RequireAdmin><Reportes /></RequireAdmin>} />
            <Route path="/admin/catalogos" element={<RequireAdmin><Catalogos /></RequireAdmin>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInit>
    </BrowserRouter>
  )
}
