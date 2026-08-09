import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '../api/customerApi'
import type { CustomerInput } from '../types/customer'

const CUSTOMERS_KEY = ['customers']

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: customerApi.listar,
  })
}

export function useCustomer(id: number | undefined) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id],
    queryFn: () => customerApi.obtener(id as number),
    enabled: id !== undefined,
  })
}

export function useCrearCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (customer: CustomerInput) => customerApi.crear(customer),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  })
}

export function useActualizarCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, customer }: { id: number; customer: CustomerInput }) =>
      customerApi.actualizar(id, customer),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  })
}

export function useEliminarCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => customerApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  })
}
