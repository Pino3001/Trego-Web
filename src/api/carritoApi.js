import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth'
import { armarProductoPedidoRequest, precioProductoParaApi } from './mapeadores'

async function leerJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function manejarError(response) {
  const body = await leerJson(response)
  const msg = typeof body === 'string' ? body : body?.message ?? `Error ${response.status}`
  throw new Error(msg)
}

export async function obtenerCarrito() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO)
  if (response.status === 204) return null
  if (!response.ok) await manejarError(response)
  return leerJson(response)
}

export async function agregarProductoAlCarrito({ producto, cantidad, comentarios, idRestaurante }) {
  const body = armarProductoPedidoRequest({ producto, cantidad, comentarios, idRestaurante })
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!response.ok) await manejarError(response)
  return leerJson(response)
}

export async function modificarProductoEnCarrito({
  producto,
  cantidad,
  comentarios,
  idRestaurante,
}) {
  const body = armarProductoPedidoRequest({
    producto,
    cantidad,
    comentarios,
    idRestaurante,
  })
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (response.status === 204) return null
  if (!response.ok) await manejarError(response)
  return leerJson(response)
}

export async function eliminarProductoDelCarrito(idProducto, producto) {
  const body = {
    producto: {
      idProducto,
      precio: producto ? precioProductoParaApi(producto) : 0,
      nombre: producto?.nombre,
    },
  }
  const response = await fetchConAuth(ENDPOINTS.CARRITO_PRODUCTOS, {
    method: 'DELETE',
    body: JSON.stringify(body),
  })
  if (!response.ok) await manejarError(response)
  return leerJson(response)
}

export async function vaciarItemsCarrito() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO_ITEMS, { method: 'DELETE' })
  if (response.status === 204) return null
  if (!response.ok) await manejarError(response)
  return leerJson(response)
}

export async function eliminarCarritoCompleto() {
  const response = await fetchConAuth(ENDPOINTS.CARRITO, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) await manejarError(response)
}
