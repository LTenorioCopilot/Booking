import { httpClient } from './httpClient'
import type { Room } from '../types/room'

const RESOURCE = '/rooms'

export const roomApi = {
  listar: async (): Promise<Room[]> => {
    const { data } = await httpClient.get<Room[]>(RESOURCE)
    return data
  },
}
