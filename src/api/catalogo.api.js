import api from './axios'

export const getDepartamentos = () =>
  api.get('/catalogos/departamentos').then((r) => r.data.data)

export const getCategorias = (id_departamento) =>
  api.get('/catalogos/categorias', { params: { id_departamento } }).then((r) => r.data.data)

export const getEstados = () =>
  api.get('/catalogos/estados').then((r) => r.data.data)

export const getPrioridades = () =>
  api.get('/catalogos/prioridades').then((r) => r.data.data)
