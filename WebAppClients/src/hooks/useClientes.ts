import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clienteApi } from '../api/clienteApi'
import type { ClienteInput } from '../types/cliente'

const CLIENTES_KEY = ['clientes']

export function useClientes() {
  return useQuery({
    queryKey: CLIENTES_KEY,
    queryFn: clienteApi.listar,
  })
}

export function useCliente(id: number | undefined) {
  return useQuery({
    queryKey: [...CLIENTES_KEY, id],
    queryFn: () => clienteApi.obtener(id as number),
    enabled: id !== undefined,
  })
}

export function useCrearCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cliente: ClienteInput) => clienteApi.crear(cliente),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}

export function useActualizarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cliente }: { id: number; cliente: ClienteInput }) =>
      clienteApi.actualizar(id, cliente),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}

export function useEliminarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clienteApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}
