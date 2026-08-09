import { useNavigate, useParams } from 'react-router-dom'
import { RoomForm } from '../components/RoomForm'
import { useActualizarRoom, useRoom, useCrearRoom } from '../hooks/useRooms'
import type { RoomInput } from '../types/room'

export function RoomFormPage() {
  const { id } = useParams<{ id: string }>()
  const esEdicion = id !== undefined

  const navigate = useNavigate()
  const { data: room, isLoading } = useRoom(id)
  const crearRoom = useCrearRoom()
  const actualizarRoom = useActualizarRoom()

  const enviando = crearRoom.isPending || actualizarRoom.isPending

  const manejarSubmit = (valores: RoomInput) => {
    if (esEdicion && id !== undefined) {
      actualizarRoom.mutate({ id, room: valores }, { onSuccess: () => navigate('/rooms') })
    } else {
      crearRoom.mutate(valores, { onSuccess: () => navigate('/rooms') })
    }
  }

  if (esEdicion && isLoading) {
    return <p className="p-6 text-slate-500">Cargando habitación...</p>
  }

  return (
    <div className="p-6">
      <div className="mx-auto mb-6 flex max-w-2xl items-center">
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Regresar
        </button>
      </div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900 dark:text-white">
        {esEdicion ? 'Editar habitación' : 'Nueva habitación'}
      </h1>
      <RoomForm roomInicial={room} onSubmit={manejarSubmit} enviando={enviando} />
    </div>
  )
}
