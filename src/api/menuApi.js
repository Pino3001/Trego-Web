import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import { obtenerMockMenu } from '../data/mockMenu'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

export async function obtenerMenuRestaurante(idRestaurante) {
  if (USE_MOCK) {
    await delay(350)
    return obtenerMockMenu(idRestaurante)
  }

  try {
    const url = ENDPOINTS.MENU_RESTAURANTE.replace(':id', idRestaurante)
    const { data } = await api.get(url)
    return {
      restaurante: data.restaurante ?? data,
      productos: data.productos ?? [],
    }
  } catch {
    console.warn('[Trego] API menú no disponible, usando mock')
    return obtenerMockMenu(idRestaurante)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
