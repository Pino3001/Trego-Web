import { Link, useParams } from 'react-router'
import { useEffect } from 'react'
import RestauranteBanner from '../components/menu/RestauranteBanner'
import MenuSidebar from '../components/menu/MenuSidebar'
import OfertaCard from '../components/menu/OfertaCard'
import ProductoMenuCard from '../components/menu/ProductoMenuCard'
import { IconBack, IconTag } from '../components/icons'
import { useMenuRestaurante } from '../hooks/useMenuRestaurante'
import Header from '../components/body/Header.js'
import { useCarrito } from '../context/CarritoContext.jsx'

export default function RestauranteMenuPage() {
  const { id } = useParams()
  const { abrirDetalleProducto, validarRestauranteAbierto } = useCarrito()

  const {
    menu,
    cargando,
    error,
    categoria,
    setCategoria,
    ordenPrecio,
    setOrdenPrecio,
    productosFiltrados,
    ofertas,
    sinProductos,
    sinProductosEnCategoria,
  } = useMenuRestaurante(id)

  useEffect(() => {
    if (menu?.restaurante) {
      validarRestauranteAbierto(menu.restaurante.abierto)
    }
  }, [menu?.restaurante?.abierto, menu?.restaurante, validarRestauranteAbierto])

  const handleAgregar = (producto) => {
    // Paso 2 del CU: muestra detalle, cantidad, ingredientes y comentarios
    abrirDetalleProducto(producto, menu?.restaurante)
  }

  if (cargando) {
    return (
      <PageShell>
        <p className="py-16 text-center text-gray-500">Cargando menú...</p>
      </PageShell>
    )
  }

  if (error || !menu) {
    return (
      <PageShell>
        <NavBack />
        <p className="py-16 text-center text-red-600">{error ?? 'No se pudo cargar el menú'}</p>
      </PageShell>
    )
  }

  if (menu.restaurante && !menu.restaurante.habilitado) {
    return (
      <PageShell>
        <NavBack />
        <p className="py-16 text-center text-gray-600">Este restaurante no está disponible.</p>
      </PageShell>
    )
  }

  if (sinProductos) {
    return (
      <PageShell>
        <NavBack />
        <RestauranteBanner restaurante={menu.restaurante} />
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-gray-600">Este restaurante aún no ha cargado su menú</p>
          <Link
            to="/restaurantes"
            className="rounded-xl bg-trego-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Volver al listado
          </Link>
        </div>
      </PageShell>
    )
  }

  const mostrarOfertas = ofertas.length > 0 && !categoria

  return (
    <PageShell>
      <NavBack />
      <RestauranteBanner restaurante={menu.restaurante} />

      <div className="mt-5 flex flex-col gap-5 lg:mt-6 lg:flex-row lg:items-start lg:gap-6">
        <MenuSidebar
          categoria={categoria}
          onCategoriaChange={setCategoria}
          ordenPrecio={ordenPrecio}
          onOrdenChange={setOrdenPrecio}
        />

        <div className="min-w-0 flex-1">
          {mostrarOfertas && (
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-[17px] font-bold text-gray-900">
                <IconTag className="h-5 w-5 text-trego-orange" />
                Ofertas del dia
              </h2>
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 scrollbar-thin">
                {ofertas.map((p) => (
                  <OfertaCard key={p.idProducto} producto={p} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-[17px] font-bold text-gray-900">Todos los Productos</h2>

            {sinProductosEnCategoria ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
                No hay productos disponibles en esta categoría
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {productosFiltrados.map((p) => (
                  <li key={p.idProducto}>
                    <ProductoMenuCard producto={p} onAgregar={handleAgregar} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Header busqueda="" onBusquedaChange={() => {}} onBuscar={() => {}} onAbrirFiltros={() => {}} />
      <main className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 sm:py-4">{children}</main>
    </div>
  )
}

function NavBack() {
  return (
    <Link
      to="/restaurantes"
      className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-800 hover:text-trego-orange"
    >
      <IconBack className="h-5 w-5" />
      Lista de Restaurantes
    </Link>
  )
}
