import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
  '/tickets/nuevo': 'Nuevo Ticket',
  '/admin/usuarios': 'Usuarios',
  '/admin/reportes': 'Reportes',
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()

  const title =
    titles[pathname] ??
    (pathname.startsWith('/tickets/') ? 'Detalle del Ticket' : 'Panel')

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
    </header>
  )
}
