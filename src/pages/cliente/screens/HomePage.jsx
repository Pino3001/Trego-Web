import { useEffect, useMemo, useState } from "react";
import FiltersModal from "../../../components/FiltersModal.jsx";
import LocationPrompt from "../../../components/LocationPrompt.jsx";
import EmptyState from "../../../components/EmptyState.jsx";
import SectionRow from "../../../components/SectionRow.jsx";
import RestaurantCard from "../../../components/RestaurantCard.jsx";
import { IconRefresh } from "../../../components/icons.jsx";
import {
  leerPrefUbicacion,
  ubicacionPromptYaRespondido,
  useGeolocation,
} from "../../../hooks/useGeolocation.js";
import { useRestaurantes } from "../../../hooks/useRestaurantes.js";
import { useFiltros } from "../../../context/FiltrosContext.js";
import { useBusqueda } from "../../../context/BusquedaContext.js";
import { useDebounce } from "../../../hooks/useDebounce.js";

export default function HomePage() {
  const geo = useGeolocation(false);
  const {
    restaurantes,
    filtros,
    cargando,
    error,
    modoBusqueda,
    cargarZona,
    buscar,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  } = useRestaurantes();
  const { filtrosAbiertos, cerrarFiltros } = useFiltros();

  // 1. Buscador con Debounce
  const { busqueda, setBusqueda } = useBusqueda({
    placeholder: "Buscar restaurante...",
  });
  const debouncedBusqueda = useDebounce(busqueda, 500);

  // 2. Manejo de Ubicación SIN useEffect (Elimina el warning de setState)
  const [ubicacionCancelada, setUbicacionCancelada] = useState(
    () => !!leerPrefUbicacion()?.rechazado,
  );
  const [promptOcultoManualmente, setPromptOcultoManualmente] = useState(false);

  // Derivamos el valor al vuelo. Si cambia alguna de estas variables, React lo recalcula solo.
  const mostrarPromptUbicacion =
    !promptOcultoManualmente &&
    !geo.tieneUbicacion &&
    !geo.ubicacionDenegada &&
    !ubicacionCancelada &&
    !ubicacionPromptYaRespondido();

  // 3. Cálculos de listas
  const destacados = useMemo(
    () =>
      [...restaurantes]
        .sort((a, b) => (b.calificacionProm ?? 0) - (a.calificacionProm ?? 0))
        .slice(0, 4),
    [restaurantes],
  );

  const ofertas = restaurantes.filter((r) => r.tieneOfertas);
  const listaPrincipal = restaurantes;

  // 4. El "Motor" de búsqueda y carga inicial reactivo al Debounce
  useEffect(() => {
    if (!geo.tieneUbicacion) return;

    if (debouncedBusqueda.trim()) {
      buscar(geo.coords, debouncedBusqueda.trim());
    } else {
      cargarZona(geo.coords);
    }
  }, [geo.tieneUbicacion, geo.coords, debouncedBusqueda, buscar, cargarZona]);

  // 5. Funciones de Interacción (Handlers)
  const handleActivarUbicacion = () => {
    setPromptOcultoManualmente(true); // Oculta nuestro cartel para no estorbar al del navegador
    geo.solicitar();
  };

  const handleCancelarUbicacion = () => {
    setUbicacionCancelada(true); // Actualiza el estado derivado automáticamente a false
    geo.marcarPromptRechazado();
  };

  const handleRecargar = () => {
    if (geo.tieneUbicacion) recargar(geo.coords);
  };

  // 6. Estados UI finales
  const sinUbicacion =
    (geo.ubicacionDenegada || ubicacionCancelada) && !geo.tieneUbicacion;
  const vacio =
    geo.tieneUbicacion && !cargando && !error && listaPrincipal.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-400 px-4 py-5 sm:px-6 sm:py-6">
        {cargando && (
          <p className="mb-4 text-center text-sm text-gray-500">
            Cargando restaurantes...
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
            {ofertas.length > 0 && (
              <SectionRow titulo="Las Ofertas de Hoy" accion={<LinkMas />}>
                {ofertas.slice(0, 4).map((r) => (
                  <RestaurantCard
                    key={r.idRestaurante}
                    restaurante={r}
                    modoBusqueda={modoBusqueda}
                  />
                ))}
              </SectionRow>
            )}

            {destacados.length > 0 && (
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
        onAplicar={(nuevos) =>
          geo.tieneUbicacion && aplicarFiltros(geo.coords, nuevos)
        }
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
