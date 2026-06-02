import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth.js'
import { mapearRestaurante } from './mapeadores'

async function listarDesdeBackend(nombre) {
  const params = nombre?.trim() ? `?nombre=${encodeURIComponent(nombre.trim())}` : ''
  const response = await fetchConAuth(`${ENDPOINTS.RESTAURANTES}${params}`)
  if (!response.ok) throw new Error('Error al listar restaurantes')
  const data = await response.json()
  const lista = Array.isArray(data) ? data : data.restaurantes ?? []
  return lista.map(mapearRestaurante).filter(Boolean)
}

async function listarZonaDesdeBackend(latitud, longitud) {
  const response = await fetchConAuth(ENDPOINTS.RESTAURANTES_ZONA, {
    method: 'POST',
    body: JSON.stringify({ latitud, longitud }),
  })
  if (response.status === 404) return []
  if (!response.ok) throw new Error('Error al listar por zona')
  const data = await response.json()
  const lista = Array.isArray(data) ? data : []
  return lista.map(mapearRestaurante).filter(Boolean)
}

export async function obtenerRestaurantesZona(params) {
  const { latitud, longitud } = params
  return listarZonaDesdeBackend(latitud, longitud)
}

export async function buscarRestaurantes(params) {
  return listarDesdeBackend(params.nombre)
}

/** Todos los restaurantes habilitados (para resolver nombres en historial, etc.). */
export async function listarRestaurantesTodos() {
  const response = await fetchConAuth(ENDPOINTS.RESTAURANTES_TODOS)
  if (!response.ok) throw new Error('Error al listar restaurantes')
  const data = await response.json()
  const lista = Array.isArray(data) ? data : []
  return lista.map(mapearRestaurante).filter(Boolean)
}