import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Customer, CustomerInput } from '../types/customer'

const customerSchema = z.object({
  nombres: z.string().min(2, 'Ingresa al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Ingresa al menos 2 caracteres'),
  documentType: z.enum(['DNI', 'Pasaporte', 'CE']),
  numeroDocumento: z.string().min(5, 'Documento inválido').max(20),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(6, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Dirección muy corta'),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customerInicial?: Customer
  onSubmit: (valores: CustomerInput) => void
  enviando: boolean
}

export function CustomerForm({ customerInicial, onSubmit, enviando }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerInicial ?? {
      nombres: '',
      apellidos: '',
      documentType: 'DNI',
      numeroDocumento: '',
      fechaNacimiento: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombres" error={errors.nombres?.message}>
          <input {...register('nombres')} className={inputClass} />
        </Campo>

        <Campo label="Apellidos" error={errors.apellidos?.message}>
          <input {...register('apellidos')} className={inputClass} />
        </Campo>

        <Campo label="Tipo de documento" error={errors.documentType?.message}>
          <select {...register('documentType')} className={inputClass}>
            <option value="DNI">DNI</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="CE">Carné de extranjería</option>
          </select>
        </Campo>

        <Campo label="Número de documento" error={errors.numeroDocumento?.message}>
          <input {...register('numeroDocumento')} className={inputClass} />
        </Campo>

        <Campo label="Fecha de nacimiento" error={errors.fechaNacimiento?.message}>
          <input type="date" {...register('fechaNacimiento')} className={inputClass} />
        </Campo>

        <Campo label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className={inputClass} />
        </Campo>

        <Campo label="Teléfono" error={errors.telefono?.message}>
          <input {...register('telefono')} className={inputClass} />
        </Campo>

        <Campo label="Dirección" error={errors.direccion?.message}>
          <input {...register('direccion')} className={inputClass} />
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
