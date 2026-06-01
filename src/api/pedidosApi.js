import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth'

async function leerJson(response) {
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function confirmarPedido({ carrito, direccion, restauranteId }) {
  const response = await fetchConAuth(ENDPOINTS.PEDIDO_CONFIRMAR, {
    method: 'POST',
    // El backend /api/pedido/confirmar espera unicamente un DTODireccion.
    // Ignoramos carrito/restauranteId porque del lado servidor se obtiene
    // el carrito activo desde la sesión (JWT).
    body: JSON.stringify(direccion),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'No se pudo confirmar el pedido')
  }

  return leerJson(response)
}

export async function consultarEstadoPago(idPedido) {
  const url = ENDPOINTS.PAGO_ESTADO.replace(':idPedido', String(idPedido))
  const response = await fetchConAuth(url)
  if (!response.ok) throw new Error('No se pudo consultar el estado del pago')
  return leerJson(response)
}
