import { useCallback, useEffect, useState } from "react";
import Header from "../../components/body/Header.js";
import EmptyState from "../../components/EmptyState.jsx";
import { administradorApi } from "../../api/administradorApi.js";
import type { DTORestaurante } from "../../data/DTORestaurante.js";
import type { DTODireccion } from "../../data/DTODireccion.js";

type VistaModal = "detalle" | "rechazar";

function formatearHora(hora?: string): string | null {
  if (!hora) return null;
  return hora.length >= 5 ? hora.slice(0, 5) : hora;
}

function formatearHorario(restaurante: DTORestaurante): string {
  const apertura = formatearHora(restaurante.horaApertura);
  const cierre = formatearHora(restaurante.horaCierre);
  if (apertura && cierre) return `${apertura} - ${cierre}`;
  return "—";
}

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

export default function GestionRestaurantesPage() {
  const [restaurantes, setRestaurantes] = useState<DTORestaurante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<DTORestaurante | null>(null);
  const [vistaModal, setVistaModal] = useState<VistaModal>("detalle");
  const [motivo, setMotivo] = useState("");
  const [accionLoading, setAccionLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarLista = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const lista = await administradorApi.obtenerRestaurantesPendientes();
      setRestaurantes(lista);
    } catch {
      setError("No se pudo cargar la lista de solicitudes pendientes.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  const cerrarModal = () => {
    setSeleccionado(null);
    setVistaModal("detalle");
    setMotivo("");
  };

  const removerDeLista = (idRestaurante: number) => {
    setRestaurantes((prev) =>
      prev.filter((r) => r.idRestaurante !== idRestaurante),
    );
    cerrarModal();
  };

  const handleHabilitar = async () => {
    if (!seleccionado?.idRestaurante) return;

    setAccionLoading(true);
    setError(null);

    try {
      await administradorApi.habilitarRestaurante(seleccionado.idRestaurante);
      setMensajeExito(
        `"${seleccionado.nombre}" fue habilitado correctamente.`,
      );
      removerDeLista(seleccionado.idRestaurante);
    } catch {
      setError("No se pudo habilitar el restaurante. Intentá de nuevo.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!seleccionado?.idRestaurante) return;

    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) {
      setError("Ingresá un motivo para rechazar la solicitud.");
      return;
    }

    setAccionLoading(true);
    setError(null);

    try {
      await administradorApi.rechazarRestaurante(
        seleccionado.idRestaurante,
        motivoLimpio,
      );
      setMensajeExito(
        `La solicitud de "${seleccionado.nombre}" fue rechazada.`,
      );
      removerDeLista(seleccionado.idRestaurante);
    } catch {
      setError("No se pudo rechazar el restaurante. Intentá de nuevo.");
    } finally {
      setAccionLoading(false);
    }
  };

  return (
    <>
      <Header tipoUser="Administrador" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Solicitudes de alta
          </h1>
          <p className="mt-2 text-gray-500">
            Revisá y aprobá los restaurantes pendientes de habilitación.
          </p>
        </div>

        {mensajeExito && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {mensajeExito}
          </div>
        )}

        {error && !seleccionado && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="text-sm text-gray-400">Cargando solicitudes...</p>
          </div>
        ) : restaurantes.length === 0 ? (
          <EmptyState mensaje="No hay solicitudes pendientes" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {restaurantes.map((restaurante) => (
              <li key={restaurante.idRestaurante}>
                <button
                  type="button"
                  onClick={() => {
                    setSeleccionado(restaurante);
                    setVistaModal("detalle");
                    setMotivo("");
                    setError(null);
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <p className="truncate text-lg font-semibold text-gray-900">
                    {restaurante.nombre}
                  </p>
                  {restaurante.razonSocial && (
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {restaurante.razonSocial}
                    </p>
                  )}
                  {restaurante.categoria && (
                    <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                      {restaurante.categoria}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {seleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !accionLoading) cerrarModal();
          }}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${seleccionado.nombre}`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {seleccionado.fotoPortada && (
              <img
                src={seleccionado.fotoPortada}
                alt={`Portada de ${seleccionado.nombre}`}
                className="h-40 w-full object-cover"
              />
            )}

            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {seleccionado.nombre}
                  </h2>
                  {seleccionado.razonSocial && (
                    <p className="text-gray-500">{seleccionado.razonSocial}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={accionLoading}
                  className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {vistaModal === "detalle" ? (
                <>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <CampoDetalle
                      etiqueta="Razón social"
                      valor={seleccionado.razonSocial ?? "—"}
                    />
                    <CampoDetalle
                      etiqueta="RUT"
                      valor={seleccionado.rut ?? "—"}
                    />
                    <CampoDetalle
                      etiqueta="Teléfono"
                      valor={seleccionado.telefono ?? "—"}
                    />
                    <CampoDetalle
                      etiqueta="Email"
                      valor={seleccionado.email ?? "—"}
                    />
                    <CampoDetalle
                      etiqueta="Categoría"
                      valor={seleccionado.categoria ?? "—"}
                    />
                    <CampoDetalle
                      etiqueta="Horario"
                      valor={formatearHorario(seleccionado)}
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

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setVistaModal("rechazar");
                        setError(null);
                      }}
                      disabled={accionLoading}
                      className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      onClick={handleHabilitar}
                      disabled={accionLoading}
                      className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {accionLoading ? "Procesando..." : "Habilitar"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-3 text-sm text-gray-600">
                    Ingresá el motivo del rechazo. Se enviará por email al
                    restaurante.
                  </p>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    placeholder="Motivo del rechazo..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setVistaModal("detalle");
                        setMotivo("");
                        setError(null);
                      }}
                      disabled={accionLoading}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleRechazar}
                      disabled={accionLoading}
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {accionLoading ? "Procesando..." : "Confirmar rechazo"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
