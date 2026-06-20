import type { DTOProducto } from "../data/DTOProducto.js";
import type { EnumCategoriaProducto } from "../data/EnumCategoriaProducto.js";

export function precioConDescuento(
  precio: number,
  descuentoPorcentaje: number,
) {
  if (!descuentoPorcentaje) return precio;
  return Math.round(precio * (1 - descuentoPorcentaje / 100));
}

function toDateString(
  value: string | Date | null | undefined,
): string | undefined {
  if (!value) return undefined;
  try {
    const raw =
      typeof value === "string" && value.length >= 10
        ? value.slice(0, 10)
        : undefined;
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

const OFERTA_ACTIVA_OVERRIDES_KEY = "trego_oferta_activa_overrides";

function leerOverridesOfertaActiva(): Record<number, boolean> {
  try {
    const raw = sessionStorage.getItem(OFERTA_ACTIVA_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [Number(k), v]),
    );
  } catch {
    return {};
  }
}

/** Persiste ofertaActiva cuando el back no la devuelve en el JSON. */
export function guardarOverrideOfertaActiva(
  idProducto: number,
  activa: boolean,
): void {
  const overrides = leerOverridesOfertaActiva();
  overrides[idProducto] = activa;
  sessionStorage.setItem(
    OFERTA_ACTIVA_OVERRIDES_KEY,
    JSON.stringify(overrides),
  );
}

/** Aplica overrides de sesión sobre productos del API. */
export function aplicarOverridesOfertaActiva(
  productos: DTOProducto[],
): DTOProducto[] {
  const overrides = leerOverridesOfertaActiva();
  return (productos ?? []).map((p) => {
    const id = p.idProducto;
    if (id != null && id in overrides) {
      return { ...p, ofertaActiva: overrides[id] as boolean };
    }
    return p;
  });
}

/** Flag habilitada por el restaurante. Solo true si el producto lo indica explícitamente. */
export function resolverOfertaActivaFlag(
  producto: DTOProducto | null | undefined,
): boolean {
  if (!producto?.oferta) return false;
  return producto.ofertaActiva === true;
}

/**
 * Quita datos de oferta en productos que no están activos para el cliente.
 * idsOfertaActiva: productos confirmados por listarProductosOferta (oferta_activa en BD).
 */
export function sanitizarOfertasCliente(
  productos: DTOProducto[],
  idsOfertaActiva: ReadonlySet<number> = new Set(),
): DTOProducto[] {
  return (productos ?? []).map((p) => {
    if (!p.oferta) return p;

    const id = p.idProducto;
    const activa =
      p.ofertaActiva === true ||
      (id != null && idsOfertaActiva.has(id));

    if (!activa || !ofertaVigentePorFechas(p.oferta)) {
      const { oferta: _oferta, ...rest } = p;
      return { ...rest, ofertaActiva: false };
    }

    return { ...p, ofertaActiva: true };
  });
}

/** Oferta dentro del rango de fechas (inclusive). No depende de ofertaActiva del backend. */
export function ofertaVigentePorFechas(
  oferta: DTOProducto["oferta"],
): boolean {
  if (!oferta?.fechaInicio || !oferta?.fechaFin) return false;

  const hoy = new Date().toISOString().slice(0, 10);
  const inicio = toDateString(oferta.fechaInicio);
  const fin = toDateString(oferta.fechaFin);
  if (!inicio || !fin) return false;

  return hoy >= inicio && hoy <= fin;
}

/** Producto con oferta vigente hoy: habilitada y dentro del rango de fechas. */
export function esProductoOfertaVigente(
  producto: DTOProducto | null | undefined,
): boolean {
  if (!producto?.oferta) return false;
  if (!resolverOfertaActivaFlag(producto)) return false;
  return ofertaVigentePorFechas(producto.oferta);
}

export function productoTieneOferta(
  producto: DTOProducto | null | undefined,
): boolean {
  return producto?.oferta != null;
}

export function productosConOferta(productos: DTOProducto[]): DTOProducto[] {
  return (productos ?? []).filter(esProductoOfertaVigente);
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

export function obtenerPrecios(producto: DTOProducto): {
  original: number;
  conDescuento: number;
  tieneOferta: boolean;
} {
  const original = producto.precio ?? 0;
  const descuento =
    producto.oferta?.descuento ??
    (producto.oferta as { descuentoPorcentaje?: number } | undefined)
      ?.descuentoPorcentaje ??
    0;
  const vigente = esProductoOfertaVigente(producto);
  const tieneOferta = descuento > 0 && vigente;
  const conDescuento = tieneOferta
    ? precioConDescuento(original, descuento)
    : original;

  return { original, conDescuento, tieneOferta };
}
