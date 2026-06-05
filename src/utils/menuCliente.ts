import type { DTOProducto } from "../data/DTOProducto.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";
import { EnumCategoriaProducto } from "../data/EnumCategoriaProducto.js";

export function precioFinalProducto(producto: DTOProducto): number {
  if (producto.oferta?.descuento) {
    return Math.round(
      producto.precio * (1 - producto.oferta.descuento / 100),
    );
  }
  return producto.precio;
}

export function productoTieneOferta(producto: DTOProducto): boolean {
  return producto.oferta != null;
}

export function filtrarProductosLocales(
  productos: DTOProducto[],
  opts: { nombrePlato?: string; soloOfertas?: boolean },
): DTOProducto[] {
  let lista = [...productos];

  if (opts.soloOfertas) {
    lista = lista.filter(productoTieneOferta);
  }

  const termino = opts.nombrePlato?.trim().toLowerCase();
  if (termino) {
    lista = lista.filter((p) =>
      p.nombre.toLowerCase().includes(termino),
    );
  }

  return lista;
}

export const CATEGORIAS_MENU_CLIENTE: { id: string; label: string }[] = [
  { id: "", label: "Todas" },
  ...Object.values(EnumCategoriaProducto).map((categoria) => ({
    id: categoria,
    label: categoria,
  })),
];

export type OrdenPrecioFront = "" | "asc" | "desc";

export function ordenFrontAMenu(
  orden: OrdenPrecioFront,
): "precio_asc" | "precio_desc" | undefined {
  if (orden === "asc") return "precio_asc";
  if (orden === "desc") return "precio_desc";
  return undefined;
}

/** Formato que usan RestauranteBanner y el carrito legacy. */
export function restauranteParaUi(restaurante: DTORestaurante) {
  const horaA = formatearHora(restaurante.horaApertura);
  const horaC = formatearHora(restaurante.horaCierre);
  const horarioServicio =
    horaA && horaC ? [horaA, horaC] : (["12:00", "23:00"] as [string, string]);

  return {
    idUsuario: restaurante.idRestaurante,
    idRestaurante: restaurante.idRestaurante,
    nombre: restaurante.nombre,
    descripcion: restaurante.descripcion ?? "",
    categoria: restaurante.categoria ?? "",
    calificacionProm: restaurante.calificacionProm ?? 0,
    cantidadResenas: 0,
    habilitado: restaurante.habilitado ?? true,
    abierto: restaurante.abierto ?? true,
    fotoPerfil: restaurante.fotoPerfil,
    fotoPortada: restaurante.fotoPortada,
    direccion: restaurante.direccion
      ? {
          nombre: restaurante.direccion.calle ?? "Montevideo",
          ciudad: "Montevideo",
          latitud: restaurante.direccion.latitud,
          longitud: restaurante.direccion.longitud,
          nroPuerta: restaurante.direccion.numero,
        }
      : { nombre: "Montevideo", ciudad: "Montevideo" },
    horarioServicio,
  };
}

export function productoParaCarrito(producto: DTOProducto) {
  const descuento = producto.oferta?.descuento ?? 0;
  return {
    idProducto: producto.idProducto,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? "",
    precio: producto.precio,
    fotoPlato: producto.urlImagen,
    categoria: producto.categoria,
    disponible: producto.disponible ?? true,
    ofertaActiva: !!producto.oferta,
    oferta: producto.oferta
      ? {
          descuentoPorcentaje: producto.oferta.descuento,
          descripcion: producto.oferta.descripcion,
        }
      : undefined,
    ingredientes: producto.ingredientes ?? [],
    idRestaurante: producto.idRestaurante,
  };
}

function formatearHora(hora?: string | null): string | null {
  if (!hora) return null;
  return hora.length >= 5 ? hora.slice(0, 5) : hora;
}
