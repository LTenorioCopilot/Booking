import { httpClient } from './httpClient'
import type { Customer, CustomerInput } from '../types/customer'

const RESOURCE = '/customers'

export const customerApi = {
  listar: async (): Promise<Customer[]> => {
    const { data } = await httpClient.get<Customer[]>(RESOURCE)
    return data
  },

  obtener: async (id: number): Promise<Customer> => {
    const { data } = await httpClient.get<Customer>(`${RESOURCE}/${id}`)
    return data
  },

  crear: async (customer: CustomerInput): Promise<Customer> => {
    const { data } = await httpClient.post<Customer>(RESOURCE, customer)
    return data
  },

  actualizar: async (id: number, customer: CustomerInput): Promise<Customer> => {
    const { data } = await httpClient.put<Customer>(`${RESOURCE}/${id}`, customer)
    return data
  },

  eliminar: async (id: number): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
}
