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

export async function obtenerRestaurantesZona(params) {
  if (USE_MOCK) {
    await delay(400)
    return mockZona(params)
  }

  try {
    const { data } = await api.get(ENDPOINTS.RESTAURANTES_ZONA, { params })
    return Array.isArray(data) ? data : data.restaurantes ?? []
  } catch {
    console.warn('[Trego] API zona no disponible, usando mock')
    return mockZona(params)
  }
}

export async function buscarRestaurantes(params) {
  if (USE_MOCK) {
    await delay(350)
    return mockBuscar(params)
  }

  try {
    const { data } = await api.get(ENDPOINTS.RESTAURANTES_BUSCAR, { params })
    return Array.isArray(data) ? data : data.restaurantes ?? []
  } catch {
    console.warn('[Trego] API buscar no disponible, usando mock')
    return mockBuscar(params)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
