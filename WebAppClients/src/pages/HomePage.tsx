import reactLogo from '../assets/react.svg'

export function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <img src={reactLogo} alt="Tecnología" className="h-24 w-24" />
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">HomePage</h1>
    </div>
  )
}
