export type TipoDocumento = 'DNI' | 'Pasaporte' | 'CE'

export interface Cliente {
  id: number
  nombres: string
  apellidos: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  fechaNacimiento: string
  email: string
  telefono: string
  direccion: string
}

export type ClienteInput = Omit<Cliente, 'id'>
