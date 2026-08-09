import { httpClient } from './httpClient'
import type { Room, RoomInput } from '../types/room'

const RESOURCE = '/rooms'

export const roomApi = {
  listar: async (): Promise<Room[]> => {
    const { data } = await httpClient.get<Room[]>(RESOURCE)
    return data
  },

  obtener: async (id: string): Promise<Room> => {
    const { data } = await httpClient.get<Room>(`${RESOURCE}/${id}`)
    return data
  },

  crear: async (room: RoomInput): Promise<Room> => {
    const { data } = await httpClient.post<Room>(RESOURCE, room)
    return data
  },

  actualizar: async (id: string, room: RoomInput): Promise<Room> => {
    const { data } = await httpClient.put<Room>(`${RESOURCE}/${id}`, room)
    return data
  },

  eliminar: async (id: string): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
}
