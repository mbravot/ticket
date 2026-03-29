import api from './axios'

export const getDepartamentos = () =>
  api.get('/catalogos/departamentos').then((r) => r.data.departamentos)

export const getCategorias = (id_departamento) =>
  api.get('/catalogos/categorias', { params: { id_departamento } }).then((r) => r.data.categorias)

export const getEstados = () =>
  api.get('/catalogos/estados').then((r) => r.data.estados)

export const getPrioridades = () =>
  api.get('/catalogos/prioridades').then((r) => r.data.prioridades)

// ── Departamentos ───────────────────────────────────────────
export const createDepartamento = (body) =>
  api.post('/catalogos/departamentos', body).then((r) => r.data)
export const updateDepartamento = (id, body) =>
  api.patch(`/catalogos/departamentos/${id}`, body).then((r) => r.data)
export const deleteDepartamento = (id) =>
  api.delete(`/catalogos/departamentos/${id}`).then((r) => r.data)

// ── Categorías ──────────────────────────────────────────────
export const createCategoria = (body) =>
  api.post('/catalogos/categorias', body).then((r) => r.data)
export const updateCategoria = (id, body) =>
  api.patch(`/catalogos/categorias/${id}`, body).then((r) => r.data)
export const deleteCategoria = (id) =>
  api.delete(`/catalogos/categorias/${id}`).then((r) => r.data)

// ── Estados ─────────────────────────────────────────────────
export const createEstado = (body) =>
  api.post('/catalogos/estados', body).then((r) => r.data)
export const updateEstado = (id, body) =>
  api.patch(`/catalogos/estados/${id}`, body).then((r) => r.data)
export const deleteEstado = (id) =>
  api.delete(`/catalogos/estados/${id}`).then((r) => r.data)

// ── Prioridades ─────────────────────────────────────────────
export const createPrioridad = (body) =>
  api.post('/catalogos/prioridades', body).then((r) => r.data)
export const updatePrioridad = (id, body) =>
  api.patch(`/catalogos/prioridades/${id}`, body).then((r) => r.data)
export const deletePrioridad = (id) =>
  api.delete(`/catalogos/prioridades/${id}`).then((r) => r.data)
