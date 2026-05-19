import tregoLogo from '../assets/tregoicon.png'
import { IconCart, IconMenu, IconSearch, IconUser } from './icons'

export default function Header({
  busqueda,
  onBusquedaChange,
  onBuscar,
  onAbrirFiltros,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onBuscar?.()
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <img
          src={tregoLogo}
          alt="Trego"
          className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
        />

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1">
          <div className="flex h-11 w-full items-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:h-12">
            <button
              type="button"
              onClick={onAbrirFiltros}
              className="flex h-full w-11 shrink-0 items-center justify-center text-gray-700 hover:bg-gray-50"
              aria-label="Aplicar filtros"
              title="Aplicar filtros"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Buscar Producto"
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="flex h-full w-11 shrink-0 items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Buscar"
            >
              <IconSearch className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-trego-cart shadow-sm sm:h-11 sm:w-11"
            aria-label="Carrito"
          >
            <IconCart className="h-5 w-5 text-white" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-trego-profile shadow-sm sm:h-11 sm:w-11"
            aria-label="Perfil"
          >
            <IconUser className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-trego-orange" />
    </header>
  )
}
