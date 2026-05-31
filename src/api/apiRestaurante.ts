import type { DTOFirma } from "../data/DTOFirma.js";
import type { DTOIngrediente } from "../data/DTOIngrediente.js";
import type { DTOPedido } from "../data/DTOPedido.js";
import type { DTOProducto } from "../data/DTOProducto.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";
import type { DTOSubcategoria } from "../data/DTOSubcategoria.js";
import type { EnumEstadoPedido } from "../data/EnumEstadoPedido.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

interface FiltrosPedido {
  estado?: EnumEstadoPedido;
  idProducto?: number;
}

/** falta endpoint backend */
export async function enviarSolicitudAltaRestaurante(
  resto: Partial<DTORestaurante>,
) {
  const response = await fetchConAuth(ENDPOINTS.SOLICITUD_ALTA_RESTAURANTE, {
    method: "PATCH",
    body: JSON.stringify(resto),
  });
  if (!response.ok) {
    throw new Error("No se pudo enviar la solicitud de alta");
  }
  return response.json();
}

export async function obtenerFirmaCloudinary(
  nombreArchivo: string,
  tipo: "image" | "video" | "raw" = "image",
): Promise<DTOFirma> {
  // Limpiamos el nombre de espacios o caracteres raros por las dudas
  const nombreLimpio = encodeURIComponent(nombreArchivo.trim());
  const url = `${ENDPOINTS.FIRMA_IMAGEN}/${nombreLimpio},${tipo}`;

  const response = await fetchConAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(`No se pudo obtener la firma de Cloudinary: ${errorText}`);
  }

  return response.json();
}

export async function obtenerActual(): Promise<DTORestaurante> {
  const response = await fetchConAuth(ENDPOINTS.OBTENER_RESTAURANTE_ACTUAL, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(
      `No se pudo obtener la informacion del restaurante: ${errorText}`,
    );
  }

  return response.json();
}

export async function agregarProducto(producto: DTOProducto): Promise<void> {
  const response = await fetchConAuth("/api/productos/agregarProducto", {
    method: "POST",
    body: JSON.stringify(producto),
  });

  if (!response.ok) {
    let mensaje = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      mensaje =
        errorData.message || errorData.error || JSON.stringify(errorData);
    } catch {
      mensaje = await response.text().catch(() => "Error desconocido");
    }

    console.error("❌ Error al agregar producto:", response.status, mensaje);
    throw new Error(mensaje);
  }
}

/**
 * Obtiene la lista de ingredientes del restaurante autenticado.
 * @returns Promise con array de DTOIngrediente.
 * @throws Error si el restaurante no existe (404) o si ocurre otro error.
 */
export async function listarIngredientes(): Promise<DTOIngrediente[]> {
  const response = await fetchConAuth(ENDPOINTS.LISTAR_INGREDIENTES);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Restaurante no encontrado");
    }
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(errorText || "Error al obtener los ingredientes");
  }

  return response.json();
}

export async function crearIngrediente(
  nombre: string,
): Promise<DTOIngrediente> {
  const response = await fetchConAuth(
    `${ENDPOINTS.AGREGAR_INGREDIENTE}/${encodeURIComponent(nombre)}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al crear el ingrediente");
  }

  return response.json();
}

/**
 * Obtiene todos los productos del restaurante autenticado.
 * @returns Promise con array de DTOProducto.
 * @throws Error si hay problemas de autenticación (403) o no se encuentran productos (404).
 */
export async function listarProductos(): Promise<DTOProducto[]> {
  const response = await fetchConAuth(ENDPOINTS.LISTAR_PRODUCTOS);

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("No tiene permisos para listar los productos.");
    }
    if (response.status === 404) {
      throw new Error("No se encontraron productos para ingresar al combo.");
    }
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(errorText || "Error al listar los productos.");
  }

  return response.json();
}

/**
 * Obtiene los pedidos del restaurante autenticado, opcionalmente filtrados por estado y/o producto.
 * @param filtros - Objeto opcional con `estado` y/o `idProducto`.
 * @returns Promise con array de DTOPedido.
 */
export async function listarPedidos(
  filtros?: FiltrosPedido,
): Promise<DTOPedido[]> {
  const params = new URLSearchParams();
  if (filtros?.estado) params.append("estado", filtros.estado);
  if (filtros?.idProducto != null)
    params.append("idProducto", String(filtros.idProducto));

  const query = params.toString();
  const url = `${ENDPOINTS.LISTAR_PEDIDOS}${query ? `?${query}` : ""}`;

  const response = await fetchConAuth(url);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(errorText || "Error al listar los pedidos");
  }

  return response.json();
}

/**
 * Obtiene todas las subcategorías disponibles.
 * @returns Promise con un array de DTOSubcategoria.
 */
export async function listarSubcategorias(): Promise<DTOSubcategoria[]> {
  const response = await fetchConAuth(ENDPOINTS.LISTAR_SUBCATEGORIAS);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(errorText || "Error al listar las subcategorías");
  }

  return response.json();
}
