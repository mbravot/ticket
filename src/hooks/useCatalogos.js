import { useQuery } from '@tanstack/react-query'
import {
  getDepartamentos,
  getCategorias,
  getEstados,
  getPrioridades,
} from '../api/catalogo.api'

export function useDepartamentos() {
  return useQuery({
    queryKey: ['departamentos'],
    queryFn: getDepartamentos,
  })
}

export function useCategorias(id_departamento) {
  return useQuery({
    queryKey: ['categorias', id_departamento],
    queryFn: () => getCategorias(id_departamento),
    enabled: !!id_departamento,
  })
}

export function useEstados() {
  return useQuery({
    queryKey: ['estados'],
    queryFn: getEstados,
  })
}

export function usePrioridades() {
  return useQuery({
    queryKey: ['prioridades'],
    queryFn: getPrioridades,
  })
}
