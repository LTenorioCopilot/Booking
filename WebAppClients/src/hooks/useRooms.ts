import { useQuery } from '@tanstack/react-query'
import { roomApi } from '../api/roomApi'

const ROOMS_KEY = ['rooms']

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: roomApi.listar,
  })
}
