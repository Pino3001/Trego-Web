import { mapearMenuRespuesta, mapearRestaurante, ordenFrontABackend } from './mapeadores'
import { fetchConAuth } from './header/fetchConAuth'
import { ENDPOINTS } from './endpoints.js'

export class MenuApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'MenuApiError'
    this.status = status
  }
}

/** verMenu es público en el back; fetch sin redirección de sesión. */
async function fetchMenuPublic(url) {
  const headers = {}
  const token = localStorage.getItem('jwtToken')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(url, { headers })
}

async function leerMensajeError(response) {
  try {
    const data = await response.json()
    return data?.message ?? data?.error ?? null
  } catch {
    return null
  }
}

async function obtenerCabeceraRestaurante(idRestaurante) {
  const path = ENDPOINTS.RESTAURANTE_POR_ID.replace(':id', String(idRestaurante))
  const response = await fetchConAuth(path)
  if (response.status === 404) {
    throw new MenuApiError('El restaurante no existe o no está disponible', 404)
  }
  if (response.status === 401 || response.status === 403) {
    throw new MenuApiError(
      'Iniciá sesión como cliente para ver este restaurante',
      response.status,
    )
  }
  if (!response.ok) {
    throw new MenuApiError('Error al cargar datos del restaurante', response.status)
  }
  const data = await response.json()
  return mapearRestaurante(data)
}

export async function obtenerMenuRestaurante(idRestaurante, opciones = {}) {
  const { categoria, ordenPrecio } = opciones
  const path = ENDPOINTS.MENU_RESTAURANTE.replace(':id', String(idRestaurante))
  const params = new URLSearchParams()
  if (categoria) params.set('categoria', categoria)
  const orden = ordenFrontABackend(ordenPrecio)
  if (orden) params.set('orden', orden)

  const query = params.toString()
  const url = query ? `${path}?${query}` : path

  const response = await fetchMenuPublic(url)

  if (response.status === 404) {
    const detalle = await leerMensajeError(response)
    const sinProductos =
      detalle &&
      /productos|producto/i.test(detalle) &&
      !/restaurante no encontrado/i.test(detalle)
    if (sinProductos) {
      try {
        const restaurante = await obtenerCabeceraRestaurante(idRestaurante)
        return {
          restaurante,
          productos: [],
          mensaje: 'Este restaurante aún no ha cargado su menú',
        }
      } catch {
        // Sin sesión o cabecera no disponible: mensaje de menú vacío igualmente.
      }
      return {
        restaurante: null,
        productos: [],
        mensaje: 'Este restaurante aún no ha cargado su menú',
      }
    }
    throw new MenuApiError(
      detalle ?? 'El restaurante no existe o no está disponible',
      404,
    )
  }
  if (!response.ok) {
    const detalle = await leerMensajeError(response)
    throw new MenuApiError(detalle ?? 'Error al cargar el menú', response.status)
  }

  const data = await response.json()
  const menu = mapearMenuRespuesta(data)
  if (!menu) {
    throw new MenuApiError('Respuesta de menú inválida', 500)
  }

  let restaurante = menu.restaurante
  let productos = menu.productos ?? []
  let mensaje = menu.mensaje

  if (!restaurante) {
    try {
      restaurante = await obtenerCabeceraRestaurante(idRestaurante)
    } catch (e) {
      if (mensaje) {
        return { restaurante: null, productos: [], mensaje }
      }
      throw e
    }
  }

  return {
    restaurante,
    productos,
    mensaje,
  }
}