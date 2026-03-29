import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import { useEstados } from '../hooks/useCatalogos'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import useAuthStore from '../store/auth.store'

function StatCard({ label, count, color }) {
  const bg = color ? color + '15' : '#F3F4F6'
  const border = color ? color + '40' : '#E5E7EB'
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-2"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <span className="text-sm font-medium" style={{ color: color ?? '#6B7280' }}>{label}</span>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{count}</span>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: tickets, isLoading: loadingTickets } = useTickets({ limite: 200 })
  const { data: estados, isLoading: loadingEstados } = useEstados()

  const ticketList = useMemo(() => {
    if (!tickets) return []
    return Array.isArray(tickets) ? tickets : (tickets.tickets ?? [])
  }, [tickets])

  const statsByEstado = useMemo(() => {
    const counts = {}
    ticketList.forEach((t) => {
      const key = t.estado
      if (!counts[key]) counts[key] = { count: 0, color: t.estado_color }
      counts[key].count++
    })
    return counts
  }, [ticketList])

  const recientes = useMemo(() => ticketList.slice(0, 8), [ticketList])

  if (loadingTickets || loadingEstados) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Saludo */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Hola, {user?.nombre} 👋
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Resumen del sistema de tickets</p>
      </div>

      {/* Stats por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total" count={ticketList.length} color="#3B82F6" />
        {estados?.map((e) => (
          <StatCard
            key={e.id_estado ?? e.nombre}
            label={e.nombre}
            count={statsByEstado[e.nombre]?.count ?? 0}
            color={e.color_hex}
          />
        ))}
      </div>

      {/* Tickets recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tickets recientes</h3>
          <Link to="/tickets" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
        </div>

        {recientes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No hay tickets todavía.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recientes.map((t) => (
              <Link
                key={t.id_ticket}
                to={`/tickets/${t.id_ticket}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <span className="text-xs text-gray-400 dark:text-gray-500 w-12 shrink-0">#{t.id_ticket}</span>
                <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">{t.titulo}</span>
                <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 shrink-0">{t.departamento}</span>
                <Badge label={t.prioridad} color={t.prioridad_color} />
                <Badge label={t.estado} color={t.estado_color} />
                <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500 w-28 text-right shrink-0">
                  {formatDate(t.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
