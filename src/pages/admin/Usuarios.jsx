import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useDepartamentos } from '../../hooks/useCatalogos'
import { createUsuario, updateUsuario } from '../../api/usuario.api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const ROLES = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Agente' },
  { value: 3, label: 'Usuario' },
]

const roleBadgeColor = { admin: '#8B5CF6', agente: '#F97316', usuario: '#3B82F6' }

const initialForm = {
  nombre: '', apellido: '', email: '',
  password: '', id_rol: '', id_departamento: '',
}

export default function Usuarios() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editUsuario, setEditUsuario] = useState(null) // null = crear, objeto = editar
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  const { data: usuarios, isLoading } = useUsuarios()
  const { data: departamentos } = useDepartamentos()

  const mutation = useMutation({
    mutationFn: (body) => editUsuario
      ? updateUsuario(editUsuario.id_usuario, body)
      : createUsuario(body),
    onSuccess: (data) => {
      if (data.ok === false) {
        setErrors({ general: data.message ?? 'Error al guardar el usuario' })
        return
      }
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setModalOpen(false)
      setEditUsuario(null)
      setForm(initialForm)
      setErrors({})
    },
    onError: (err) => {
      setErrors({ general: err.response?.data?.message ?? 'Error al conectar con el servidor' })
    },
  })

  const openEdit = (u) => {
    setEditUsuario(u)
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: '',
      id_rol: u.id_rol ?? '',
      id_departamento: u.id_departamento ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const setField = (key, value) => {
    setErrors({})
    setForm((p) => ({ ...p, [key]: value }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    if (!editUsuario && (!form.password || form.password.length < 8)) e.password = 'Mínimo 8 caracteres'
    if (!form.id_rol) e.id_rol = 'Selecciona un rol'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    const body = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      id_rol: Number(form.id_rol),
      id_departamento: form.id_departamento ? Number(form.id_departamento) : null,
    }
    if (!editUsuario) body.password = form.password
    mutation.mutate(body)
  }

  const fieldClass = (key) =>
    `w-full text-sm border rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors[key] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`

  const rolNombre = (u) => {
    const found = ROLES.find((r) => r.value === u.id_rol)
    return found?.label?.toLowerCase() ?? u.rol ?? '—'
  }

  return (
    <div className="max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{usuarios?.length ?? 0} usuarios en el sistema</p>
        </div>
        <button
          onClick={() => { setEditUsuario(null); setForm(initialForm); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !usuarios?.length ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">No hay usuarios.</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_1fr_80px_1fr] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Departamento</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {usuarios.map((u) => {
                const rol = rolNombre(u)
                const color = roleBadgeColor[rol] ?? '#6B7280'
                return (
                  <div key={u.id_usuario} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_80px_1fr_40px] gap-4 items-center px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-semibold shrink-0">
                        {u.nombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.nombre} {u.apellido}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{u.email}</p>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize w-fit"
                      style={{ backgroundColor: color + '22', color, borderColor: color + '55' }}
                    >
                      {rol}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.departamento ?? '—'}</p>
                    <button
                      onClick={() => openEdit(u)}
                      className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                      title="Editar usuario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal nuevo usuario */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditUsuario(null) }} title={editUsuario ? 'Editar usuario' : 'Nuevo usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} className={fieldClass('nombre')} />
              {errors.nombre && <p className="mt-0.5 text-xs text-red-600">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Apellido *</label>
              <input type="text" value={form.apellido} onChange={(e) => setField('apellido', e.target.value)} className={fieldClass('apellido')} />
              {errors.apellido && <p className="mt-0.5 text-xs text-red-600">{errors.apellido}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={fieldClass('email')} />
            {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          {!editUsuario && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contraseña * (mín. 8 caracteres)</label>
              <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} className={fieldClass('password')} />
              {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rol *</label>
              <select value={form.id_rol} onChange={(e) => setField('id_rol', e.target.value)} className={fieldClass('id_rol') + ' cursor-pointer'}>
                <option value="">Seleccionar</option>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.id_rol && <p className="mt-0.5 text-xs text-red-600">{errors.id_rol}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Departamento</label>
              <select value={form.id_departamento} onChange={(e) => setField('id_departamento', e.target.value)} className={fieldClass('id_departamento') + ' cursor-pointer'}>
                <option value="">Sin departamento</option>
                {departamentos?.map((d) => <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>)}
              </select>
            </div>
          </div>

          {errors.general && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-3.5 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.general}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 rounded-lg transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
              {mutation.isPending ? <Spinner size="sm" /> : null}
              {mutation.isPending ? 'Guardando...' : editUsuario ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
