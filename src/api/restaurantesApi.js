import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import {
  mockRestaurantes,
  MOCK_CLIENTE_COORDS,
} from '../data/mockRestaurantes'
import {
  aplicaFiltros,
  buscarPorNombre,
  distanciaKm,
  filtrarRestaurantesZona,
} from '../utils/restaurantes'
import { mapearRestaurante } from './mapeadores'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

function mockZona(params) {
  const { latitud, longitud, ...filtros } = params
  const lat = latitud ?? MOCK_CLIENTE_COORDS.latitud
  const lng = longitud ?? MOCK_CLIENTE_COORDS.longitud
  let lista = filtrarRestaurantesZona(mockRestaurantes, lat, lng)
  lista = aplicaFiltros(lista, filtros)
  return lista
}

function mockBuscar(params) {
  const { nombre, latitud, longitud } = params
  const lat = latitud ?? MOCK_CLIENTE_COORDS.latitud
  const lng = longitud ?? MOCK_CLIENTE_COORDS.longitud
  const habilitados = mockRestaurantes.filter((r) => r.habilitado)
  return buscarPorNombre(habilitados, nombre).map((r) => ({
    ...r,
    reparteEnZona: r.reparteEnZona ?? reparteEnZonaMock(r, lat, lng),
  }))
}

function reparteEnZonaMock(r, lat, lng) {
  const dir = r.direccion
  if (!dir) return r.reparteEnZona ?? true
  const km = distanciaKm(lat, lng, dir.latitud, dir.longitud)
  return km <= (r.radioEntregaKm ?? 5)
}

async function listarDesdeBackend(nombre) {
  const params = nombre?.trim() ? { nombre: nombre.trim() } : undefined
  // falta endpoint backend: para zona usar ENDPOINTS.RESTAURANTES_ZONA (hoy se filtra en cliente)
  const { data } = await api.get(ENDPOINTS.RESTAURANTES, { params })
  const lista = Array.isArray(data) ? data : data.restaurantes ?? []
  return lista.map(mapearRestaurante).filter(Boolean)
}

/** GET con filtro por zona/coords — falta endpoint backend (hoy usa GET /api/restaurantes + filtro en cliente). */
export async function obtenerRestaurantesZona(params) {
  if (USE_MOCK) {
    await delay(400)
    return mockZona(params)
  }

  try {
    const lista = await listarDesdeBackend()
    const { latitud, longitud, ...filtros } = params
    const lat = latitud ?? MOCK_CLIENTE_COORDS.latitud
    const lng = longitud ?? MOCK_CLIENTE_COORDS.longitud
    let filtrada = filtrarRestaurantesZona(lista, lat, lng)
    filtrada = aplicaFiltros(filtrada, filtros)
    return filtrada
  } catch {
    console.warn('[Trego] API restaurantes no disponible, usando mock')
    return mockZona(params)
  }
}

export async function buscarRestaurantes(params) {
  if (USE_MOCK) {
    await delay(350)
    return mockBuscar(params)
  }

  try {
    const lista = await listarDesdeBackend(params.nombre)
    const { latitud, longitud } = params
    const lat = latitud ?? MOCK_CLIENTE_COORDS.latitud
    const lng = longitud ?? MOCK_CLIENTE_COORDS.longitud
    return lista.map((r) => ({
      ...r,
      reparteEnZona: r.reparteEnZona ?? reparteEnZonaMock(r, lat, lng),
    }))
  } catch {
    console.warn('[Trego] API buscar no disponible, usando mock')
    return mockBuscar(params)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
