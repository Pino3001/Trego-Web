import { ENDPOINTS } from './endpoints.js'
import { fetchConAuth } from './header/fetchConAuth.js'

async function leerMensajeError(response) {
  const text = await response.text().catch(() => '')
  if (!text) return null
  try {
    const body = JSON.parse(text)
    return body?.message ?? body?.error ?? text
  } catch {
    return text
  }
}

/**
 * Crea un reclamo sobre un pedido entregado.
 * @param {{ idPedido: number, texto: string }} payload
 */
export async function crearReclamo({ idPedido, texto }) {
  const response = await fetchConAuth(ENDPOINTS.RECLAMOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPedido, texto }),
  })

  if (response.status === 201) {
    return response.json()
  }

  const detalle = await leerMensajeError(response)

  if (response.status === 400) {
    throw new Error(
      detalle ?? 'Solo podés reclamar pedidos que ya fueron entregados.',
    )
  }
  if (response.status === 403) {
    throw new Error(detalle ?? 'Este pedido no te pertenece.')
  }
  if (response.status === 404) {
    throw new Error(detalle ?? 'No se encontró el pedido.')
  }
  if (response.status === 409) {
    const err = new Error(detalle ?? 'Este pedido ya tiene un reclamo registrado.')
    err.code = 'RECLAMO_YA_EXISTE'
    throw err
  }
  if (response.status === 401) {
    throw new Error('Tenés que iniciar sesión para realizar un reclamo.')
  }

  throw new Error(detalle ?? `No se pudo enviar el reclamo (HTTP ${response.status})`)
}
