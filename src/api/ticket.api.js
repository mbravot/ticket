import api from './axios'

export const getTickets = (params) =>
  api.get('/tickets', { params }).then((r) => r.data.data)

export const getTicket = (id) =>
  api.get(`/tickets/${id}`).then((r) => r.data.data)

export const createTicket = (body) =>
  api.post('/tickets', body).then((r) => r.data)

export const updateTicket = (id, body) =>
  api.patch(`/tickets/${id}`, body).then((r) => r.data)

export const addComentario = (id, body) =>
  api.post(`/tickets/${id}/comentarios`, body).then((r) => r.data)
