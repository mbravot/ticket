import { useQuery } from '@tanstack/react-query'
import { getTickets } from '../api/ticket.api'

export function useTickets(params) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => getTickets(params),
  })
}
