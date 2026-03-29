import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import useAuthStore from '../../store/auth.store'
import useThemeStore from '../../store/theme.store'
import { changePassword } from '../../api/usuario.api'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const IconTickets = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const IconChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const IconCatalogos = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
const linkInactive = 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
const linkActive = 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'

export default function Sidebar({ onClose }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const rol = user?.rol
  const { dark, toggle } = useThemeStore()

  const [pwModal, setPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ password_actual: '', password_nuevo: '', confirmar: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const mutPw = useMutation({
    mutationFn: (body) => changePassword(user.id_usuario, body),
    onSuccess: (data) => {
      if (data.ok === false) { setPwError(data.message ?? 'Error al cambiar contraseña'); return }
      setPwSuccess(true)
      setPwForm({ password_actual: '', password_nuevo: '', confirmar: '' })
      setPwError('')
    },
    onError: (err) => setPwError(err.response?.data?.message ?? 'Error al conectar con el servidor'),
  })

  const handlePwSubmit = (e) => {
    e.preventDefault()
    if (pwForm.password_nuevo.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres'); return }
    if (pwForm.password_nuevo !== pwForm.confirmar) { setPwError('Las contraseñas no coinciden'); return }
    setPwError('')
    mutPw.mutate({ password_actual: pwForm.password_actual, password_nuevo: pwForm.password_nuevo })
  }

  const navLink = ({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">Tickets</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavLink to="/" end className={navLink} onClick={onClose}>
          <IconDashboard /> Dashboard
        </NavLink>

        <NavLink to="/tickets" className={navLink} onClick={onClose}>
          <IconTickets /> Tickets
        </NavLink>

        <NavLink to="/tickets/nuevo" className={navLink} onClick={onClose}>
          <IconPlus /> Nuevo Ticket
        </NavLink>

        {rol === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Administración</p>
            </div>
            <NavLink to="/admin/usuarios" className={navLink} onClick={onClose}>
              <IconUsers /> Usuarios
            </NavLink>
            <NavLink to="/admin/catalogos" className={navLink} onClick={onClose}>
              <IconCatalogos /> Catálogos
            </NavLink>
            <NavLink to="/admin/reportes" className={navLink} onClick={onClose}>
              <IconChart /> Reportes
            </NavLink>
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.nombre?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.nombre} {user?.apellido}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.rol}</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`${linkBase} ${linkInactive} w-full cursor-pointer`}
        >
          {dark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {dark ? 'Modo claro' : 'Modo oscuro'}
        </button>
        <button
          onClick={() => { setPwForm({ password_actual: '', password_nuevo: '', confirmar: '' }); setPwError(''); setPwSuccess(false); setPwModal(true) }}
          className={`${linkBase} ${linkInactive} w-full cursor-pointer`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Cambiar contraseña
        </button>
        <button
          onClick={() => { if (window.confirm('¿Cerrar sesión?')) logout() }}
          className={`${linkBase} ${linkInactive} w-full cursor-pointer`}
        >
          <IconLogout /> Cerrar sesión
        </button>
      </div>

      <Modal open={pwModal} onClose={() => { setPwModal(false); setPwSuccess(false) }} title="Cambiar contraseña">
        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={pwForm.password_actual}
              onChange={(e) => setPwForm((p) => ({ ...p, password_actual: e.target.value }))}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={pwForm.password_nuevo}
              onChange={(e) => setPwForm((p) => ({ ...p, password_nuevo: e.target.value }))}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={pwForm.confirmar}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmar: e.target.value }))}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {pwError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-3.5 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-3.5 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contraseña actualizada correctamente.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setPwModal(false)} className="flex-1 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 rounded-lg transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={mutPw.isPending} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
              {mutPw.isPending ? <Spinner size="sm" /> : null}
              {mutPw.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </aside>
  )
}
