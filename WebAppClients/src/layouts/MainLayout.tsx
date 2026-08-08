import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`

export function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-6 px-4 text-lg font-semibold text-slate-900 dark:text-white">
          WebAppClients
        </h2>
        <nav className="space-y-1">
          <NavLink to="/" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/clientes" className={navLinkClass}>
            Clientes
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
