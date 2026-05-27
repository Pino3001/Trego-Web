import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth'
import { mapearDireccionUi } from './mapeadores'

/** falta endpoint backend */
export async function guardarDireccion(_direccion) {
  throw new Error('guardarDireccion: falta endpoint backend')
}

export async function obtenerDireccionesGuardadas() {
  const response = await fetchConAuth(ENDPOINTS.USUARIO_DIRECCIONES)
  if (!response.ok) {
    if (response.status === 401) return []
    throw new Error('No se pudieron cargar las direcciones')
  }
  const lista = await response.json()
  if (!Array.isArray(lista)) return []
  return lista.map(mapearDireccionUi)
}
