import { useCallback, useEffect, useMemo, useState } from "react";
import FiltersModal from "../../components/FiltersModal.jsx";
import LocationPrompt from "../../components/LocationPrompt.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Header from "../../components/body/Header.js";
import {
  leerPrefUbicacion,
  ubicacionPromptYaRespondido,
  useGeolocation,
} from "../../hooks/useGeolocation.js";
import { useRestaurantesCliente, type FiltrosRestauranteCliente } from "../../hooks/useRestaurantesCliente.js";
import { IconRefresh } from "../../components/icons.jsx";
import RestauranteClienteCard from "../../components/cliente/RestauranteClienteCard.js";

const DEBOUNCE_MS = 400;

export default function ListarRestaurantesClientePage() {
  const geo = useGeolocation(false);
  const {
    restaurantes,
    filtros,
    cargando,
    error,
    modo,
    buscarPorNombre,
    cargarPorDireccion,
    cargarTodos,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  } = useRestaurantesCliente();

  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [mostrarPromptUbicacion, setMostrarPromptUbicacion] = useState(
    () => !ubicacionPromptYaRespondido(),
  );
  const [ubicacionCancelada, setUbicacionCancelada] = useState(
    () => !!leerPrefUbicacion()?.rechazado,
  );

  const metricas = useMemo(() => {
    const total = restaurantes.length;
    const abiertos = restaurantes.filter((r) => r.abierto).length;
    return { total, abiertos, cerrados: total - abiertos };
  }, [restaurantes]);

  useEffect(() => {
    const termino = busqueda.trim();
    if (!termino) return;

    const timer = window.setTimeout(() => {
      buscarPorNombre(termino);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [busqueda, buscarPorNombre]);

  useEffect(() => {
    if (!busqueda.trim() && modo === "nombre") {
      cargarTodos();
    }
  }, [busqueda, modo, cargarTodos]);

  const filtrarPorZona = useCallback(() => {
    if (!geo.tieneUbicacion || !geo.coords) return;
    cargarPorDireccion({
      calle: "",
      numero: "",
      apartamento: "",
      esquina: "",
      latitud: geo.coords.latitud,
      longitud: geo.coords.longitud,
    });
  }, [geo.tieneUbicacion, geo.coords, cargarPorDireccion]);

  useEffect(() => {
    if (geo.tieneUbicacion) {
      setMostrarPromptUbicacion(false);
    } else if (
      geo.ubicacionDenegada ||
      ubicacionCancelada ||
      ubicacionPromptYaRespondido()
    ) {
      setMostrarPromptUbicacion(false);
    }
  }, [geo.ubicacionDenegada, geo.tieneUbicacion, ubicacionCancelada]);

  const handleActivarUbicacion = () => {
    setMostrarPromptUbicacion(false);
    geo.solicitar();
  };

  const handleCancelarUbicacion = () => {
    setMostrarPromptUbicacion(false);
    setUbicacionCancelada(true);
    geo.marcarPromptRechazado();
  };

  const handleBuscar = () => {
    if (busqueda.trim()) {
      buscarPorNombre(busqueda);
    } else {
      cargarTodos();
    }
  };

  const vacio = !cargando && !error && restaurantes.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onBuscar={handleBuscar}
        onAbrirFiltros={() => setFiltrosAbiertos(true)}
        abrirPerfil
      />

      <main className="mx-auto max-w-275 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Explorar restaurantes
            </h1>
            <p className="text-sm text-gray-500">
              Buscá por nombre o filtrá los que reparten en tu zona
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={filtrarPorZona}
              disabled={!geo.tieneUbicacion || cargando}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              En mi zona
            </button>
            <button
              type="button"
              onClick={() => recargar()}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <IconRefresh className="h-4 w-4" />
              Recargar
            </button>
          </div>
        </div>

        {!geo.tieneUbicacion && !ubicacionCancelada && !geo.ubicacionDenegada && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Activá tu ubicación para ver restaurantes que reparten en tu zona.
          </p>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Metrica label="Disponibles" valor={metricas.total} />
          <Metrica label="Abiertos" valor={metricas.abiertos} />
          <Metrica label="Cerrados" valor={metricas.cerrados} />
        </div>

        {cargando && (
          <p className="mb-4 text-center text-sm text-gray-500">
            Cargando restaurantes…
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {vacio ? (
          <EmptyState
            mensaje="No hay restaurantes para mostrar"
            onLimpiarFiltros={
              hayFiltrosActivos || busqueda.trim()
                ? () => {
                    setBusqueda("");
                    limpiarFiltros();
                    cargarTodos();
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {restaurantes.map((r) => (
              <RestauranteClienteCard
                key={r.idRestaurante ?? r.nombre}
                restaurante={r}
              />
            ))}
          </div>
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
          Obteniendo ubicación…
        </p>
      )}

      <FiltersModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        onCerrar={() => setFiltrosAbiertos(false)}
        onAplicar={(nuevos: FiltrosRestauranteCliente) => aplicarFiltros(nuevos)}
      />
    </div>
  );
}

function Metrica({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{valor}</p>
    </div>
  );
}
