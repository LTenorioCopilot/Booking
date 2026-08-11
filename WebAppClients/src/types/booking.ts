export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn'

export interface Booking {
  id: number
  roomId: string | null
  roomType: string | null
  guestName: string
  status: BookingStatus
  startHour: number
  endHour: number
  checkInDate: string
  checkOutDate: string
  dateOfBirth: string | null
  nationality: string | null
  idDocumentType: string | null
  idDocumentNumber: string | null
  address: string | null
  phoneNumber: string | null
  email: string | null
  adultsCount: number
  minorsCount: number
  travelPurpose: string | null
  reservationSource: string
  folio: string | null
  customerId: number | null
}

export type BookingInput = Omit<Booking, 'id' | 'folio'>
