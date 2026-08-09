import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomApi } from '../api/roomApi'
import type { RoomInput } from '../types/room'

const ROOMS_KEY = ['rooms']

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: roomApi.listar,
  })
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: [...ROOMS_KEY, id],
    queryFn: () => roomApi.obtener(id as string),
    enabled: id !== undefined,
  })
}

export function useCrearRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (room: RoomInput) => roomApi.crear(room),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}

export function useActualizarRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, room }: { id: string; room: RoomInput }) => roomApi.actualizar(id, room),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}

export function useEliminarRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roomApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}
