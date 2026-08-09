import { Link } from 'react-router-dom'
import { useRooms, useEliminarRoom } from '../hooks/useRooms'

export function RoomsListPage() {
  const { data: rooms, isLoading, isError } = useRooms()
  const eliminarRoom = useEliminarRoom()

  const manejarEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar la habitación ${nombre}?`)) {
      eliminarRoom.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Habitaciones</h1>
        <Link
          to="/rooms/nuevo"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          + Nueva habitación
        </Link>
      </div>

      {isLoading && <p className="text-slate-500">Cargando habitaciones...</p>}
      {isError && <p className="text-red-600">No se pudo conectar con el API.</p>}

      {rooms && rooms.length === 0 && (
        <p className="text-slate-500">Todavía no hay habitaciones registradas.</p>
      )}

      {rooms && rooms.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Capacidad</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {rooms.map((room) => (
                <tr key={room.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3">{room.id}</td>
                  <td className="px-4 py-3">{room.name}</td>
                  <td className="px-4 py-3">{room.type}</td>
                  <td className="px-4 py-3">{room.capacity}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/rooms/${room.id}/editar`} className="mr-3 text-indigo-600 hover:underline">
                      Editar
                    </Link>
                    <button
                      onClick={() => manejarEliminar(room.id, room.name)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
