import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRooms } from '../hooks/useRooms'
import type { Booking, BookingInput } from '../types/booking'

const SIN_TIPO = ''

const bookingSchema = z.object({
  roomType: z.string(),
  guestName: z.string().min(2, 'Ingresa al menos 2 caracteres').max(150),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn']),
  startHour: z.number().min(0).max(24),
  endHour: z.number().min(0).max(24),
  checkInDate: z.string().min(1, 'Requerido'),
  checkOutDate: z.string().min(1, 'Requerido'),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface BookingFormProps {
  bookingInicial?: Booking
  onSubmit: (valores: BookingInput) => void
  enviando: boolean
}

export function BookingForm({ bookingInicial, onSubmit, enviando }: BookingFormProps) {
  const { data: rooms } = useRooms()
  const roomTypes = useMemo(
    () => Array.from(new Set((rooms ?? []).map((room) => room.type))).sort(),
    [rooms],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: bookingInicial
      ? { ...bookingInicial, roomType: bookingInicial.roomType ?? SIN_TIPO }
      : {
          roomType: SIN_TIPO,
          guestName: '',
          status: 'Pending',
          startHour: 9,
          endHour: 18,
          checkInDate: '',
          checkOutDate: '',
        },
  })

  const enviar = (valores: BookingFormValues) =>
    onSubmit({
      ...valores,
      roomType: valores.roomType === SIN_TIPO ? null : valores.roomType,
      roomId: null,
    })

  return (
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
