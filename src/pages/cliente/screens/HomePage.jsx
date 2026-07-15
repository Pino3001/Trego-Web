import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FiltersModal from "../../../components/FiltersModal.jsx";
import LocationPrompt from "../../../components/LocationPrompt.jsx";
import EmptyState from "../../../components/EmptyState.jsx";
import SectionRow from "../../../components/SectionRow.jsx";
import RestaurantCard from "../../../components/RestaurantCard.jsx";
import OfertaPlatoCard from "../../../components/OfertaPlatoCard.jsx";
import OrdenamientoSelect from "../../../components/OrdenamientoSelect.jsx";
import {
  leerPrefUbicacion,
  ubicacionPromptYaRespondido,
  useGeolocation,
} from "../../../hooks/useGeolocation.js";
import { useRestaurantes } from "../../../hooks/useRestaurantes.js";
import { useFiltros } from "../../../context/FiltrosContext.js";
import { useBusqueda } from "../../../context/BusquedaContext.js";
import { useDebounce } from "../../../hooks/useDebounce.ts";
import Footer from "../../../components/body/Footer.js";
import { useNavigate } from "react-router";

function SeccionEncabezado({ titulo, subtitulo, acciones }) {
  return (
    <header className="mb-3 flex flex-col gap-3 px-0.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-gray-900 sm:text-[17px]">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="mt-0.5 text-xs text-gray-500 sm:text-[13px]">
            {subtitulo}
          </p>
        )}
      </div>
      {acciones ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {acciones}
        </div>
      ) : null}
    </header>
  );
}

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

  const restaurantesRef = useRef(restaurantes);
  useEffect(() => {
    restaurantesRef.current = restaurantes;
  }, [restaurantes]);

  // --- ESTADOS DE CARGA CONTEXTUALES (Evita el desfase visual) ---
  const esCargaInicialPagina =
    cargando && !modoBusqueda && restaurantes.length === 0;
  const esActualizacionSilenciosa =
    cargando && !modoBusqueda && restaurantes.length > 0;

  const esCargaInicialBusqueda =
    cargando && modoBusqueda && resultadosBusquedaPlato.length === 0;
  const esActualizacionBusquedaSilenciosa =
    cargando && modoBusqueda && resultadosBusquedaPlato.length > 0;

  const destacados = useMemo(() => restaurantes.slice(0, 4), [restaurantes]);
  const listaPrincipal = restaurantes;

  const latitud = geo.coords?.latitud;
  const longitud = geo.coords?.longitud;

  useEffect(() => {
    // Verificamos que tengamos la ubicación y las coordenadas cargadas
    if (!geo.tieneUbicacion || latitud === undefined || longitud === undefined)
      return;

    const coordsSeguras = { latitud, longitud };
    const termino = debouncedBusqueda.trim();

    if (termino) {
      buscarPlato(coordsSeguras, termino);
    } else {
      cargarZona(coordsSeguras);
    }
  }, [
    geo.tieneUbicacion,
    latitud,
    longitud,
    debouncedBusqueda,
    buscarPlato,
    cargarZona,
  ]);

  const handleActivarUbicacion = () => {
    setPromptOcultoManualmente(true);
    geo.solicitar();
  };

  const handleCancelarUbicacion = () => {
    setUbicacionCancelada(true);
    geo.marcarPromptRechazado();
  };

  const navigate = useNavigate();

  const handleSeleccionarOferta = useCallback(
    (oferta) => {
      // Viajamos a la página del restaurante y pasamos el id del producto en la URL
      navigate(
        `/restaurante/${oferta.idRestaurante}?abrirOferta=${oferta.producto.idProducto}`,
      );
    },
    [navigate],
  );

  const sinUbicacion =
    (geo.ubicacionDenegada || ubicacionCancelada) && !geo.tieneUbicacion;

  const vacioBusqueda =
    modoBusqueda && !cargando && !error && resultadosBusquedaPlato.length === 0;

  const vacioLista =
    !modoBusqueda &&
    geo.tieneUbicacion &&
    !cargando &&
    !error &&
    listaPrincipal.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <div className="flex-1 mx-auto w-full max-w-400 px-3 py-4 sm:px-6 sm:py-6">
        {/* Notificaciones de actualización silenciosa en segundo plano */}
        {esActualizacionSilenciosa && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-2 text-xs font-medium text-blue-700 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Actualizando comercios de la zona...
          </div>
        )}

        {esActualizacionBusquedaSilenciosa && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-2 text-xs font-medium text-blue-700 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Actualizando resultados de búsqueda...
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-center text-sm text-red-700 sm:px-4">
            {error}
          </p>
        )}

        {sinUbicacion && <EmptyState mensaje="No hay nada para mostrar" />}

        {geo.tieneUbicacion && !sinUbicacion && (
          <>
            {esCargaInicialPagina ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
                  Buscando los locales y ofertas más cercanos...
                </p>
              </div>
            ) : (
              <>
                {/* --- SECCIÓN BÚSQUEDA --- */}
                {modoBusqueda && (
                  <section className="mb-6 sm:mb-7">
                    <SeccionEncabezado
                      titulo={`Restaurantes con "${terminoBusqueda || busqueda}"`}
                      subtitulo="Locales en tu zona que coinciden con tu búsqueda"
                      acciones={
                        <OrdenamientoSelect
                          value={filtros.ordenamiento}
                          onChange={setOrdenamiento}
                        />
                      }
                    />

                    {esCargaInicialBusqueda ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-orange-500 border-t-transparent"></div>
                        <p className="mt-3 text-xs text-gray-500 animate-pulse">
                          Buscando platos en el menú...
                        </p>
                      </div>
                    ) : vacioBusqueda ? (
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
                      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
                        {resultadosBusquedaPlato.map(
                          ({ restaurante, productos }) => (
                            <RestaurantCard
                              key={restaurante.idUsuario}
                              restaurante={restaurante}
                              modoBusqueda={modoBusqueda}
                              productosCoincidentes={productos}
                              enGrid
                            />
                          ),
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* --- SECCIÓN MEJORES OFERTAS --- */}
                {(cargandoOfertas || mejoresOfertas.length > 0) && (
                  <section className="mb-6 sm:mb-7">
                    <SeccionEncabezado
                      titulo="Mejores ofertas"
                      subtitulo="Platos en promoción en tu zona"
                      acciones={
                        <OrdenamientoSelect
                          value={filtros.ordenamiento}
                          onChange={setOrdenamiento}
                        />
                      }
                    />

                    {cargandoOfertas && mejoresOfertas.length === 0 ? (
                      <div className="flex justify-center py-6">
                        <p className="text-sm text-gray-400 animate-pulse">
                          Cargando ofertas…
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2 scrollbar-gutter-stable sm:hidden">
                          {mejoresOfertas.map((oferta) => (
                            <OfertaPlatoCard
                              key={`${oferta.idRestaurante}-${oferta.producto?.idProducto}`}
                              oferta={oferta}
                              onSeleccionar={handleSeleccionarOferta}
                            />
                          ))}
                        </div>
                        <div className="hidden grid-cols-3 gap-3 sm:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                          {mejoresOfertas.map((oferta) => (
                            <OfertaPlatoCard
                              key={`grid-${oferta.idRestaurante}-${oferta.producto?.idProducto}`}
                              oferta={oferta}
                              enGrid
                              onSeleccionar={handleSeleccionarOferta}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                )}

                {/* --- SECCIÓN DESTACADOS --- */}
                {!modoBusqueda && destacados.length > 0 && (
                  <SectionRow titulo="Descubre los Mejores Platos">
                    {destacados.map((r) => (
                      <RestaurantCard
                        key={`destacado-${r.idUsuario}`}
                        restaurante={r}
                        modoBusqueda={modoBusqueda}
                      />
                    ))}
                  </SectionRow>
                )}

                {/* --- SECCIÓN LISTA GENERAL --- */}
                {!modoBusqueda && (
                  <section>
                    <SeccionEncabezado
                      titulo="Lista de Restaurantes"
                      acciones={
                        <OrdenamientoSelect
                          value={filtros.ordenamiento}
                          onChange={setOrdenamiento}
                        />
                      }
                    />

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
                      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
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
        <p className="fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-center text-sm text-white">
          Obteniendo ubicación...
        </p>
      )}

      <FiltersModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        onCerrar={cerrarFiltros}
        onAplicar={(nuevos) => aplicarFiltros(nuevos)}
      />
      <Footer />
    </div>
  );
}
