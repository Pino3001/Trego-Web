import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import { mapearRestaurante } from './mapeadores'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

async function listarDesdeBackend(nombre) {
  const params = nombre?.trim() ? { nombre: nombre.trim() } : undefined
  const { data } = await api.get(ENDPOINTS.RESTAURANTES, { params })
  const lista = Array.isArray(data) ? data : data.restaurantes ?? []
  return lista.map(mapearRestaurante).filter(Boolean)
}

async function listarZonaDesdeBackend(latitud, longitud) {
  try {
    const { data } = await api.post(ENDPOINTS.RESTAURANTES_ZONA, {
      latitud,
      longitud,
    })
    const lista = Array.isArray(data) ? data : []
    return lista.map(mapearRestaurante).filter(Boolean)
  } catch (err) {
    if (err.response?.status === 404) return []
    throw err
  }
}

/** Listado por ubicación: el backend filtra por cobertura de entrega. */
export async function obtenerRestaurantesZona(params) {
  const { latitud, longitud } = params
  return listarZonaDesdeBackend(latitud, longitud)
}

/** Búsqueda por nombre: el backend devuelve restaurantes habilitados que coinciden. */
export async function buscarRestaurantes(params) {
  return listarDesdeBackend(params.nombre)
}
