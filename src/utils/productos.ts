import type { DTOProducto } from "../data/DTOProducto.js";
import type { EnumCategoriaProducto } from "../data/EnumCategoriaProducto.js";

export function precioConDescuento(
  precio: number,
  descuentoPorcentaje: number,
) {
  if (!descuentoPorcentaje) return precio;
  return Math.round(precio * (1 - descuentoPorcentaje / 100));
}

export function productosConOferta(productos: DTOProducto[]): DTOProducto[] {
  // Fecha actual en formato YYYY-MM-DD (sin hora)
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  return productos.filter((p) => {
    // Verificar que exista la oferta y sus fechas
    if (!p.oferta?.fechaInicio || !p.oferta?.fechaFin) return false;

    // Convertir inicio a string de fecha (si es Date, extraer solo la parte de fecha)
    const inicioStr =
      typeof p.oferta.fechaInicio === "string"
        ? p.oferta.fechaInicio
        : new Date(p.oferta.fechaInicio).toISOString().split("T")[0];

    const finStr =
      typeof p.oferta.fechaFin === "string"
        ? p.oferta.fechaFin
        : new Date(p.oferta.fechaFin).toISOString().split("T")[0];

    if (!hoyStr || !inicioStr || !finStr) return;

    return hoyStr >= inicioStr && hoyStr <= finStr;
  });
}

export function filtrarPorCategoria(
  productos: DTOProducto[],
  categoriaId: EnumCategoriaProducto,
) {
  if (!categoriaId) return productos;
  return productos.filter((p) => p.categoria === categoriaId);
}

export function ordenarPorPrecio(
  productos: DTOProducto[],
  orden: "asc" | "desc",
) {
  if (!orden) return [...productos];
  const lista = [...productos];
  lista.sort((a, b) =>
    orden === "asc"
      ? (a.precio ?? 0) - (b.precio ?? 0)
      : (b.precio ?? 0) - (a.precio ?? 0),
  );
  return lista;
}

/**
 * Convierte un valor (string o Date) a una fecha ISO en formato YYYY-MM-DD,
 * o undefined si el valor es inválido o no se puede convertir.
 */
function toDateString(
  value: string | Date | null | undefined,
): string | undefined {
  if (!value) return undefined;
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return undefined; // Fecha inválida
    return date.toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

function isOfertaActiva(oferta: DTOProducto["oferta"]): boolean {
  // Validación con encadenamiento opcional: si falta alguna propiedad, no está activa
  if (!oferta?.fechaInicio || !oferta?.fechaFin) return false;

  const hoy = new Date().toISOString().substring(0, 10);
  const inicioStr = toDateString(oferta.fechaInicio);
  const finStr = toDateString(oferta.fechaFin);

  // Si alguna fecha no se pudo convertir, descartamos la oferta
  if (inicioStr === undefined || finStr === undefined) return false;

  return hoy >= inicioStr && hoy <= finStr;
}

export function obtenerPrecios(producto: DTOProducto): {
  original: number;
  conDescuento: number;
  tieneOferta: boolean;
} {
  const original = producto.precio ?? 0;
  const descuento = producto.oferta?.descuento ?? 0;
  const ofertaActiva = isOfertaActiva(producto.oferta);
  const tieneOferta = descuento > 0 && ofertaActiva;
  const conDescuento = tieneOferta
    ? precioConDescuento(original, descuento)
    : original;

  return { original, conDescuento, tieneOferta };
}
