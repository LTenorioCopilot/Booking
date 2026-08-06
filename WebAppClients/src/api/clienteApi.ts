import { httpClient } from './httpClient'
import type { Cliente, ClienteInput } from '../types/cliente'

const RESOURCE = '/clientes'

export const clienteApi = {
  listar: async (): Promise<Cliente[]> => {
    const { data } = await httpClient.get<Cliente[]>(RESOURCE)
    return data
  },

  obtener: async (id: number): Promise<Cliente> => {
    const { data } = await httpClient.get<Cliente>(`${RESOURCE}/${id}`)
    return data
  },

  crear: async (cliente: ClienteInput): Promise<Cliente> => {
    const { data } = await httpClient.post<Cliente>(RESOURCE, cliente)
    return data
  },

  actualizar: async (id: number, cliente: ClienteInput): Promise<Cliente> => {
    const { data } = await httpClient.put<Cliente>(`${RESOURCE}/${id}`, cliente)
    return data
  },

  eliminar: async (id: number): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
}
