import { Fragment, useMemo, useState, type FormEvent } from 'react'
import { useBookings, useCrearBooking, useActualizarBooking, useEliminarBooking } from '../hooks/useBookings'
import { useRooms } from '../hooks/useRooms'
import type { Booking, BookingStatus } from '../types/booking'

type ReservationStatus = BookingStatus
type ViewMode = 'hours' | 'days'

interface Reservation {
  id: string
  roomId: string
  guest: string
  status: ReservationStatus
  startHour: number
  endHour: number
  checkIn: string
  checkOut: string
}

interface Draft {
  id?: string
  roomId: string
  guest: string
  status: ReservationStatus
  startHour: number
  endHour: number
  checkIn: string
  checkOut: string
}

const START_HOUR = 8
const END_HOUR = 20
const SLOT_MINUTES = 30
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => i)
const START_HOUR_OPTIONS = SLOTS.map((slot) => START_HOUR + slot / SLOTS_PER_HOUR)
const END_HOUR_OPTIONS = [...START_HOUR_OPTIONS, END_HOUR]

const ROOM_COLUMN_WIDTH = 200
const SLOT_COLUMN_WIDTH = 56
const DAY_COLUMN_WIDTH = 76
const DAY_WINDOW = 14

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

function diffDays(fromISO: string, toISO: string) {
  const from = new Date(`${fromISO}T00:00:00`)
  const to = new Date(`${toISO}T00:00:00`)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

function formatDay(dateISO: string) {
  return new Intl.DateTimeFormat('es', { weekday: 'short', day: '2-digit', month: 'short' }).format(
    new Date(`${dateISO}T00:00:00`),
  )
}

const TODAY = toISODate(new Date())

const STATUS_LABELS: Record<ReservationStatus, string> = {
  Confirmed: 'Confirmada',
  CheckedIn: 'Check-in',
  Pending: 'Pendiente',
}

const STATUS_STYLES: Record<ReservationStatus, string> = {
  Confirmed: 'border-indigo-500 bg-indigo-600 text-white',
  CheckedIn: 'border-emerald-500 bg-emerald-600 text-white',
  Pending: 'border-amber-400 bg-amber-500 text-white',
}

function toReservation(booking: Booking): Reservation {
  return {
    id: String(booking.id),
    roomId: booking.roomId,
    guest: booking.guestName,
    status: booking.status,
    startHour: booking.startHour,
    endHour: booking.endHour,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
  }
}

function toBookingInput(draft: Draft) {
  return {
    roomId: draft.roomId,
    guestName: draft.guest,
    status: draft.status,
    startHour: draft.startHour,
    endHour: draft.endHour,
    checkInDate: draft.checkIn,
    checkOutDate: draft.checkOut,
  }
}

function formatHour(hour: number) {
  const h = Math.floor(hour)
  const minutes = Math.round((hour - h) * 60)
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function hourToSlot(hour: number) {
  const clamped = Math.min(Math.max(hour, START_HOUR), END_HOUR)
  return Math.round((clamped - START_HOUR) * SLOTS_PER_HOUR)
}

interface HourBlock {
  start: number
  end: number
}

function getHourBlock(reservation: Reservation, day: string): HourBlock | null {
  const { checkIn, checkOut, startHour, endHour } = reservation

  // A single-night stay created from the hour view is a same-day quick booking,
  // not a real overnight stay — keep it on its check-in day only.
  if (checkOut === addDays(checkIn, 1)) {
    return day === checkIn ? { start: startHour, end: endHour } : null
  }

  if (day < checkIn || day > checkOut) return null
  if (day === checkOut) return { start: START_HOUR, end: endHour }
  if (day === checkIn) return { start: startHour, end: END_HOUR }
  return { start: START_HOUR, end: END_HOUR }
}

function hasHourOverlap(reservations: Reservation[], roomId: string, date: string, start: number, end: number) {
  return reservations.some((r) => {
    if (r.roomId !== roomId) return false
    const block = getHourBlock(r, date)
    return !!block && start < block.end && end > block.start
  })
}

function hasDateOverlap(reservations: Reservation[], roomId: string, checkIn: string, checkOut: string) {
  return reservations.some((r) => r.roomId === roomId && checkIn < r.checkOut && checkOut > r.checkIn)
}

export function Reservations() {
  const { data: roomsData, isLoading: roomsLoading, isError: roomsError } = useRooms()
  const rooms = roomsData ?? []
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError } = useBookings()
  const crearBooking = useCrearBooking()
  const actualizarBooking = useActualizarBooking()
  const eliminarBooking = useEliminarBooking()
  const reservations = useMemo(() => (bookings ?? []).map(toReservation), [bookings])
  const isLoading = roomsLoading || bookingsLoading
  const isError = roomsError || bookingsError
  const [view, setView] = useState<ViewMode>('hours')
  const [hourViewDate, setHourViewDate] = useState(TODAY)
  const [dayViewStart, setDayViewStart] = useState(TODAY)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const handleViewChange = (next: ViewMode) => {
    setView(next)
    setDraft(null)
    setSelectedReservation(null)
    setError(null)
  }

  const openNewReservation = (roomId: string, startHour: number) => {
    setError(null)
    setDraft({
      roomId,
      guest: '',
      status: 'Pending',
      startHour,
      endHour: Math.min(startHour + 2, END_HOUR),
      checkIn: hourViewDate,
      checkOut: addDays(hourViewDate, 1),
    })
  }

  const openNewDateReservation = (roomId: string, checkIn: string) => {
    setError(null)
    setDraft({
      roomId,
      guest: '',
      status: 'Pending',
      startHour: START_HOUR,
      endHour: START_HOUR + 2,
      checkIn,
      checkOut: addDays(checkIn, 1),
    })
  }

  const openEditReservation = (reservation: Reservation) => {
    setError(null)
    setSelectedReservation(null)
    setDraft({ ...reservation })
  }

  const viewInHours = (reservation: Reservation) => {
    setHourViewDate(reservation.checkIn)
    setView('hours')
  }

  const handleCheckInChange = (checkIn: string) => {
    if (!draft) return
    setDraft({
      ...draft,
      checkIn,
      checkOut: checkIn >= draft.checkOut ? addDays(checkIn, 1) : draft.checkOut,
    })
  }

  const handleSaveReservation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!draft) return

    if (!draft.guest.trim()) {
      setError('Ingresa el nombre del huésped.')
      return
    }

    const overlaps =
      !draft.id &&
      (view === 'hours'
        ? hasHourOverlap(reservations, draft.roomId, draft.checkIn, draft.startHour, draft.endHour)
        : hasDateOverlap(reservations, draft.roomId, draft.checkIn, draft.checkOut))

    if (overlaps) {
      setError('Ya existe una reserva que se cruza con esa habitación.')
      return
    }

    const payload = toBookingInput({ ...draft, guest: draft.guest.trim() })

    try {
      if (draft.id) {
        await actualizarBooking.mutateAsync({ id: Number(draft.id), booking: payload })
      } else {
        await crearBooking.mutateAsync(payload)
      }
      setDraft(null)
      setError(null)
    } catch {
      setError('No se pudo guardar la reserva. Intenta nuevamente.')
    }
  }

  const handleCancelReservation = async (id: string) => {
    try {
      await eliminarBooking.mutateAsync(Number(id))
      setSelectedReservation(null)
    } catch {
      setError('No se pudo cancelar la reserva. Intenta nuevamente.')
    }
  }

  const visibleDays = Array.from({ length: DAY_WINDOW }, (_, i) => addDays(dayViewStart, i))
  const selectedHourBlock = selectedReservation ? getHourBlock(selectedReservation, hourViewDate) : null

  if (isLoading) {
    return <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500 dark:text-slate-400">Cargando reservaciones…</div>
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-sm text-red-600">
        No se pudieron cargar las reservaciones. Verifica que la API esté disponible.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reservaciones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {view === 'hours'
              ? 'Haz clic en una celda vacía para agendar una reserva rápida'
              : 'Haz clic en un día vacío para agendar una estancia'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={view}
            onChange={(e) => handleViewChange(e.target.value as ViewMode)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="hours">Vista por horas</option>
            <option value="days">Vista por días</option>
          </select>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <span key={status} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-sm ${STATUS_STYLES[status as ReservationStatus]}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {view === 'hours' && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHourViewDate(addDays(hourViewDate, -1))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setHourViewDate(TODAY)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setHourViewDate(addDays(hourViewDate, 1))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              →
            </button>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDay(hourViewDate)}</span>
        </div>
      )}

      {view === 'days' && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDayViewStart(addDays(dayViewStart, -7))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setDayViewStart(TODAY)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setDayViewStart(addDays(dayViewStart, 7))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              →
            </button>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDay(visibleDays[0])} – {formatDay(visibleDays[DAY_WINDOW - 1])}
          </span>
        </div>
      )}

      {view === 'hours' && (
        <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `${ROOM_COLUMN_WIDTH}px repeat(${TOTAL_SLOTS}, minmax(${SLOT_COLUMN_WIDTH}px, 1fr))`,
              gridTemplateRows: `2.5rem repeat(${rooms.length}, 4rem)`,
              minWidth: ROOM_COLUMN_WIDTH + TOTAL_SLOTS * SLOT_COLUMN_WIDTH,
            }}
          >
            <div
              className="sticky top-0 left-0 z-30 flex items-center border-b border-r border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              Habitaciones
            </div>

            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="sticky top-0 z-20 flex items-center justify-center border-b border-r border-slate-200 bg-slate-50 font-mono text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                style={{ gridColumn: `${i * SLOTS_PER_HOUR + 2} / span ${SLOTS_PER_HOUR}`, gridRow: 1 }}
              >
                {formatHour(hour)}
              </div>
            ))}

            {rooms.map((room, roomIndex) => (
              <Fragment key={room.id}>
                <div
                  className="sticky left-0 z-10 flex flex-col justify-center border-b border-r border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800"
                  style={{ gridColumn: 1, gridRow: roomIndex + 2 }}
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{room.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {room.type} · Cap. {room.capacity}
                  </span>
                </div>

                {SLOTS.map((slot) => {
                  const hour = START_HOUR + slot / SLOTS_PER_HOUR
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => openNewReservation(room.id, hour)}
                      title={`Reservar ${room.name} a las ${formatHour(hour)}`}
                      className="border-b border-r border-slate-100 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:bg-indigo-100 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      style={{ gridColumn: slot + 2, gridRow: roomIndex + 2 }}
                    />
                  )
                })}

                {reservations
                  .filter((r) => r.roomId === room.id)
                  .map((res) => {
                    const block = getHourBlock(res, hourViewDate)
                    if (!block) return null

                    const startSlot = hourToSlot(block.start)
                    const endSlot = hourToSlot(block.end)
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setSelectedReservation(res)}
                        className={`m-1 flex flex-col justify-center overflow-hidden rounded-lg border px-2 py-1 text-left text-xs shadow-sm transition-transform hover:scale-[1.02] ${STATUS_STYLES[res.status]}`}
                        style={{ gridColumn: `${startSlot + 2} / ${endSlot + 2}`, gridRow: roomIndex + 2 }}
                      >
                        <span className="truncate font-semibold">{res.guest}</span>
                        <span className="truncate opacity-80">
                          {formatHour(block.start)} – {formatHour(block.end)}
                        </span>
                      </button>
                    )
                  })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {view === 'days' && (
        <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `${ROOM_COLUMN_WIDTH}px repeat(${DAY_WINDOW}, minmax(${DAY_COLUMN_WIDTH}px, 1fr))`,
              gridTemplateRows: `2.5rem repeat(${rooms.length}, 4rem)`,
              minWidth: ROOM_COLUMN_WIDTH + DAY_WINDOW * DAY_COLUMN_WIDTH,
            }}
          >
            <div
              className="sticky top-0 left-0 z-30 flex items-center border-b border-r border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              Habitaciones
            </div>

            {visibleDays.map((day, i) => (
              <div
                key={day}
                className={`sticky top-0 z-20 flex flex-col items-center justify-center border-b border-r border-slate-200 font-mono text-[11px] leading-tight dark:border-slate-700 ${
                  day === TODAY
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
                style={{ gridColumn: i + 2, gridRow: 1 }}
              >
                {formatDay(day)}
              </div>
            ))}

            {rooms.map((room, roomIndex) => (
              <Fragment key={room.id}>
                <div
                  className="sticky left-0 z-10 flex flex-col justify-center border-b border-r border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800"
                  style={{ gridColumn: 1, gridRow: roomIndex + 2 }}
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{room.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {room.type} · Cap. {room.capacity}
                  </span>
                </div>

                {visibleDays.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => openNewDateReservation(room.id, day)}
                    title={`Reservar ${room.name} desde el ${formatDay(day)}`}
                    className="border-b border-r border-slate-100 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:bg-indigo-100 dark:border-slate-800 dark:hover:bg-slate-800/60"
                    style={{ gridColumn: i + 2, gridRow: roomIndex + 2 }}
                  />
                ))}

                {reservations
                  .filter((r) => r.roomId === room.id)
                  .map((res) => {
                    const startCol = diffDays(dayViewStart, res.checkIn)
                    const endCol = diffDays(dayViewStart, res.checkOut)
                    if (endCol <= 0 || startCol >= DAY_WINDOW) return null

                    const clampedStart = Math.max(startCol, 0)
                    const clampedEnd = Math.min(endCol, DAY_WINDOW)

                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setSelectedReservation(res)}
                        className={`m-1 flex flex-col justify-center overflow-hidden rounded-lg border px-2 py-1 text-left text-xs shadow-sm transition-transform hover:scale-[1.02] ${STATUS_STYLES[res.status]}`}
                        style={{ gridColumn: `${clampedStart + 2} / ${clampedEnd + 2}`, gridRow: roomIndex + 2 }}
                      >
                        <span className="truncate font-semibold">{res.guest}</span>
                        <span className="truncate opacity-80">
                          {formatDay(res.checkIn)} – {formatDay(addDays(res.checkOut, -1))}
                        </span>
                      </button>
                    )
                  })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {selectedReservation && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{selectedReservation.guest}</p>
            <p className="text-slate-500 dark:text-slate-400">
              {rooms.find((r) => r.id === selectedReservation.roomId)?.name} ·{' '}
              {view === 'hours'
                ? `${formatDay(hourViewDate)} · ${selectedHourBlock ? `${formatHour(selectedHourBlock.start)} – ${formatHour(selectedHourBlock.end)}` : '—'}`
                : `${formatDay(selectedReservation.checkIn)} – ${formatDay(addDays(selectedReservation.checkOut, -1))}`}
              {' · '}
              <span className="font-medium">{STATUS_LABELS[selectedReservation.status]}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {view === 'days' && (
              <button
                onClick={() => viewInHours(selectedReservation)}
                className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Ver en vista por horas
              </button>
            )}
            <button
              onClick={() => openEditReservation(selectedReservation)}
              className="rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              Editar
            </button>
            <button
              onClick={() => handleCancelReservation(selectedReservation.id)}
              className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              Cancelar reserva
            </button>
            <button
              onClick={() => setSelectedReservation(null)}
              className="rounded-lg bg-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDraft(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
              {draft.id ? 'Editar reserva' : 'Nueva reserva'}
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {rooms.find((r) => r.id === draft.roomId)?.name}
              {view === 'hours' &&
                (draft.checkOut === addDays(draft.checkIn, 1)
                  ? ` · ${formatDay(draft.checkIn)}`
                  : ` · Llega ${formatDay(draft.checkIn)} · Sale ${formatDay(draft.checkOut)}`)}
            </p>

            <form onSubmit={handleSaveReservation} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Huésped
                </label>
                <input
                  autoFocus
                  value={draft.guest}
                  onChange={(e) => setDraft({ ...draft, guest: e.target.value })}
                  placeholder="Nombre del huésped"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {view === 'hours' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Inicio
                    </label>
                    <select
                      value={draft.startHour}
                      onChange={(e) => setDraft({ ...draft, startHour: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                      {START_HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {formatHour(h)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Hasta
                    </label>
                    <select
                      value={draft.endHour}
                      onChange={(e) => setDraft({ ...draft, endHour: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                      {END_HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {formatHour(h)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={draft.checkIn}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={draft.checkOut}
                      min={addDays(draft.checkIn, 1)}
                      onChange={(e) => setDraft({ ...draft, checkOut: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Estado
                </label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as ReservationStatus })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
