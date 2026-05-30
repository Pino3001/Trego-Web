import { ENDPOINTS } from './endpoints'
import { obtenerMockMenu } from '../data/mockMenu'
import { mapearMenuRespuesta, ordenFrontABackend } from './mapeadores'
import { fetchConAuth } from './header/fetchConAuth'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export async function obtenerMenuRestaurante(idRestaurante, opciones = {}) {
  const { categoria, ordenPrecio } = opciones

  if (USE_MOCK) {
    await delay(350)
    return obtenerMockMenu(idRestaurante)
  }

  try {
    const path = ENDPOINTS.MENU_RESTAURANTE.replace(':id', String(idRestaurante))
    const params = new URLSearchParams()
    if (categoria) params.set('categoria', categoria)
    const orden = ordenFrontABackend(ordenPrecio)
    if (orden) params.set('orden', orden)

    const query = params.toString()
    const url = query ? `${path}?${query}` : path

    const response = await fetchConAuth(url)
    if (!response.ok) throw new Error('Error al cargar menú')

    const data = await response.json()
    const menu = mapearMenuRespuesta(data)

    if (menu?.mensaje && (!menu.productos || menu.productos.length === 0)) {
      return {
        restaurante: menu.restaurante ?? { idUsuario: Number(idRestaurante), habilitado: true, abierto: true },
        productos: [],
      }
    }

    return menu
  } catch (err) {
    console.warn('[Trego] API menú no disponible, usando mock', err)
    return obtenerMockMenu(idRestaurante)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
