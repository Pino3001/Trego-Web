import { useCallback, useEffect, useState } from 'react'
import Header from '../components/Header'
import FiltersModal from '../components/FiltersModal'
import LocationPrompt from '../components/LocationPrompt'
import EmptyState from '../components/EmptyState'
import SectionRow from '../components/SectionRow'
import RestaurantCard from '../components/RestaurantCard'
import ProductCard from '../components/ProductCard'
import { IconRefresh } from '../components/icons'
import { useGeolocation } from '../hooks/useGeolocation'
import { useRestaurantes } from '../hooks/useRestaurantes'
import { mockPlatosDestacados } from '../data/mockRestaurantes'

export default function HomePage() {
  const geo = useGeolocation(false)
  const {
    restaurantes,
    filtros,
    cargando,
    modoBusqueda,
    cargarZona,
    buscar,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  } = useRestaurantes()

  const [busqueda, setBusqueda] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [mostrarPromptUbicacion, setMostrarPromptUbicacion] = useState(true)
  const [ubicacionCancelada, setUbicacionCancelada] = useState(false)

  const iniciarCarga = useCallback(() => {
    if (geo.tieneUbicacion) {
      cargarZona(geo.coords)
    }
  }, [geo.tieneUbicacion, geo.coords, cargarZona])

  useEffect(() => {
    if (geo.estado === 'idle') {
      setMostrarPromptUbicacion(true)
      return
    }
    if (geo.ubicacionDenegada) {
      setMostrarPromptUbicacion(false)
      return
    }
    if (geo.tieneUbicacion) {
      setMostrarPromptUbicacion(false)
      iniciarCarga()
    }
  }, [geo.estado, geo.ubicacionDenegada, geo.tieneUbicacion, iniciarCarga])

  const handleActivarUbicacion = () => {
    setMostrarPromptUbicacion(false)
    geo.solicitar()
  }

  const handleCancelarUbicacion = () => {
    setMostrarPromptUbicacion(false)
    setUbicacionCancelada(true)
  }

  const handleBuscar = () => {
    if (!geo.tieneUbicacion) return
    if (busqueda.trim()) {
      buscar(geo.coords, busqueda)
    } else {
      cargarZona(geo.coords)
    }
  }

  const handleRecargar = () => {
    if (geo.tieneUbicacion) recargar(geo.coords)
  }

  const ofertas = restaurantes.filter((r) => r.tieneOfertas)
  const listaPrincipal = restaurantes

  const sinUbicacion =
    (geo.ubicacionDenegada || ubicacionCancelada) && !geo.tieneUbicacion
  const vacio = geo.tieneUbicacion && !cargando && listaPrincipal.length === 0

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onBuscar={handleBuscar}
        onAbrirFiltros={() => setFiltrosAbiertos(true)}
        abrirPerfil={true}
      />

      <main className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-6">
        {cargando && (
          <p className="mb-4 text-center text-sm text-gray-500">Cargando restaurantes...</p>
        )}

        {sinUbicacion && (
          <EmptyState mensaje="No hay nada para mostrar" />
        )}

        {geo.tieneUbicacion && !sinUbicacion && (
          <>
            {ofertas.length > 0 && (
              <SectionRow
                titulo="Las Ofertas de Hoy"
                accion={<LinkMas />}
              >
                {ofertas.slice(0, 4).map((r) => (
                  <RestaurantCard key={r.idUsuario} restaurante={r} modoBusqueda={modoBusqueda} />
                ))}
              </SectionRow>
            )}

            <SectionRow titulo="Descubre los Mejores Platos" accion={<LinkMas />}>
              {mockPlatosDestacados.map((p) => (
                <ProductCard key={p.idProducto} plato={p} />
              ))}
            </SectionRow>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <h2 className="text-[17px] font-bold text-gray-900">
                  Lista de Restaurantes
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRecargar}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                    title="Recargar lista"
                  >
                    <IconRefresh className="w-4 h-4" />
                    Recargar
                  </button>
                  <LinkMas />
                </div>
              </div>

              {vacio ? (
                <EmptyState
                  mensaje="No hay nada para mostrar"
                  onLimpiarFiltros={
                    hayFiltrosActivos || modoBusqueda
                      ? () => {
                          setBusqueda('')
                          limpiarFiltros(geo.coords)
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {listaPrincipal.map((r) => (
                    <RestaurantCard
                      key={r.idUsuario}
                      restaurante={r}
                      modoBusqueda={modoBusqueda}
                      enGrid
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {mostrarPromptUbicacion && !geo.tieneUbicacion && !geo.ubicacionDenegada && (
        <LocationPrompt
          onActivar={handleActivarUbicacion}
          onCancelar={handleCancelarUbicacion}
        />
      )}

      {geo.cargandoUbicacion && !geo.tieneUbicacion && (
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          Obteniendo ubicación...
        </p>
      )}

      <FiltersModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        onCerrar={() => setFiltrosAbiertos(false)}
        onAplicar={(nuevos) => geo.tieneUbicacion && aplicarFiltros(geo.coords, nuevos)}
      />
    </div>
  )
}

function LinkMas() {
  return (
    <button
      type="button"
      className="text-[13px] font-medium text-gray-500 hover:text-trego-orange"
    >
      Mostrar Mas &gt;
    </button>
  )
}
