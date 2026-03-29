import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTicket } from '../hooks/useTicket'
import { useEstados, usePrioridades } from '../hooks/useCatalogos'
import { useAgentesPorDepto } from '../hooks/useUsuarios'
import { updateTicket, addComentario, deleteTicket, editComentario, deleteComentario, uploadAdjunto, deleteAdjunto, downloadAdjunto, fetchAdjuntoBlob } from '../api/ticket.api'
import useAuthStore from '../store/auth.store'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{children}</span>
    </div>
  )
}

export default function TicketDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const rol = user?.rol

  const { data: ticket, isLoading } = useTicket(id)
  const { data: estados } = useEstados()
  const { data: prioridades } = usePrioridades()
  const { data: agentes } = useAgentesPorDepto(
    (rol === 'admin' || rol === 'agente') ? ticket?.id_departamento : null
  )

  const [updateForm, setUpdateForm] = useState({ id_estado: '', id_prioridad: '', id_usuario_asignado: '' })
  const [comentario, setComentario] = useState('')
  const [esInterno, setEsInterno] = useState(false)
  const [editando, setEditando] = useState(null) // { id_comentario, contenido }
  const [preview, setPreview] = useState(null)   // { blobUrl, mimeType, nombre }

  const mutUpdate = useMutation({
    mutationFn: (body) => updateTicket(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setUpdateForm({ id_estado: '', id_prioridad: '', id_usuario_asignado: '' })
    },
  })

  const mutDelete = useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => navigate('/tickets'),
  })

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este ticket? Esta acción no se puede deshacer.')) {
      mutDelete.mutate()
    }
  }

  const mutComentario = useMutation({
    mutationFn: (body) => addComentario(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setComentario('')
      setEsInterno(false)
    },
  })

  const mutEditComentario = useMutation({
    mutationFn: ({ comentarioId, contenido }) => editComentario(id, comentarioId, { contenido }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setEditando(null)
    },
  })

  const mutDeleteComentario = useMutation({
    mutationFn: (comentarioId) => deleteComentario(id, comentarioId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
  })

  const mutUpload = useMutation({
    mutationFn: (file) => uploadAdjunto(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
  })

  const mutDeleteAdjunto = useMutation({
    mutationFn: (adjuntoId) => deleteAdjunto(adjuntoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
  })

  const PREVIEWABLE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

  const openPreview = async (adjunto) => {
    const blobUrl = await fetchAdjuntoBlob(adjunto.id_adjunto)
    setPreview({ blobUrl, mimeType: adjunto.mime_type, nombre: adjunto.nombre_original, adjuntoId: adjunto.id_adjunto })
  }

  const closePreview = () => {
    if (preview?.blobUrl) URL.revokeObjectURL(preview.blobUrl)
    setPreview(null)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const body = {}
    if (updateForm.id_estado) body.id_estado = Number(updateForm.id_estado)
    if (updateForm.id_prioridad) body.id_prioridad = Number(updateForm.id_prioridad)
    if (updateForm.id_usuario_asignado) body.id_usuario_asignado = Number(updateForm.id_usuario_asignado)
    if (Object.keys(body).length === 0) return
    mutUpdate.mutate(body)
  }

  const handleComentario = (e) => {
    e.preventDefault()
    if (!comentario.trim()) return
    mutComentario.mutate({
      contenido: comentario,
      es_interno: rol === 'usuario' ? false : esInterno,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">Ticket no encontrado</p>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-sm text-blue-600 hover:underline cursor-pointer">
          Volver a tickets
        </button>
      </div>
    )
  }

  const comentarios = ticket.comentarios ?? []
  const puedeEditar = rol === 'admin' || rol === 'agente'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="mt-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">#{ticket.id_ticket}</span>
            <Badge label={ticket.estado} color={ticket.estado_color} />
            <Badge label={ticket.prioridad} color={ticket.prioridad_color} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{ticket.titulo}</h2>
        </div>
        {rol === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={mutDelete.isPending}
            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutDelete.isPending ? <Spinner size="sm" /> : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2" />
              </svg>
            )}
            Eliminar
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Descripción</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{ticket.descripcion}</p>
          </div>

          {/* Comentarios */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Comentarios ({comentarios.filter(c => rol !== 'usuario' || !c.es_interno).length})
              </h3>
            </div>

            {comentarios.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center text-gray-400 dark:text-gray-500">Sin comentarios aún.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {comentarios.map((c) => {
                  const interno = !!c.es_interno
                  if (interno && rol === 'usuario') return null
                  const puedeModificar = rol === 'admin' || c.id_usuario === user?.id_usuario
                  const estaEditando = editando?.id_comentario === c.id_comentario
                  return (
                    <div
                      key={c.id_comentario}
                      className={`px-5 py-4 ${interno ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {c.autor?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{c.autor}</span>
                        {interno && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Nota interna
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formatDateTime(c.created_at)}</span>
                        {puedeModificar && !estaEditando && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditando({ id_comentario: c.id_comentario, contenido: c.contenido })}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                              title="Editar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { if (window.confirm('¿Eliminar este comentario?')) mutDeleteComentario.mutate(c.id_comentario) }}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                              title="Eliminar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      {estaEditando ? (
                        <div className="pl-8 space-y-2">
                          <textarea
                            value={editando.contenido}
                            onChange={(e) => setEditando((p) => ({ ...p, contenido: e.target.value }))}
                            rows={3}
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => mutEditComentario.mutate({ comentarioId: c.id_comentario, contenido: editando.contenido })}
                              disabled={mutEditComentario.isPending || !editando.contenido.trim()}
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                            >
                              {mutEditComentario.isPending ? <Spinner size="sm" /> : null}
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditando(null)}
                              className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pl-8">
                          {c.contenido}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Formulario comentario */}
            <form onSubmit={handleComentario} className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-500"
              />
              <div className="flex items-center justify-between">
                {puedeEditar && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={esInterno}
                      onChange={(e) => setEsInterno(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nota interna</span>
                  </label>
                )}
                <button
                  type="submit"
                  disabled={mutComentario.isPending || !comentario.trim()}
                  className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {mutComentario.isPending ? <Spinner size="sm" /> : null}
                  Enviar
                </button>
              </div>
              {mutComentario.isError && (
                <p className="text-xs text-red-600">{mutComentario.error?.message ?? 'Error al enviar'}</p>
              )}
            </form>
          </div>

          {/* Adjuntos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Archivos adjuntos ({(ticket.adjuntos ?? []).length})
              </h3>
              <label className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer">
                {mutUpload.isPending ? <Spinner size="sm" /> : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {mutUpload.isPending ? 'Subiendo...' : 'Adjuntar'}
                <input
                  type="file"
                  className="hidden"
                  disabled={mutUpload.isPending}
                  onChange={(e) => { if (e.target.files[0]) mutUpload.mutate(e.target.files[0]); e.target.value = '' }}
                />
              </label>
            </div>

            {(ticket.adjuntos ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-center text-gray-400 dark:text-gray-500">Sin archivos adjuntos.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {ticket.adjuntos.map((a) => {
                  const puedeEliminar = rol === 'admin' || a.id_usuario === user?.id_usuario
                  return (
                    <div key={a.id_adjunto} className="flex items-center gap-3 px-5 py-3">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{a.nombre_original}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {(a.tamanio / 1024).toFixed(1)} KB · {a.subido_por}
                        </p>
                      </div>
                      {PREVIEWABLE.includes(a.mime_type) && (
                        <button
                          onClick={() => openPreview(a)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                          title="Ver"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => downloadAdjunto(a.id_adjunto, a.nombre_original)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                        title="Descargar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      {puedeEliminar && (
                        <button
                          onClick={() => { if (window.confirm('¿Eliminar este archivo?')) mutDeleteAdjunto.mutate(a.id_adjunto) }}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {mutUpload.isError && (
              <p className="px-5 pb-3 text-xs text-red-600 dark:text-red-400">{mutUpload.error?.response?.data?.message ?? 'Error al subir el archivo'}</p>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Información</h3>
            <InfoRow label="Departamento">{ticket.departamento}</InfoRow>
            <InfoRow label="Categoría">{ticket.categoria}</InfoRow>
            <InfoRow label="Creado por">{ticket.creador}</InfoRow>
            <InfoRow label="Asignado a">{ticket.asignado ?? 'Sin asignar'}</InfoRow>
            <InfoRow label="Creado">{formatDateTime(ticket.created_at)}</InfoRow>
            <InfoRow label="Actualizado">{formatDateTime(ticket.updated_at)}</InfoRow>
            {ticket.closed_at && (
              <InfoRow label="Cerrado">{formatDateTime(ticket.closed_at)}</InfoRow>
            )}
          </div>

          {/* Panel de actualización (solo admin/agente) */}
          {puedeEditar && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Actualizar ticket</h3>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Estado</label>
                  <select
                    value={updateForm.id_estado}
                    onChange={(e) => setUpdateForm((p) => ({ ...p, id_estado: e.target.value }))}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">— Sin cambio —</option>
                    {estados?.map((e) => (
                      <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prioridad</label>
                  <select
                    value={updateForm.id_prioridad}
                    onChange={(e) => setUpdateForm((p) => ({ ...p, id_prioridad: e.target.value }))}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">— Sin cambio —</option>
                    {prioridades?.map((p) => (
                      <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {(rol === 'admin' || rol === 'agente') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reasignar agente</label>
                    <select
                      value={updateForm.id_usuario_asignado}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, id_usuario_asignado: e.target.value }))}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">— Sin cambio —</option>
                      {agentes?.map((a) => (
                        <option key={a.id_usuario} value={a.id_usuario}>
                          {a.nombre} {a.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mutUpdate.isError && (
                  <p className="text-xs text-red-600">{mutUpdate.error?.message ?? 'Error al actualizar'}</p>
                )}
                {mutUpdate.isSuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400">Ticket actualizado.</p>
                )}

                <button
                  type="submit"
                  disabled={mutUpdate.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 disabled:bg-gray-400 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {mutUpdate.isPending ? <Spinner size="sm" /> : null}
                  Guardar cambios
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal previsualización */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{preview.nombre}</p>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => downloadAdjunto(preview.adjuntoId, preview.nombre)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Descargar
                </button>
                <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
              {preview.mimeType.startsWith('image/') ? (
                <img src={preview.blobUrl} alt={preview.nombre} className="max-w-full max-h-full object-contain rounded" />
              ) : (
                <iframe src={preview.blobUrl} title={preview.nombre} className="w-full h-full min-h-[60vh] rounded border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
