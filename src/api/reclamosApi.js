import { ENDPOINTS } from './endpoints.js'
import { fetchConAuth } from './header/fetchConAuth.js'

function normalizarReclamo(raw) {
  const totalRaw = raw.totalPedido ?? raw.total_pedido ?? raw.total
  const totalPedido =
    totalRaw != null && totalRaw !== '' ? Number(totalRaw) : null

  return {
    ...raw,
    totalPedido: Number.isFinite(totalPedido) ? totalPedido : null,
  }
}

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

/**
 * Lista reclamos del restaurante autenticado.
 * @param {{ nombre?: string, estado?: string, fechaDesde?: string, fechaHasta?: string }} filtros
 */
export async function listarReclamos(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.nombre?.trim()) params.set('nombre', filtros.nombre.trim())
  if (filtros.estado) params.set('estado', filtros.estado)
  if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde)
  if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta)

  const query = params.toString()
  const url = query ? `${ENDPOINTS.RECLAMOS}?${query}` : ENDPOINTS.RECLAMOS

  const response = await fetchConAuth(url)

  if (!response.ok) {
    const detalle = await leerMensajeError(response)
    throw new Error(detalle ?? 'No se pudieron cargar los reclamos')
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map(normalizarReclamo) : []
}

/**
 * Resuelve o rechaza un reclamo pendiente.
 * @param {number} idReclamo
 * @param {{ accion: boolean, motivoRechazo?: string }} payload
 */
export async function resolverReclamo(idReclamo, payload) {
  const response = await fetchConAuth(
    `${ENDPOINTS.RECLAMOS}/${idReclamo}/resolver`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    const detalle = await leerMensajeError(response)
    throw new Error(detalle ?? 'No se pudo resolver el reclamo')
  }

  const data = await response.json()
  return normalizarReclamo(data)
}
