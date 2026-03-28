import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Tickets from '../pages/Tickets'
import TicketDetalle from '../pages/TicketDetalle'
import NuevoTicket from '../pages/NuevoTicket'
import Usuarios from '../pages/admin/Usuarios'
import Reportes from '../pages/admin/Reportes'

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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/tickets" element={<RequireAuth><Tickets /></RequireAuth>} />
        <Route path="/tickets/nuevo" element={<RequireAuth><NuevoTicket /></RequireAuth>} />
        <Route path="/tickets/:id" element={<RequireAuth><TicketDetalle /></RequireAuth>} />
        <Route path="/admin/usuarios" element={<RequireAdmin><Usuarios /></RequireAdmin>} />
        <Route path="/admin/reportes" element={<RequireAdmin><Reportes /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
