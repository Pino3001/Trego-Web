import { ENDPOINTS } from './endpoints.js'
import { fetchConAuth } from './header/fetchConAuth.js'
import { mapearProducto } from './mapeadores.js'
import { obtenerMenuRestaurante } from './menuApi.js'
import { esProductoOfertaVigente } from '../utils/productos.js'

function mapearProductoZona(dto) {
  if (!dto) return null
  const producto = mapearProducto(dto.producto ?? dto)
  if (!producto) return null
  const idRestaurante =
    producto.idRestaurante ??
    dto.producto?.idRestaurante ??
    dto.idRestaurante
  return {
    producto: { ...producto, idRestaurante },
    nombreRestaurante: dto.nombreRestaurante ?? '',
    calificacionProm: dto.calificacionProm ?? 0,
    idRestaurante,
    direccion: dto.direccion,
  }
}

/** Fallback: ofertas desde menús de restaurantes ya filtrados por zona. */
async function obtenerOfertasDesdeMenus(restaurantesZona) {
  if (!restaurantesZona?.length) return []

  const resultados = await Promise.allSettled(
    restaurantesZona.map(async (restaurante) => {
      const id = restaurante.idUsuario ?? restaurante.idRestaurante
      if (!id) return []

      const menu = await obtenerMenuRestaurante(id)
      const productos = (menu.productos ?? [])
        .map((p) => mapearProducto(p))
        .filter(Boolean)
        .filter(esProductoOfertaVigente)

      return productos.map((producto) => ({
        producto: { ...producto, idRestaurante: id },
        nombreRestaurante: restaurante.nombre ?? menu.restaurante?.nombre ?? '',
        calificacionProm:
          restaurante.calificacionProm ?? menu.restaurante?.calificacionProm ?? 0,
        idRestaurante: id,
        direccion: restaurante.direccion ?? menu.restaurante?.direccion,
      }))
    }),
  )

  return resultados.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

async function listarOfertasDesdeApi(coords) {
  const response = await fetchConAuth(ENDPOINTS.LISTAR_PRODUCTOS_OFERTA, {
    method: 'POST',
    body: JSON.stringify({
      latitud: coords.latitud,
      longitud: coords.longitud,
    }),
  })

  if (response.status === 404) return []
  if (!response.ok) return null

  const data = await response.json()
  const lista = Array.isArray(data) ? data : []
  return lista.map(mapearProductoZona).filter(Boolean)
}

/** Productos con oferta activa en la zona del cliente. */
export async function listarProductosOfertaEnZona(coords, restaurantesZona = []) {
  if (!coords) return []

  try {
    const desdeApi = await listarOfertasDesdeApi(coords)
    if (desdeApi === null) {
      return obtenerOfertasDesdeMenus(restaurantesZona)
    }
    if (desdeApi.length > 0) {
      return desdeApi
    }
  } catch {
    // API no disponible → fallback por menús
  }

  return obtenerOfertasDesdeMenus(restaurantesZona)
}

/**
 * Busca en la zona por nombre de restaurante o por platos en el menú.
 * No hay endpoint dedicado en el back: se consulta el menú de cada local en paralelo.
 */
export async function buscarPlatosEnZona(restaurantesZona, termino) {
  const terminoNorm = termino.toLowerCase().trim()
  if (!terminoNorm || !restaurantesZona?.length) return []

  const resultados = await Promise.allSettled(
    restaurantesZona.map(async (restaurante) => {
      const id = restaurante.idUsuario ?? restaurante.idRestaurante
      if (!id) return null

      const nombreRest = (restaurante.nombre ?? '').toLowerCase()
      const descRest = (restaurante.descripcion ?? '').toLowerCase()
      const catRest = (restaurante.categoria ?? '').toLowerCase()
      const coincidenciaPorNombre =
        nombreRest.includes(terminoNorm) ||
        descRest.includes(terminoNorm) ||
        catRest.includes(terminoNorm)

      let productos = []
      try {
        const menu = await obtenerMenuRestaurante(id)
        productos = (menu.productos ?? [])
          .map((p) => mapearProducto(p))
          .filter(Boolean)
          .filter((p) => {
            const nombre = (p.nombre ?? '').toLowerCase()
            const desc = (p.descripcion ?? '').toLowerCase()
            return nombre.includes(terminoNorm) || desc.includes(terminoNorm)
          })
      } catch {
        // Si falla el menú pero el nombre del local coincide, igual lo mostramos
      }

      if (productos.length === 0 && !coincidenciaPorNombre) return null

      return {
        restaurante,
        productos,
        coincidenciaPorNombre,
      }
    }),
  )

  return resultados
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value)
}
