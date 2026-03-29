import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento,
  getCategorias,    createCategoria,    updateCategoria,    deleteCategoria,
  getEstados,       createEstado,       updateEstado,       deleteEstado,
  getPrioridades,   createPrioridad,    updatePrioridad,    deletePrioridad,
} from '../../api/catalogo.api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key: 'departamentos', label: 'Departamentos' },
  { key: 'categorias',    label: 'Categorías' },
  { key: 'estados',       label: 'Estados' },
  { key: 'prioridades',   label: 'Prioridades' },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function ColorDot({ color }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"
      style={{ backgroundColor: color ?? '#888' }}
    />
  )
}

function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-3.5 py-3">
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  )
}

const inputClass = 'w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3.5 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

// ── Generic table ─────────────────────────────────────────────────────────────

function CatalogTable({ columns, rows, idKey, onEdit, onDelete, isLoading }) {
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!rows?.length) return <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-12">Sin registros.</p>

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {rows.map((row) => (
        <div key={row[idKey]} className="flex items-center gap-4 px-5 py-3">
          {columns.map((col) => (
            <div key={col.key} className={col.className ?? 'flex-1 min-w-0'}>
              {col.render ? col.render(row) : (
                <span className="text-sm text-gray-900 dark:text-white truncate block">{row[col.key] ?? '—'}</span>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(row)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer" title="Editar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
            <button
              onClick={() => { if (window.confirm('¿Eliminar este registro?')) onDelete(row[idKey]) }}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Departamentos ─────────────────────────────────────────────────────────────

function TabDepartamentos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [error, setError] = useState('')

  const { data: deptos, isLoading } = useQuery({ queryKey: ['departamentos'], queryFn: getDepartamentos })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['departamentos'] })

  const mutSave = useMutation({
    mutationFn: (body) => editing ? updateDepartamento(editing.id_departamento, body) : createDepartamento(body),
    onSuccess: (d) => { if (!d.ok) { setError(d.message); return } invalidate(); setModal(false) },
    onError: (e) => setError(e.response?.data?.message ?? 'Error'),
  })

  const mutDel = useMutation({
    mutationFn: deleteDepartamento,
    onSuccess: (d) => { if (!d.ok) alert(d.message); else invalidate() },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al eliminar'),
  })

  const openNew = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ nombre: row.nombre, descripcion: row.descripcion ?? '' }); setError(''); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setError('')
    mutSave.mutate({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null })
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', className: 'flex-1 min-w-0 hidden sm:block' },
    { key: 'activo', label: 'Estado', className: 'w-20 hidden md:block', render: (r) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
        {r.activo ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ]

  return (
    <>
      <SectionHeader title="Departamentos" count={deptos?.length} onNew={openNew} />
      <CatalogTable columns={columns} rows={deptos} idKey="id_departamento" onEdit={openEdit} onDelete={(id) => mutDel.mutate(id)} isLoading={isLoading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar departamento' : 'Nuevo departamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input className={inputClass} value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} />
          </div>
          <ErrorMsg msg={error} />
          <ModalButtons onCancel={() => setModal(false)} isPending={mutSave.isPending} isEdit={!!editing} />
        </form>
      </Modal>
    </>
  )
}

// ── Categorías ────────────────────────────────────────────────────────────────

function TabCategorias() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', id_departamento: '' })
  const [error, setError] = useState('')

  const { data: cats, isLoading } = useQuery({ queryKey: ['categorias', null], queryFn: () => getCategorias(null) })
  const { data: deptos } = useQuery({ queryKey: ['departamentos'], queryFn: getDepartamentos })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categorias'] })

  const mutSave = useMutation({
    mutationFn: (body) => editing ? updateCategoria(editing.id_categoria, body) : createCategoria(body),
    onSuccess: (d) => { if (!d.ok) { setError(d.message); return } invalidate(); setModal(false) },
    onError: (e) => setError(e.response?.data?.message ?? 'Error'),
  })

  const mutDel = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: (d) => { if (!d.ok) alert(d.message); else invalidate() },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al eliminar'),
  })

  const openNew = () => { setEditing(null); setForm({ nombre: '', descripcion: '', id_departamento: '' }); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ nombre: row.nombre, descripcion: row.descripcion ?? '', id_departamento: row.id_departamento }); setError(''); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    if (!form.id_departamento) { setError('Selecciona un departamento'); return }
    setError('')
    mutSave.mutate({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null, id_departamento: Number(form.id_departamento) })
  }

  const deptoNombre = (id) => deptos?.find((d) => d.id_departamento === id)?.nombre ?? '—'

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'id_departamento', label: 'Departamento', className: 'flex-1 min-w-0 hidden sm:block', render: (r) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">{deptoNombre(r.id_departamento)}</span>
    )},
  ]

  return (
    <>
      <SectionHeader title="Categorías" count={cats?.length} onNew={openNew} />
      <CatalogTable columns={columns} rows={cats} idKey="id_categoria" onEdit={openEdit} onDelete={(id) => mutDel.mutate(id)} isLoading={isLoading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Departamento *</label>
            <select className={inputClass + ' cursor-pointer'} value={form.id_departamento} onChange={(e) => setForm((p) => ({ ...p, id_departamento: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {deptos?.map((d) => <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input className={inputClass} value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} />
          </div>
          <ErrorMsg msg={error} />
          <ModalButtons onCancel={() => setModal(false)} isPending={mutSave.isPending} isEdit={!!editing} />
        </form>
      </Modal>
    </>
  )
}

// ── Estados ───────────────────────────────────────────────────────────────────

function TabEstados() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', color_hex: '#888888', orden: '' })
  const [error, setError] = useState('')

  const { data: estados, isLoading } = useQuery({ queryKey: ['estados'], queryFn: getEstados })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['estados'] })

  const mutSave = useMutation({
    mutationFn: (body) => editing ? updateEstado(editing.id_estado, body) : createEstado(body),
    onSuccess: (d) => { if (!d.ok) { setError(d.message); return } invalidate(); setModal(false) },
    onError: (e) => setError(e.response?.data?.message ?? 'Error'),
  })

  const mutDel = useMutation({
    mutationFn: deleteEstado,
    onSuccess: (d) => { if (!d.ok) alert(d.message); else invalidate() },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al eliminar'),
  })

  const openNew = () => { setEditing(null); setForm({ nombre: '', color_hex: '#3B82F6', orden: '' }); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ nombre: row.nombre, color_hex: row.color_hex ?? '#888888', orden: row.orden ?? '' }); setError(''); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setError('')
    mutSave.mutate({ nombre: form.nombre.trim(), color_hex: form.color_hex, orden: form.orden !== '' ? Number(form.orden) : undefined })
  }

  const columns = [
    { key: 'color_hex', label: '', className: 'w-8', render: (r) => <ColorDot color={r.color_hex} /> },
    { key: 'nombre', label: 'Nombre' },
    { key: 'orden', label: 'Orden', className: 'w-16 hidden sm:block', render: (r) => <span className="text-sm text-gray-500 dark:text-gray-400">{r.orden}</span> },
  ]

  return (
    <>
      <SectionHeader title="Estados" count={estados?.length} onNew={openNew} />
      <CatalogTable columns={columns} rows={estados} idKey="id_estado" onEdit={openEdit} onDelete={(id) => mutDel.mutate(id)} isLoading={isLoading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar estado' : 'Nuevo estado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color_hex} onChange={(e) => setForm((p) => ({ ...p, color_hex: e.target.value }))} className="w-10 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent" />
                <input className={inputClass} value={form.color_hex} onChange={(e) => setForm((p) => ({ ...p, color_hex: e.target.value }))} placeholder="#3B82F6" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" className={inputClass} value={form.orden} onChange={(e) => setForm((p) => ({ ...p, orden: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <ErrorMsg msg={error} />
          <ModalButtons onCancel={() => setModal(false)} isPending={mutSave.isPending} isEdit={!!editing} />
        </form>
      </Modal>
    </>
  )
}

// ── Prioridades ───────────────────────────────────────────────────────────────

function TabPrioridades() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', color_hex: '#888888', nivel: '' })
  const [error, setError] = useState('')

  const { data: prioridades, isLoading } = useQuery({ queryKey: ['prioridades'], queryFn: getPrioridades })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['prioridades'] })

  const mutSave = useMutation({
    mutationFn: (body) => editing ? updatePrioridad(editing.id_prioridad, body) : createPrioridad(body),
    onSuccess: (d) => { if (!d.ok) { setError(d.message); return } invalidate(); setModal(false) },
    onError: (e) => setError(e.response?.data?.message ?? 'Error'),
  })

  const mutDel = useMutation({
    mutationFn: deletePrioridad,
    onSuccess: (d) => { if (!d.ok) alert(d.message); else invalidate() },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al eliminar'),
  })

  const openNew = () => { setEditing(null); setForm({ nombre: '', color_hex: '#3B82F6', nivel: '' }); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ nombre: row.nombre, color_hex: row.color_hex ?? '#888888', nivel: row.nivel ?? '' }); setError(''); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setError('')
    mutSave.mutate({ nombre: form.nombre.trim(), color_hex: form.color_hex, nivel: form.nivel !== '' ? Number(form.nivel) : undefined })
  }

  const columns = [
    { key: 'color_hex', label: '', className: 'w-8', render: (r) => <ColorDot color={r.color_hex} /> },
    { key: 'nombre', label: 'Nombre' },
    { key: 'nivel', label: 'Nivel', className: 'w-16 hidden sm:block', render: (r) => <span className="text-sm text-gray-500 dark:text-gray-400">{r.nivel}</span> },
  ]

  return (
    <>
      <SectionHeader title="Prioridades" count={prioridades?.length} onNew={openNew} />
      <CatalogTable columns={columns} rows={prioridades} idKey="id_prioridad" onEdit={openEdit} onDelete={(id) => mutDel.mutate(id)} isLoading={isLoading} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar prioridad' : 'Nueva prioridad'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color_hex} onChange={(e) => setForm((p) => ({ ...p, color_hex: e.target.value }))} className="w-10 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent" />
                <input className={inputClass} value={form.color_hex} onChange={(e) => setForm((p) => ({ ...p, color_hex: e.target.value }))} placeholder="#3B82F6" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nivel</label>
              <input type="number" className={inputClass} value={form.nivel} onChange={(e) => setForm((p) => ({ ...p, nivel: e.target.value }))} placeholder="1" />
            </div>
          </div>
          <ErrorMsg msg={error} />
          <ModalButtons onCancel={() => setModal(false)} isPending={mutSave.isPending} isEdit={!!editing} />
        </form>
      </Modal>
    </>
  )
}

// ── Shared subcomponents ──────────────────────────────────────────────────────

function SectionHeader({ title, count, onNew }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title} <span className="text-gray-400 dark:text-gray-500 font-normal">({count ?? 0})</span>
      </h3>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo
      </button>
    </div>
  )
}

function ModalButtons({ onCancel, isPending, isEdit }) {
  return (
    <div className="flex gap-3 pt-1">
      <button type="button" onClick={onCancel} className="flex-1 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 rounded-lg transition cursor-pointer">
        Cancelar
      </button>
      <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
        {isPending ? <Spinner size="sm" /> : null}
        {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TAB_COMPONENTS = {
  departamentos: TabDepartamentos,
  categorias:    TabCategorias,
  estados:       TabEstados,
  prioridades:   TabPrioridades,
}

export default function Catalogos() {
  const [tab, setTab] = useState('departamentos')
  const TabComponent = TAB_COMPONENTS[tab]

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mantenedor de Catálogos</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona los valores del sistema.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition cursor-pointer ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <TabComponent />
      </div>
    </div>
  )
}
