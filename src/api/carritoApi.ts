import type { DTOCarrito } from "../data/DTOCarito.js";
import type { DTOProductoPedido } from "../data/DTOProductoPedido.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

async function leerJson(response: any) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function manejarError(response: Response) {
  let mensaje = response.statusText;
  try {
    const body = await response.text();
    // Si el backend devuelve un mensaje JSON o texto plano, lo usamos
    if (body) mensaje = body;
  } catch {}
  throw new Error(`Error ${response.status}: ${mensaje}`);
}

export async function obtenerCarrito() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO);
  if (response.status === 204) return null;
  if (!response.ok) await manejarError(response);
  return leerJson(response);
}

export async function agregarProductoAlCarritoApi(data: DTOProductoPedido) : Promise<DTOCarrito>{
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) await manejarError(response);
  return leerJson(response);
}

export async function modificarProductoEnCarrito(data: DTOProductoPedido) {
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (response.status === 204) return null;
  if (!response.ok) await manejarError(response);
  return leerJson(response);
}

export async function eliminarProductoDelCarrito(
  idProducto: number,
  producto: any,
) {
  const body = {
    producto: {
      idProducto,
      precio: producto ? producto.precio || 0 : 0,
      nombre: producto?.nombre,
    },
  };
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
  if (!response.ok) await manejarError(response);
  return leerJson(response);
}

export async function vaciarItemsCarrito() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO_ITEMS, {
    method: "DELETE",
  });
  if (response.status === 204) return null;
  if (!response.ok) await manejarError(response);
  return leerJson(response);
}

export async function eliminarCarritoCompleto() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO, { method: "DELETE" });
  if (!response.ok && response.status !== 204) await manejarError(response);
}
