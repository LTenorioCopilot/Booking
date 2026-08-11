export type DocumentType = 'DNI' | 'Pasaporte' | 'CE'

export interface Customer {
  id: number
  nombres: string
  apellidos: string
  documentType: DocumentType
  numeroDocumento: string
  fechaNacimiento: string
  nationality: string | null
  email: string
  telefono: string
  direccion: string
}

export type CustomerInput = Omit<Customer, 'id'>
