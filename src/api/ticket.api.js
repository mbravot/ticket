import api from './axios'

export const getTickets = (params) =>
  api.get('/tickets', { params }).then((r) => r.data)

export const getTicket = (id) =>
  api.get(`/tickets/${id}`).then((r) => ({ ...r.data.ticket, comentarios: r.data.comentarios, adjuntos: r.data.adjuntos ?? [] }))

export const deleteTicket = (id) =>
  api.delete(`/tickets/${id}`).then((r) => r.data)

export const createTicket = (body) =>
  api.post('/tickets', body).then((r) => r.data)

export const updateTicket = (id, body) =>
  api.patch(`/tickets/${id}`, body).then((r) => r.data)

export const addComentario = (id, body) =>
  api.post(`/tickets/${id}/comentarios`, body).then((r) => r.data)

export const editComentario = (id, comentarioId, body) =>
  api.patch(`/tickets/${id}/comentarios/${comentarioId}`, body).then((r) => r.data)

export const deleteComentario = (id, comentarioId) =>
  api.delete(`/tickets/${id}/comentarios/${comentarioId}`).then((r) => r.data)

export const uploadAdjunto = (id, file) => {
  const form = new FormData()
  form.append('archivo', file)
  return api.post(`/tickets/${id}/adjuntos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}

export const deleteAdjunto = (adjuntoId) =>
  api.delete(`/adjuntos/${adjuntoId}`).then((r) => r.data)

export const downloadAdjunto = async (adjuntoId, nombreOriginal) => {
  const response = await api.get(`/adjuntos/${adjuntoId}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreOriginal
  a.click()
  URL.revokeObjectURL(url)
}

export const fetchAdjuntoBlob = (adjuntoId) =>
  api.get(`/adjuntos/${adjuntoId}/download`, { responseType: 'blob' }).then((r) => URL.createObjectURL(r.data))
