import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";
import { obtenerEstadisticas } from "../../../api/apiRestaurante.js";
import type { DTOEstadisticas } from "../../../data/DTOEstadisticas.js";
import type { DTOProductoSimplificado } from "../../../data/DTOProductoSimplificado.js";

export type VistaEstadisticas = "platos" | "fechas" | "monto";

interface EstadisticasPageProps {
  vista: VistaEstadisticas;
}

const TITULOS: Record<VistaEstadisticas, string> = {
  platos: "Platos más solicitados",
  fechas: "Pedidos por fecha",
  monto: "Monto promedio por día",
};

function fechaHaceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString().slice(0, 10);
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toFechaInicio(fecha: string): string {
  return `${fecha}T00:00:00`;
}

function toFechaFin(fecha: string): string {
  return `${fecha}T23:59:59`;
}

function formatearFechaCorta(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return fechaISO;
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearMoneda(valor: number): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function mapaOrdenadoPorFecha(
  mapa: Record<string, number> | undefined,
): [string, number][] {
  if (!mapa) return [];
  return Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b));
}

function ImagePlaceholder() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
      <BarChart3 className="h-5 w-5 text-gray-300" />
    </div>
  );
}

function TablaPlatos({ productos }: { productos: DTOProductoSimplificado[] }) {
  if (productos.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No hay productos vendidos en este período.
      </p>
    );
  }

  const maxCantidad = Math.max(
    ...productos.map((p) => p.cantidadVendida ?? 0),
    1,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th className="pb-3 pr-4 font-medium">#</th>
            <th className="pb-3 pr-4 font-medium">Producto</th>
            <th className="pb-3 pr-4 font-medium">Precio</th>
            <th className="pb-3 pr-4 font-medium">Cantidad</th>
            <th className="pb-3 font-medium">Comparación</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, index) => {
            const cantidad = producto.cantidadVendida ?? 0;
            const porcentaje = Math.round((cantidad / maxCantidad) * 100);

            return (
              <tr
                key={producto.idProducto ?? index}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {producto.urlImagen ? (
                      <img
                        src={producto.urlImagen}
                        alt={producto.nombre ?? "Producto"}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    <span className="font-medium text-gray-800">
                      {producto.nombre ?? "Sin nombre"}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-700">
                  {formatearMoneda(producto.precio ?? 0)}
                </td>
                <td className="py-3 pr-4 font-semibold text-gray-800">
                  {cantidad}
                </td>
                <td className="py-3">
                  <div className="h-2 w-full max-w-40 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-trego-orange"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TablaVentasPorFecha({
  ventas,
}: {
  ventas: [string, number][];
}) {
  if (ventas.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No hay pedidos en este período.
      </p>
    );
  }

  const maxVentas = Math.max(...ventas.map(([, n]) => n), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th className="pb-3 pr-4 font-medium">Fecha</th>
            <th className="pb-3 pr-4 font-medium">Pedidos</th>
            <th className="pb-3 font-medium">Comparación</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(([fecha, cantidad]) => {
            const porcentaje = Math.round((cantidad / maxVentas) * 100);

            return (
              <tr key={fecha} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-800">
                  {formatearFechaCorta(fecha)}
                </td>
                <td className="py-3 pr-4 text-gray-700">{cantidad}</td>
                <td className="py-3">
                  <div className="h-2 w-full max-w-48 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-trego-orange"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TablaMontoPromedio({
  ingresos,
}: {
  ingresos: [string, number][];
}) {
  if (ingresos.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No hay datos de monto en este período.
      </p>
    );
  }

  const maxMonto = Math.max(...ingresos.map(([, n]) => n), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th className="pb-3 pr-4 font-medium">Fecha</th>
            <th className="pb-3 pr-4 font-medium">Promedio</th>
            <th className="pb-3 font-medium">Comparación</th>
          </tr>
        </thead>
        <tbody>
          {ingresos.map(([fecha, promedio]) => {
            const porcentaje = Math.round((promedio / maxMonto) * 100);

            return (
              <tr key={fecha} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-800">
                  {formatearFechaCorta(fecha)}
                </td>
                <td className="py-3 pr-4 text-gray-700">
                  {formatearMoneda(promedio)}
                </td>
                <td className="py-3">
                  <div className="h-2 w-full max-w-48 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-trego-orange"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EstadisticasPage({ vista }: EstadisticasPageProps) {
  const [fechaDesde, setFechaDesde] = useState(fechaHaceDias(30));
  const [fechaHasta, setFechaHasta] = useState(hoyISO());
  const [datos, setDatos] = useState<DTOEstadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEstadisticas = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) {
      setError("Seleccioná ambas fechas.");
      return;
    }

    if (fechaDesde > fechaHasta) {
      setError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await obtenerEstadisticas(
        toFechaInicio(fechaDesde),
        toFechaFin(fechaHasta),
      );
      setDatos(resultado);
    } catch (err) {
      setDatos(null);
      setError(
        err instanceof Error ? err.message : "Error al obtener estadísticas.",
      );
    } finally {
      setLoading(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas, vista]);

  const ventasOrdenadas = mapaOrdenadoPorFecha(datos?.ventasPorFecha);
  const ingresosOrdenados = mapaOrdenadoPorFecha(datos?.ingresosPorFecha);

  return (
    <div className="flex-1 w-full h-full p-4 md:p-8 overflow-y-auto bg-gray-50 text-gray-800 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{TITULOS[vista]}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultá las estadísticas de tu local en el período seleccionado.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:p-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Desde</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="rounded-xl border h-12 border-gray-400 px-4 py-2.5 text-sm focus:border-trego-orange focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="rounded-xl border h-12 border-gray-400 px-4 py-2.5 text-sm focus:border-trego-orange focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <button
          type="button"
          onClick={cargarEstadisticas}
          disabled={loading}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-trego-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-trego-cart disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Generar estadísticas"
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {loading && !datos ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando estadísticas...</span>
          </div>
        ) : (
          <>
            {vista === "platos" && (
              <TablaPlatos productos={datos?.productosMasVendidos ?? []} />
            )}
            {vista === "fechas" && (
              <TablaVentasPorFecha ventas={ventasOrdenadas} />
            )}
            {vista === "monto" && (
              <TablaMontoPromedio ingresos={ingresosOrdenados} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
