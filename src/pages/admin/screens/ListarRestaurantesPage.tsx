import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/EmptyState.jsx";
import { administradorApi } from "../../../api/administradorApi.js";
import type { DTORestaurante } from "../../../data/DTORestaurante.js";
import type { DTODireccion } from "../../../data/DTODireccion.js";

type FiltroEstado = "todos" | "habilitados" | "pendientes";
type OrdenLista = "az" | "za" | "calificacion";

function formatearDireccion(direccion?: DTODireccion): string {
  if (!direccion) return "—";

  const partes = [
    direccion.calle,
    direccion.numero != null ? String(direccion.numero) : null,
    direccion.apartamento ? `Apto ${direccion.apartamento}` : null,
    direccion.esquina?.trim() ? `Esq. ${direccion.esquina}` : null,
  ].filter(Boolean);

  return partes.length > 0 ? partes.join(", ") : "—";
}

function CampoDetalle({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm text-gray-800">{valor}</dd>
    </div>
  );
}

function MetricaCard({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{etiqueta}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{valor}</p>
    </div>
  );
}

export default function ListarRestaurantesPage() {
  const [restaurantes, setRestaurantes] = useState<DTORestaurante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<DTORestaurante | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [orden, setOrden] = useState<OrdenLista>("az");

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [habilitados, pendientes] = await Promise.all([
        administradorApi.obtenerRestaurantesHabilitados(),
        administradorApi.obtenerRestaurantesPendientes(),
      ]);

      const lista = [
        ...habilitados.map((r) => ({ ...r, habilitado: true })),
        ...pendientes.map((r) => ({ ...r, habilitado: false })),
      ];

      setRestaurantes(lista);
    } catch {
      setError("No se pudo cargar la lista de restaurantes.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const metricas = useMemo(() => {
    const habilitados = restaurantes.filter((r) => r.habilitado).length;
    const pendientes = restaurantes.filter((r) => !r.habilitado).length;
    return {
      total: restaurantes.length,
      habilitados,
      pendientes,
    };
  }, [restaurantes]);

  const restaurantesFiltrados = useMemo(() => {
    let lista = [...restaurantes];

    if (filtroEstado === "habilitados") {
      lista = lista.filter((r) => r.habilitado);
    } else if (filtroEstado === "pendientes") {
      lista = lista.filter((r) => !r.habilitado);
    }

    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter((r) =>
        (r.nombre ?? "").toLowerCase().includes(q),
      );
    }

    lista.sort((a, b) => {
      if (orden === "calificacion") {
        return (b.calificacionProm ?? 0) - (a.calificacionProm ?? 0);
      }
      const nombreA = (a.nombre ?? "").toLowerCase();
      const nombreB = (b.nombre ?? "").toLowerCase();
      if (orden === "za") return nombreB.localeCompare(nombreA);
      return nombreA.localeCompare(nombreB);
    });

    return lista;
  }, [restaurantes, filtroEstado, busqueda, orden]);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Todos los registrados
          </h1>
          <p className="mt-2 text-gray-500">
            Vista general de restaurantes habilitados y pendientes.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <MetricaCard etiqueta="Total registrados" valor={metricas.total} />
            <MetricaCard etiqueta="Habilitados" valor={metricas.habilitados} />
            <MetricaCard etiqueta="Pendientes" valor={metricas.pendientes} />
          </div>
        )}

        {!cargando && !error && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-1 min-w-[200px] flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Buscar</span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre del restaurante..."
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-trego-admin focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value as FiltroEstado)
                }
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-trego-admin focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="todos">Todos</option>
                <option value="habilitados">Habilitados</option>
                <option value="pendientes">Pendientes</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Orden</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as OrdenLista)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-trego-admin focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="az">A – Z</option>
                <option value="za">Z – A</option>
                <option value="calificacion">Mejor calificación</option>
              </select>
            </label>
          </div>
        )}

        {cargando ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-trego-admin" />
            <p className="text-sm text-gray-400">Cargando restaurantes...</p>
          </div>
        ) : restaurantesFiltrados.length === 0 ? (
          <EmptyState
            mensaje={
              restaurantes.length === 0
                ? "No hay restaurantes registrados"
                : "No hay resultados para los filtros aplicados"
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {restaurantesFiltrados.map((restaurante) => (
              <li key={restaurante.idRestaurante}>
                <button
                  type="button"
                  onClick={() => setSeleccionado(restaurante)}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-lg font-semibold text-gray-900">
                      {restaurante.nombre ?? "Sin nombre"}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        restaurante.habilitado
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {restaurante.habilitado ? "Habilitado" : "Pendiente"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {restaurante.categoria && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                        {restaurante.categoria}
                      </span>
                    )}
                    {restaurante.calificacionProm != null && (
                      <span className="text-sm text-gray-600">
                        ★ {restaurante.calificacionProm.toFixed(1)}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {seleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSeleccionado(null);
          }}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${seleccionado.nombre ?? "restaurante"}`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {seleccionado.nombre ?? "Sin nombre"}
                  </h2>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      seleccionado.habilitado
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {seleccionado.habilitado ? "Habilitado" : "Pendiente"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSeleccionado(null)}
                  className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <CampoDetalle
                  etiqueta="RUT"
                  valor={seleccionado.rut ?? "—"}
                />
                <CampoDetalle
                  etiqueta="Email"
                  valor={seleccionado.email ?? "—"}
                />
                <CampoDetalle
                  etiqueta="Teléfono"
                  valor={seleccionado.telefono ?? "—"}
                />
                <CampoDetalle
                  etiqueta="Categoría"
                  valor={seleccionado.categoria ?? "—"}
                />
                <div className="sm:col-span-2">
                  <CampoDetalle
                    etiqueta="Dirección"
                    valor={formatearDireccion(seleccionado.direccion)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <CampoDetalle
                    etiqueta="Descripción"
                    valor={seleccionado.descripcion ?? "—"}
                  />
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
