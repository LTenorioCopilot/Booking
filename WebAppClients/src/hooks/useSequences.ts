import { useQuery } from '@tanstack/react-query'
import { sequenceApi } from '../api/sequenceApi'

export function useSequences() {
  return useQuery({
    queryKey: ['sequences'],
    queryFn: sequenceApi.listar,
  })
}

export function useFolioPreview(origin: string | undefined) {
  return useQuery({
    queryKey: ['sequences', 'preview', origin],
    queryFn: () => sequenceApi.previsualizarFolio(origin as string),
    enabled: Boolean(origin),
  })
}
