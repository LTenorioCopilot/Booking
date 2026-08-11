import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRooms } from '../hooks/useRooms'
import { useFolioPreview, useSequences } from '../hooks/useSequences'
import { useBookings } from '../hooks/useBookings'
import { useCrearCustomer, useCustomers } from '../hooks/useCustomers'
import { RESERVATION_SOURCE_LABELS } from '../constants/reservationSource'
import { hasDateOverlap } from '../utils/roomAvailability'
import { CustomerForm } from './CustomerForm'
import type { Booking, BookingInput } from '../types/booking'
import type { Customer, CustomerInput } from '../types/customer'

const SIN_TIPO = ''
const SIN_HABITACION = ''

const bookingSchema = z.object({
  roomType: z.string(),
  roomId: z.string(),
  guestName: z.string().min(2, 'Ingresa al menos 2 caracteres').max(150),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn']),
  startHour: z.number().min(0).max(24),
  endHour: z.number().min(0).max(24),
  checkInDate: z.string().min(1, 'Requerido'),
  checkOutDate: z.string().min(1, 'Requerido'),
  dateOfBirth: z.string(),
  nationality: z.string().max(100),
  idDocumentType: z.string().max(30),
  idDocumentNumber: z.string().max(50),
  address: z.string().max(200),
  phoneNumber: z.string().max(20),
  email: z.string().refine(
    (valor) => valor === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
    'Correo inválido',
  ),
  adultsCount: z.number().min(1, 'Debe haber al menos 1 adulto').max(20),
  minorsCount: z.number().min(0).max(20),
  travelPurpose: z.string().max(50),
  reservationSource: z.string().min(1, 'Selecciona un origen'),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface BookingFormProps {
  bookingInicial?: Booking
  onSubmit: (valores: BookingInput) => void
  enviando: boolean
}

export function BookingForm({ bookingInicial, onSubmit, enviando }: BookingFormProps) {
  const { data: rooms } = useRooms()
  const { data: sequences } = useSequences()
  const { data: bookings } = useBookings()
  const { data: customers } = useCustomers()
  const crearCustomer = useCrearCustomer()
  const roomTypes = useMemo(
    () => Array.from(new Set((rooms ?? []).map((room) => room.type))).sort(),
    [rooms],
  )

  const esEdicion = Boolean(bookingInicial)

  const [customerId, setCustomerId] = useState<number | null>(bookingInicial?.customerId ?? null)
  const [clienteQuery, setClienteQuery] = useState('')
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: bookingInicial
      ? {
          ...bookingInicial,
          roomType: bookingInicial.roomType ?? SIN_TIPO,
          roomId: bookingInicial.roomId ?? SIN_HABITACION,
          dateOfBirth: bookingInicial.dateOfBirth ?? '',
          nationality: bookingInicial.nationality ?? '',
          idDocumentType: bookingInicial.idDocumentType ?? '',
          idDocumentNumber: bookingInicial.idDocumentNumber ?? '',
          address: bookingInicial.address ?? '',
          phoneNumber: bookingInicial.phoneNumber ?? '',
          email: bookingInicial.email ?? '',
          travelPurpose: bookingInicial.travelPurpose ?? '',
        }
      : {
          roomType: SIN_TIPO,
          roomId: SIN_HABITACION,
          guestName: '',
          status: 'Pending',
          startHour: 9,
          endHour: 18,
          checkInDate: '',
          checkOutDate: '',
          dateOfBirth: '',
          nationality: '',
          idDocumentType: '',
          idDocumentNumber: '',
          address: '',
          phoneNumber: '',
          email: '',
          adultsCount: 1,
          minorsCount: 0,
          travelPurpose: '',
          reservationSource: '',
        },
  })

  const origenSeleccionado = watch('reservationSource')
  const { data: folioPreview, isFetching: cargandoFolio } = useFolioPreview(
    !esEdicion && origenSeleccionado ? origenSeleccionado : undefined,
  )

  const folioMostrado = esEdicion
    ? (bookingInicial?.folio ?? '—')
    : !origenSeleccionado
      ? 'Se asignará al guardar'
      : cargandoFolio
        ? 'Calculando...'
        : (folioPreview ?? '—')

  const roomTypeSeleccionado = watch('roomType')
  const checkInDate = watch('checkInDate')
  const checkOutDate = watch('checkOutDate')

  const habitacionesDisponibles = useMemo(() => {
    if (!roomTypeSeleccionado || roomTypeSeleccionado === SIN_TIPO) return []
    return (rooms ?? []).filter(
      (room) =>
        room.type === roomTypeSeleccionado &&
        (!checkInDate ||
          !checkOutDate ||
          !hasDateOverlap(bookings ?? [], room.id, checkInDate, checkOutDate, bookingInicial?.id)),
    )
  }, [rooms, bookings, roomTypeSeleccionado, checkInDate, checkOutDate, bookingInicial])

  const primerRenderTipo = useRef(true)
  useEffect(() => {
    if (primerRenderTipo.current) {
      primerRenderTipo.current = false
      return
    }
    setValue('roomId', SIN_HABITACION)
  }, [roomTypeSeleccionado, setValue])

  const clienteSeleccionado = useMemo(
    () => (customers ?? []).find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  )

  const coincidenciasCliente = useMemo(() => {
    const q = clienteQuery.trim().toLowerCase()
    if (!q) return []
    return (customers ?? [])
      .filter(
        (c) =>
          `${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) ||
          c.numeroDocumento.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .slice(0, 5)
  }, [customers, clienteQuery])

  const vincularCliente = (customer: Customer) => {
    setCustomerId(customer.id)
    setClienteQuery('')
    setValue('guestName', `${customer.nombres} ${customer.apellidos}`)
    setValue('dateOfBirth', customer.fechaNacimiento)
    setValue('nationality', customer.nationality ?? '')
    setValue('idDocumentType', customer.documentType)
    setValue('idDocumentNumber', customer.numeroDocumento)
    setValue('address', customer.direccion)
    setValue('phoneNumber', customer.telefono)
    setValue('email', customer.email)
  }

  const desvincularCliente = () => setCustomerId(null)

  const manejarCrearCliente = async (valores: CustomerInput) => {
    const nuevoCustomer = await crearCustomer.mutateAsync(valores)
    vincularCliente(nuevoCustomer)
    setModalClienteAbierto(false)
  }

  const enviar = (valores: BookingFormValues) =>
    onSubmit({
      ...valores,
      roomType: valores.roomType === SIN_TIPO ? null : valores.roomType,
      roomId: valores.roomId === SIN_HABITACION ? null : valores.roomId,
      dateOfBirth: valores.dateOfBirth || null,
      nationality: valores.nationality || null,
      idDocumentType: valores.idDocumentType || null,
      idDocumentNumber: valores.idDocumentNumber || null,
      address: valores.address || null,
      phoneNumber: valores.phoneNumber || null,
      email: valores.email || null,
      travelPurpose: valores.travelPurpose || null,
      customerId,
    })

  return (
    <>
    <form
      onSubmit={handleSubmit(enviar)}
      className="mx-auto max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Huésped" error={errors.guestName?.message}>
          <input {...register('guestName')} className={inputClass} />
        </Campo>

        <Campo label="Tipo de habitación" error={errors.roomType?.message}>
          <select {...register('roomType')} className={inputClass}>
            <option value={SIN_TIPO}>Sin preferencia</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Habitación" error={errors.roomId?.message}>
          <select
            {...register('roomId')}
            disabled={!roomTypeSeleccionado}
            className={roomTypeSeleccionado ? inputClass : inputDisabledClass}
          >
            <option value={SIN_HABITACION}>Sin asignar</option>
            {habitacionesDisponibles.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (Cap. {room.capacity})
              </option>
            ))}
          </select>
          {roomTypeSeleccionado && habitacionesDisponibles.length === 0 && (
            <span className="mt-1 block text-sm text-amber-600 dark:text-amber-400">
              No hay habitaciones disponibles de este tipo para las fechas seleccionadas.
            </span>
          )}
        </Campo>

        <Campo label="Estado" error={errors.status?.message}>
          <select {...register('status')} className={inputClass}>
            <option value="Pending">Pendiente</option>
            <option value="Confirmed">Confirmada</option>
            <option value="CheckedIn">Check-in</option>
          </select>
        </Campo>

        <Campo label="Check-in" error={errors.checkInDate?.message}>
          <input type="date" {...register('checkInDate')} className={inputClass} />
        </Campo>

        <Campo label="Check-out" error={errors.checkOutDate?.message}>
          <input type="date" {...register('checkOutDate')} className={inputClass} />
        </Campo>

        <Campo label="Hora inicio" error={errors.startHour?.message}>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            {...register('startHour', { valueAsNumber: true })}
            className={inputClass}
          />
        </Campo>

        <Campo label="Hora fin" error={errors.endHour?.message}>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            {...register('endHour', { valueAsNumber: true })}
            className={inputClass}
          />
        </Campo>
      </div>

      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Datos de la reservación
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Origen de la reservación" error={errors.reservationSource?.message}>
          <select {...register('reservationSource')} className={inputClass}>
            <option value="">Selecciona un origen</option>
            {(sequences ?? []).map((sequence) => (
              <option key={sequence.origin} value={sequence.origin}>
                {RESERVATION_SOURCE_LABELS[sequence.origin] ?? sequence.origin}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Folio">
          <input type="text" value={folioMostrado} disabled readOnly className={inputDisabledClass} />
        </Campo>
      </div>

      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Cliente
      </h2>

      {clienteSeleccionado ? (
        <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
          <span className="text-slate-700 dark:text-slate-200">
            Cliente vinculado:{' '}
            <strong>
              {clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}
            </strong>{' '}
            · {clienteSeleccionado.documentType} {clienteSeleccionado.numeroDocumento}
          </span>
          <button
            type="button"
            onClick={desvincularCliente}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Quitar vínculo
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={clienteQuery}
            onChange={(e) => setClienteQuery(e.target.value)}
            placeholder="Buscar cliente por nombre, documento o correo"
            className={inputClass}
          />
          {clienteQuery.trim() && (
            <div className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
              {coincidenciasCliente.length > 0 ? (
                coincidenciasCliente.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => vincularCliente(c)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>
                      {c.nombres} {c.apellidos} · {c.documentType} {c.numeroDocumento}
                    </span>
                    <span className="text-xs font-medium text-indigo-600">Usar</span>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">No se encontraron coincidencias.</span>
                  <button
                    type="button"
                    onClick={() => setModalClienteAbierto(true)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    + Crear cliente nuevo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Datos del huésped
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Fecha de nacimiento" error={errors.dateOfBirth?.message}>
          <input type="date" {...register('dateOfBirth')} className={inputClass} />
        </Campo>

        <Campo label="Nacionalidad" error={errors.nationality?.message}>
          <input {...register('nationality')} className={inputClass} />
        </Campo>

        <Campo label="Tipo de documento" error={errors.idDocumentType?.message}>
          <input
            {...register('idDocumentType')}
            placeholder="INE, pasaporte, cédula..."
            className={inputClass}
          />
        </Campo>

        <Campo label="Número de documento" error={errors.idDocumentNumber?.message}>
          <input {...register('idDocumentNumber')} className={inputClass} />
        </Campo>

        <Campo label="Domicilio" error={errors.address?.message}>
          <input {...register('address')} className={inputClass} />
        </Campo>

        <Campo label="Teléfono" error={errors.phoneNumber?.message}>
          <input {...register('phoneNumber')} className={inputClass} />
        </Campo>

        <Campo label="Correo electrónico" error={errors.email?.message}>
          <input type="email" {...register('email')} className={inputClass} />
        </Campo>

        <Campo label="Motivo del viaje" error={errors.travelPurpose?.message}>
          <select {...register('travelPurpose')} className={inputClass}>
            <option value="">Sin especificar</option>
            <option value="Turismo">Turismo</option>
            <option value="Negocios">Negocios</option>
            <option value="Otro">Otro</option>
          </select>
        </Campo>

        <Campo label="Adultos" error={errors.adultsCount?.message}>
          <input
            type="number"
            min={1}
            max={20}
            {...register('adultsCount', { valueAsNumber: true })}
            className={inputClass}
          />
        </Campo>

        <Campo label="Menores" error={errors.minorsCount?.message}>
          <input
            type="number"
            min={0}
            max={20}
            {...register('minorsCount', { valueAsNumber: true })}
            className={inputClass}
          />
        </Campo>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>

    {modalClienteAbierto && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        onClick={() => setModalClienteAbierto(false)}
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-2 flex max-w-2xl justify-end">
            <button
              type="button"
              onClick={() => setModalClienteAbierto(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cerrar ✕
            </button>
          </div>
          <CustomerForm onSubmit={manejarCrearCliente} enviando={crearCustomer.isPending} />
        </div>
      </div>
    )}
    </>
  )
}

function Campo({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white'

const inputDisabledClass =
  'w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500'
