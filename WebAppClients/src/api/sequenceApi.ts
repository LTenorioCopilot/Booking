import { httpClient } from './httpClient'
import type { Sequence } from '../types/sequence'

const RESOURCE = '/sequences'

export const sequenceApi = {
  listar: async (): Promise<Sequence[]> => {
    const { data } = await httpClient.get<Sequence[]>(RESOURCE)
    return data
  },

  previsualizarFolio: async (origin: string): Promise<string> => {
    const { data } = await httpClient.get<{ folio: string }>(`${RESOURCE}/preview`, {
      params: { origin },
    })
    return data.folio
  },
}
