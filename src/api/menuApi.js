import { ENDPOINTS } from './endpoints'
import { mapearMenuRespuesta, mapearRestaurante, ordenFrontABackend } from './mapeadores'
import { fetchConAuth } from './header/fetchConAuth'

export class MenuApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'MenuApiError'
    this.status = status
  }
}

async function obtenerCabeceraRestaurante(idRestaurante) {
  const path = ENDPOINTS.RESTAURANTE_POR_ID.replace(':id', String(idRestaurante))
  const response = await fetchConAuth(path)
  if (response.status === 404) {
    throw new MenuApiError('El restaurante no existe o no está disponible', 404)
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

  const response = await fetchConAuth(url)

  if (response.status === 404) {
    throw new MenuApiError('El restaurante no existe o no está disponible', 404)
  }
  if (!response.ok) {
    throw new MenuApiError('Error al cargar el menú', response.status)
  }

  const data = await response.json()
  const menu = mapearMenuRespuesta(data)
  if (!menu) {
    throw new MenuApiError('Respuesta de menú inválida', 500)
  }

  let restaurante = menu.restaurante
  if (!restaurante) {
    restaurante = await obtenerCabeceraRestaurante(idRestaurante)
  }

  return {
    restaurante,
    productos: menu.productos ?? [],
    mensaje: menu.mensaje,
  }
}
