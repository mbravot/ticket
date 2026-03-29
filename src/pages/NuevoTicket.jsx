import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useDepartamentos, useCategorias, usePrioridades } from '../hooks/useCatalogos'
import { createTicket, uploadAdjunto } from '../api/ticket.api'
import Spinner from '../components/ui/Spinner'

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'application/zip',
]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const initialForm = {
  id_departamento: '',
  id_categoria: '',
  id_prioridad: '',
  titulo: '',
  descripcion: '',
}

export default function NuevoTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [archivos, setArchivos] = useState([]) // File[]

  const agregarArchivos = (fileList) => {
    const nuevos = Array.from(fileList).filter((f) => {
      if (!ALLOWED_MIME.includes(f.type)) return false
      if (f.size > MAX_SIZE) return false
      return true
    })
    setArchivos((prev) => {
      const nombres = new Set(prev.map((f) => f.name))
      return [...prev, ...nuevos.filter((f) => !nombres.has(f.name))]
    })
  }

  const quitarArchivo = (nombre) =>
    setArchivos((prev) => prev.filter((f) => f.name !== nombre))

  const { data: departamentos, isLoading: loadingDeptos } = useDepartamentos()
  const { data: categorias, isLoading: loadingCats } = useCategorias(form.id_departamento || null)
  const { data: prioridades, isLoading: loadingPrios } = usePrioridades()

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async (data) => {
      if (data.ok === false) {
        setErrors({ general: data.message ?? 'Error al crear el ticket' })
        return
      }
      const id = data.id_ticket
      if (id && archivos.length > 0) {
        for (const file of archivos) {
          try { await uploadAdjunto(id, file) } catch { /* continúa con el resto */ }
        }
      }
      navigate(id ? `/tickets/${id}` : '/tickets')
    },
    onError: (err) => {
      setErrors({ general: err.response?.data?.message ?? 'Error al conectar con el servidor' })
    },
  })

  const setField = (key, value) => {
    setErrors({})
    if (key === 'id_departamento') {
      setForm((p) => ({ ...p, id_departamento: value, id_categoria: '' }))
    } else {
      setForm((p) => ({ ...p, [key]: value }))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.id_departamento) e.id_departamento = 'Selecciona un departamento'
    if (!form.id_categoria) e.id_categoria = 'Selecciona una categoría'
    if (!form.id_prioridad) e.id_prioridad = 'Selecciona una prioridad'
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (form.titulo.trim().length < 5) e.titulo = 'El título debe tener al menos 5 caracteres'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    mutation.mutate({
      id_departamento: Number(form.id_departamento),
      id_categoria: Number(form.id_categoria),
      id_prioridad: Number(form.id_prioridad),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
    })
  }

  const fieldClass = (key) =>
    `w-full text-sm border rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-500 ${errors[key] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Ticket</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Completa el formulario para abrir un ticket de soporte.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Departamento <span className="text-red-500">*</span>
          </label>
          <select
            value={form.id_departamento}
            onChange={(e) => setField('id_departamento', e.target.value)}
            disabled={loadingDeptos}
            className={fieldClass('id_departamento') + ' cursor-pointer'}
          >
            <option value="">Selecciona un departamento</option>
            {departamentos?.map((d) => (
              <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
            ))}
          </select>
          {errors.id_departamento && <p className="mt-1 text-xs text-red-600">{errors.id_departamento}</p>}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={form.id_categoria}
            onChange={(e) => setField('id_categoria', e.target.value)}
            disabled={!form.id_departamento || loadingCats}
            className={fieldClass('id_categoria') + ' cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}
          >
            <option value="">
              {!form.id_departamento
                ? 'Primero selecciona un departamento'
                : loadingCats
                ? 'Cargando categorías...'
                : 'Selecciona una categoría'}
            </option>
            {categorias?.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
          {errors.id_categoria && <p className="mt-1 text-xs text-red-600">{errors.id_categoria}</p>}
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Prioridad <span className="text-red-500">*</span>
          </label>
          <select
            value={form.id_prioridad}
            onChange={(e) => setField('id_prioridad', e.target.value)}
            disabled={loadingPrios}
            className={fieldClass('id_prioridad') + ' cursor-pointer'}
          >
            <option value="">Selecciona una prioridad</option>
            {prioridades?.map((p) => (
              <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre}</option>
            ))}
          </select>
          {errors.id_prioridad && <p className="mt-1 text-xs text-red-600">{errors.id_prioridad}</p>}
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setField('titulo', e.target.value)}
            placeholder="Describe brevemente el problema..."
            maxLength={255}
            className={fieldClass('titulo')}
          />
          {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
            placeholder="Detalla el problema con la mayor información posible..."
            rows={5}
            className={fieldClass('descripcion') + ' resize-none'}
          />
          {errors.descripcion && <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>}
        </div>

        {/* Adjuntos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Archivos adjuntos <span className="text-xs font-normal text-gray-400">(opcional · máx. 10 MB c/u)</span>
          </label>
          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Seleccionar archivos
            <input type="file" multiple className="hidden" onChange={(e) => { agregarArchivos(e.target.files); e.target.value = '' }} />
          </label>
          {archivos.length > 0 && (
            <ul className="mt-2 space-y-1">
              {archivos.map((f) => (
                <li key={f.name} className="flex items-center justify-between gap-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <span className="truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                  <span className="shrink-0 text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
                  <button type="button" onClick={() => quitarArchivo(f.name)} className="shrink-0 text-gray-400 hover:text-red-500 cursor-pointer transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-3.5 py-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.general}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="flex-1 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
          >
            {mutation.isPending ? <Spinner size="sm" /> : null}
            {mutation.isPending ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
