export type DocumentType = 'DNI' | 'Pasaporte' | 'CE'

export interface Customer {
  id: number
  nombres: string
  apellidos: string
  documentType: DocumentType
  numeroDocumento: string
  fechaNacimiento: string
  email: string
  telefono: string
  direccion: string
}

export type CustomerInput = Omit<Customer, 'id'>
