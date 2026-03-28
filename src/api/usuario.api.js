import api from './axios'

export const getUsuarios = () =>
  api.get('/usuarios').then((r) => r.data.data)

export const createUsuario = (body) =>
  api.post('/usuarios', body).then((r) => r.data)

export const updateUsuario = (id, body) =>
  api.patch(`/usuarios/${id}`, body).then((r) => r.data)

export const getAgentesPorDepto = (id_departamento) =>
  api.get('/usuarios/agentes', { params: { id_departamento } }).then((r) => r.data.data)
