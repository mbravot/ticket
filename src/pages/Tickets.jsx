import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import { useEstados, usePrioridades } from '../hooks/useCatalogos'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

const LIMITE = 15

export default function Tickets() {
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '', pagina: 1 })

  const params = {
    ...(filtros.estado && { estado: filtros.estado }),
    ...(filtros.prioridad && { prioridad: filtros.prioridad }),
    pagina: filtros.pagina,
    limite: LIMITE,
  }

  const { data, isLoading } = useTickets(params)
  const { data: estados } = useEstados()
  const { data: prioridades } = usePrioridades()

  const tickets = Array.isArray(data) ? data : (data?.tickets ?? [])
  const total = Array.isArray(data) ? data.length : (data?.total ?? tickets.length)
  const totalPaginas = Math.ceil(total / LIMITE) || 1

  const setFiltro = (key, value) =>
    setFiltros((prev) => ({ ...prev, [key]: value, pagina: 1 }))

  const setPagina = (p) => setFiltros((prev) => ({ ...prev, pagina: p }))

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Todos los tickets</h2>
        </div>

        {/* Filtro estado */}
        <select
          value={filtros.estado}
          onChange={(e) => setFiltro('estado', e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Todos los estados</option>
          {estados?.map((e) => (
            <option key={e.id_estado} value={e.nombre}>{e.nombre}</option>
          ))}
        </select>

        {/* Filtro prioridad */}
        <select
          value={filtros.prioridad}
          onChange={(e) => setFiltro('prioridad', e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Todas las prioridades</option>
          {prioridades?.map((p) => (
            <option key={p.id_prioridad} value={p.nombre}>{p.nombre}</option>
          ))}
        </select>

        <Link
          to="/tickets/nuevo"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
            No se encontraron tickets con los filtros seleccionados.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[60px_1fr_140px_100px_100px_120px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>#</span>
              <span>Título</span>
              <span>Departamento</span>
              <span>Estado</span>
              <span>Prioridad</span>
              <span>Fecha</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tickets.map((t) => (
                <Link
                  key={t.id_ticket}
                  to={`/tickets/${t.id_ticket}`}
                  className="grid grid-cols-[60px_1fr] md:grid-cols-[60px_1fr_140px_100px_100px_120px] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-xs text-gray-400 dark:text-gray-500">#{t.id_ticket}</span>

                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{t.titulo}</p>
                    <div className="flex items-center gap-2 mt-1 md:hidden">
                      <Badge label={t.estado} color={t.estado_color} />
                      <Badge label={t.prioridad} color={t.prioridad_color} />
                    </div>
                  </div>

                  <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 truncate">{t.departamento}</span>
                  <span className="hidden md:block"><Badge label={t.estado} color={t.estado_color} /></span>
                  <span className="hidden md:block"><Badge label={t.prioridad} color={t.prioridad_color} /></span>
                  <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500">{formatDate(t.created_at)}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Página {filtros.pagina} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina(filtros.pagina - 1)}
              disabled={filtros.pagina <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina(filtros.pagina + 1)}
              disabled={filtros.pagina >= totalPaginas}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
