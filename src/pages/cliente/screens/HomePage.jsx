import { useEffect, useMemo, useState } from "react";
import FiltersModal from "../../../components/FiltersModal.jsx";
import LocationPrompt from "../../../components/LocationPrompt.jsx";
import EmptyState from "../../../components/EmptyState.jsx";
import SectionRow from "../../../components/SectionRow.jsx";
import RestaurantCard from "../../../components/RestaurantCard.jsx";
import OfertaPlatoCard from "../../../components/OfertaPlatoCard.jsx";
import OrdenamientoSelect from "../../../components/OrdenamientoSelect.jsx";
import { IconRefresh } from "../../../components/icons.jsx";
import {
  leerPrefUbicacion,
  ubicacionPromptYaRespondido,
  useGeolocation,
} from "../../../hooks/useGeolocation.js";
import { useRestaurantes } from "../../../hooks/useRestaurantes.js";
import { useFiltros } from "../../../context/FiltrosContext.js";
import { useBusqueda } from "../../../context/BusquedaContext.js";
import { useDebounce } from "../../../hooks/useDebounce.ts";

export default function HomePage() {
  const geo = useGeolocation(false);
  const {
    restaurantes,
    resultadosBusquedaPlato,
    mejoresOfertas,
    filtros,
    cargando,
    cargandoOfertas,
    error,
    modoBusqueda,
    terminoBusqueda,
    cargarZona,
    buscarPlato,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    setOrdenamiento,
    hayFiltrosActivos,
  } = useRestaurantes();
  const { filtrosAbiertos, cerrarFiltros } = useFiltros();

  const { busqueda, setBusqueda } = useBusqueda({
    placeholder: "Buscar producto o restaurante",
  });
  const debouncedBusqueda = useDebounce(busqueda, 500);

  const [ubicacionCancelada, setUbicacionCancelada] = useState(
    () => !!leerPrefUbicacion()?.rechazado,
  );
  const [promptOcultoManualmente, setPromptOcultoManualmente] = useState(false);

  const mostrarPromptUbicacion =
    !promptOcultoManualmente &&
    !geo.tieneUbicacion &&
    !geo.ubicacionDenegada &&
    !ubicacionCancelada &&
    !ubicacionPromptYaRespondido();

  const destacados = useMemo(
    () =>
      [...restaurantes]
        .sort((a, b) => (b.calificacionProm ?? 0) - (a.calificacionProm ?? 0))
        .slice(0, 4),
    [restaurantes],
  );

  const listaPrincipal = restaurantes;

  useEffect(() => {
    if (!geo.tieneUbicacion || !geo.coords) return

    const termino = debouncedBusqueda.trim()
    if (termino) {
      buscarPlato(geo.coords, termino)
    } else {
      cargarZona(geo.coords)
    }
    // buscarPlato y cargarZona son estables (useCallback con deps fijas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    geo.tieneUbicacion,
    geo.coords?.latitud,
    geo.coords?.longitud,
    debouncedBusqueda,
  ])

  const handleActivarUbicacion = () => {
    setPromptOcultoManualmente(true);
    geo.solicitar();
  };

  const handleCancelarUbicacion = () => {
    setUbicacionCancelada(true);
    geo.marcarPromptRechazado();
  };

  const handleRecargar = () => {
    if (geo.tieneUbicacion) recargar(geo.coords);
  };

  const sinUbicacion =
    (geo.ubicacionDenegada || ubicacionCancelada) && !geo.tieneUbicacion;

  const vacioBusqueda =
    modoBusqueda &&
    !cargando &&
    !error &&
    resultadosBusquedaPlato.length === 0;

  const vacioLista =
    !modoBusqueda &&
    geo.tieneUbicacion &&
    !cargando &&
    !error &&
    listaPrincipal.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-400 px-4 py-5 sm:px-6 sm:py-6">
        {cargando && (
          <p className="mb-4 text-center text-sm text-gray-500">
            {modoBusqueda
              ? `Buscando "${terminoBusqueda}"…`
              : "Cargando restaurantes..."}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {sinUbicacion && <EmptyState mensaje="No hay nada para mostrar" />}

        {geo.tieneUbicacion && !sinUbicacion && (
          <>
            {modoBusqueda && (
              <section className="mb-7">
                <header className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900">
                      Restaurantes con &quot;{terminoBusqueda}&quot;
                    </h2>
                    <p className="text-[13px] text-gray-500">
                      Locales en tu zona que coinciden con tu búsqueda
                    </p>
                  </div>
                  <OrdenamientoSelect
                    value={filtros.ordenamiento}
                    onChange={setOrdenamiento}
                  />
                </header>

                {vacioBusqueda ? (
                  <EmptyState
                    mensaje={`Ningún restaurante en tu zona coincide con "${terminoBusqueda}"`}
                    onLimpiarFiltros={
                      hayFiltrosActivos || busqueda.trim()
                        ? () => {
                            setBusqueda("");
                            limpiarFiltros(geo.coords);
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {resultadosBusquedaPlato.map(({ restaurante, productos }) => (
                      <RestaurantCard
                        key={restaurante.idUsuario}
                        restaurante={restaurante}
                        modoBusqueda={modoBusqueda}
                        productosCoincidentes={productos}
                        enGrid
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="mb-7">
              <header className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-[17px] font-bold text-gray-900">
                    Mejores ofertas
                  </h2>
                  <p className="text-[13px] text-gray-500">
                    Platos en promoción en tu zona
                  </p>
                </div>
                <OrdenamientoSelect
                  value={filtros.ordenamiento}
                  onChange={setOrdenamiento}
                />
              </header>

              {cargandoOfertas && mejoresOfertas.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  Cargando ofertas…
                </p>
              )}

              {!cargandoOfertas && mejoresOfertas.length === 0 && (
                <EmptyState mensaje="No hay ofertas activas en tu zona por ahora" />
              )}

              {mejoresOfertas.length > 0 && (
                <div className="-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2 [scrollbar-gutter:stable]">
                  {mejoresOfertas.map((oferta) => (
                    <OfertaPlatoCard
                      key={`${oferta.idRestaurante}-${oferta.producto?.idProducto}`}
                      oferta={oferta}
                    />
                  ))}
                </div>
              )}
            </section>

            {!modoBusqueda && destacados.length > 0 && (
              <SectionRow
                titulo="Descubre los Mejores Platos"
                accion={<LinkMas />}
              >
                {destacados.map((r) => (
                  <RestaurantCard
                    key={`destacado-${r.idUsuario}`}
                    restaurante={r}
                    modoBusqueda={modoBusqueda}
                  />
                ))}
              </SectionRow>
            )}

            {!modoBusqueda && (
              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <h2 className="text-[17px] font-bold text-gray-900">
                    Lista de Restaurantes
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrdenamientoSelect
                      value={filtros.ordenamiento}
                      onChange={setOrdenamiento}
                    />
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

                {vacioLista ? (
                  <EmptyState
                    mensaje="No hay nada para mostrar"
                    onLimpiarFiltros={
                      hayFiltrosActivos
                        ? () => {
                            setBusqueda("");
                            limpiarFiltros(geo.coords);
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
            )}
          </>
        )}
      </div>

      {mostrarPromptUbicacion &&
        !geo.tieneUbicacion &&
        !geo.ubicacionDenegada && (
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
        onCerrar={cerrarFiltros}
        onAplicar={(nuevos) => aplicarFiltros(nuevos)}
      />
    </div>
  );
}

function LinkMas() {
  return (
    <button
      type="button"
      className="text-[13px] font-medium text-gray-500 hover:text-trego-orange"
    >
      Mostrar Mas &gt;
    </button>
  );
}
