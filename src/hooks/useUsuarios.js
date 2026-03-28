import { useQuery } from '@tanstack/react-query'
import { getUsuarios, getAgentesPorDepto } from '../api/usuario.api'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  })
}

export function useAgentesPorDepto(id_departamento) {
  return useQuery({
    queryKey: ['agentes', id_departamento],
    queryFn: () => getAgentesPorDepto(id_departamento),
    enabled: !!id_departamento,
  })
}
