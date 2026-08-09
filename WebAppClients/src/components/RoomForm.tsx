import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Room, RoomInput } from '../types/room'

const roomSchema = z.object({
  id: z.string().min(1, 'Requerido').max(20),
  name: z.string().min(2, 'Ingresa al menos 2 caracteres').max(100),
  type: z.string().min(2, 'Ingresa al menos 2 caracteres').max(50),
  capacity: z.number().int().min(1, 'Debe ser al menos 1'),
})

type RoomFormValues = z.infer<typeof roomSchema>

interface RoomFormProps {
  roomInicial?: Room
  onSubmit: (valores: RoomInput) => void
  enviando: boolean
}

export function RoomForm({ roomInicial, onSubmit, enviando }: RoomFormProps) {
  const esEdicion = roomInicial !== undefined
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: roomInicial ?? {
      id: '',
      name: '',
      type: '',
      capacity: 1,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Número / ID de habitación" error={errors.id?.message}>
          <input {...register('id')} disabled={esEdicion} className={`${inputClass} disabled:opacity-60`} />
        </Campo>

        <Campo label="Nombre" error={errors.name?.message}>
          <input {...register('name')} className={inputClass} />
        </Campo>

        <Campo label="Tipo" error={errors.type?.message}>
          <input {...register('type')} placeholder="Sencilla, Doble, Suite..." className={inputClass} />
        </Campo>

        <Campo label="Capacidad" error={errors.capacity?.message}>
          <input
            type="number"
            min={1}
            {...register('capacity', { valueAsNumber: true })}
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
