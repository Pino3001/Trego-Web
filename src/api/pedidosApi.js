import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth'

async function leerJson(response) {
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

function normalizarPreferenciaPago(preferencia) {
  if (!preferencia) return preferencia

  const initPoint =
    preferencia.initPoint ??
    preferencia.init_point ??
    preferencia.initpoint ??
    preferencia.url

  const sandboxInitPoint =
    preferencia.sandboxInitPoint ??
    preferencia.sandbox_init_point ??
    preferencia.sandboxInitpoint

  const externalReference =
    preferencia.externalReference ??
    preferencia.external_reference ??
    preferencia.idPedido ??
    preferencia.pedidoId

  return {
    ...preferencia,
    initPoint,
    sandboxInitPoint,
    externalReference,
  }
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
    let msg = text
    try {
      const body = JSON.parse(text)
      msg = body?.message ?? body?.error ?? text
    } catch {
      // texto plano, lo dejamos como está
    }
    throw new Error(msg || `No se pudo confirmar el pedido (HTTP ${response.status})`)
  }

  const body = await leerJson(response)
  return normalizarPreferenciaPago(body)
}

export async function consultarEstadoPago(idPedido) {
  const url = ENDPOINTS.PAGO_ESTADO.replace(':idPedido', String(idPedido))
  const response = await fetchConAuth(url)
  if (!response.ok) throw new Error('No se pudo consultar el estado del pago')
  return leerJson(response)
}
