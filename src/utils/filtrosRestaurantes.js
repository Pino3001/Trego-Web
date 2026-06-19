import { obtenerPrecios } from './productos.js'

export const OPCIONES_ORDEN = [
  { value: 'calificacion_desc', label: 'Mejor calificación' },
  { value: 'calificacion_asc', label: 'Menor calificación' },
  { value: 'nombre_asc', label: 'Nombre A-Z' },
  { value: 'nombre_desc', label: 'Nombre Z-A' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
]

export const FILTROS_INICIALES = {
  categoria: '',
  calificacionMin: 0,
  horarioDesde: '',
  horarioHasta: '',
  precioMin: '',
  precioMax: '',
  ordenamiento: 'calificacion_desc',
}

function precioProducto(producto) {
  return obtenerPrecios(producto).conDescuento
}

function precioMinimoEnProductos(productos) {
  if (!productos?.length) return null
  return Math.min(...productos.map(precioProducto))
}

function pasaFiltroHorario(restaurante, filtros) {
  const { horarioDesde, horarioHasta } = filtros
  if (!horarioDesde && !horarioHasta) return true

  const horario = restaurante.horarioServicio
  if (!horario?.length) return true

  const apertura = horario[0]
  const cierre = horario[1] ?? horario[0]

  if (horarioDesde && cierre < horarioDesde) return false
  if (horarioHasta && apertura > horarioHasta) return false
  return true
}

function pasaFiltroPrecioProductos(productos, filtros) {
  const min = filtros.precioMin !== '' ? Number(filtros.precioMin) : null
  const max = filtros.precioMax !== '' ? Number(filtros.precioMax) : null
  if (min == null && max == null) return productos

  return (productos ?? []).filter((p) => {
    const precio = precioProducto(p)
    if (min != null && !Number.isNaN(min) && precio < min) return false
    if (max != null && !Number.isNaN(max) && precio > max) return false
    return true
  })
}

/** Filtra lista de restaurantes (modo exploración / zona). */
export function filtrarRestaurantes(restaurantes, filtros) {
  return (restaurantes ?? []).filter((r) => {
    if (filtros.categoria && r.categoria !== filtros.categoria) return false
    if (filtros.calificacionMin > 0 && (r.calificacionProm ?? 0) < filtros.calificacionMin) {
      return false
    }
    return pasaFiltroHorario(r, filtros)
  })
}

/** Filtra resultados de búsqueda por plato o por nombre de restaurante. */
export function filtrarResultadosPlato(resultados, filtros) {
  return (resultados ?? [])
    .map(({ restaurante, productos, coincidenciaPorNombre }) => {
      if (filtros.categoria && restaurante.categoria !== filtros.categoria) return null
      if (
        filtros.calificacionMin > 0 &&
        (restaurante.calificacionProm ?? 0) < filtros.calificacionMin
      ) {
        return null
      }
      if (!pasaFiltroHorario(restaurante, filtros)) return null

      const productosFiltrados = pasaFiltroPrecioProductos(productos, filtros)
      if (productosFiltrados.length === 0 && !coincidenciaPorNombre) return null

      return { restaurante, productos: productosFiltrados, coincidenciaPorNombre }
    })
    .filter(Boolean)
}

/** Agrupa ofertas por restaurante y aplica filtros. */
export function agruparOfertasPorRestaurante(ofertasZona, filtros) {
  const mapa = new Map()

  for (const item of ofertasZona ?? []) {
    const id = item.idRestaurante ?? item.producto?.idRestaurante
    if (!id) continue

    const productosFiltrados = pasaFiltroPrecioProductos([item.producto], filtros)
    if (productosFiltrados.length === 0) continue

    const calificacion = item.calificacionProm ?? 0
    if (filtros.calificacionMin > 0 && calificacion < filtros.calificacionMin) continue

    if (!mapa.has(id)) {
      mapa.set(id, {
        idRestaurante: id,
        nombre: item.nombreRestaurante,
        calificacionProm: calificacion,
        productos: [],
        direccion: item.direccion,
      })
    }
    mapa.get(id).productos.push(item.producto)
  }

  return [...mapa.values()]
}

/** Lista plana de platos en oferta (un ítem por producto). */
export function filtrarOfertasPlatos(ofertasZona, filtros) {
  return (ofertasZona ?? [])
    .filter((item) => {
      const id = item.idRestaurante ?? item.producto?.idRestaurante
      if (!id || !item.producto) return false

      const calificacion = item.calificacionProm ?? 0
      if (filtros.calificacionMin > 0 && calificacion < filtros.calificacionMin) {
        return false
      }

      const productosFiltrados = pasaFiltroPrecioProductos([item.producto], filtros)
      return productosFiltrados.length > 0
    })
    .map((item) => ({
      producto: item.producto,
      idRestaurante: item.idRestaurante ?? item.producto?.idRestaurante,
      nombreRestaurante: item.nombreRestaurante ?? '',
      calificacionProm: item.calificacionProm ?? 0,
    }))
}

export function ordenarOfertasPlatos(ofertas, orden) {
  const lista = [...(ofertas ?? [])].map((o) => ({
    ...o,
    _precioRef: precioProducto(o.producto),
    _nombrePlato: o.producto?.nombre ?? '',
  }))

  switch (orden) {
    case 'calificacion_asc':
      return lista.sort((a, b) => (a.calificacionProm ?? 0) - (b.calificacionProm ?? 0))
    case 'nombre_asc':
      return lista.sort((a, b) =>
        a._nombrePlato.localeCompare(b._nombrePlato, 'es'),
      )
    case 'nombre_desc':
      return lista.sort((a, b) =>
        b._nombrePlato.localeCompare(a._nombrePlato, 'es'),
      )
    case 'precio_asc':
      return lista.sort(
        (a, b) =>
          a._precioRef - b._precioRef ||
          a._nombrePlato.localeCompare(b._nombrePlato, 'es'),
      )
    case 'precio_desc':
      return lista.sort(
        (a, b) =>
          b._precioRef - a._precioRef ||
          a._nombrePlato.localeCompare(b._nombrePlato, 'es'),
      )
    case 'calificacion_desc':
    default:
      return lista.sort((a, b) => (b.calificacionProm ?? 0) - (a.calificacionProm ?? 0))
  }
}

export function ordenarRestaurantes(restaurantes, orden) {
  const lista = [...(restaurantes ?? [])]
  switch (orden) {
    case 'calificacion_asc':
      return lista.sort((a, b) => (a.calificacionProm ?? 0) - (b.calificacionProm ?? 0))
    case 'nombre_asc':
      return lista.sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
    case 'nombre_desc':
      return lista.sort((a, b) => (b.nombre ?? '').localeCompare(a.nombre ?? '', 'es'))
    case 'precio_asc':
      return lista.sort(
        (a, b) => (a._precioRef ?? 0) - (b._precioRef ?? 0) || (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'),
      )
    case 'precio_desc':
      return lista.sort(
        (a, b) => (b._precioRef ?? 0) - (a._precioRef ?? 0) || (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'),
      )
    case 'calificacion_desc':
    default:
      return lista.sort((a, b) => (b.calificacionProm ?? 0) - (a.calificacionProm ?? 0))
  }
}

export function ordenarResultadosPlato(resultados, orden) {
  const enriquecidos = (resultados ?? []).map(({ restaurante, productos }) => ({
    restaurante: {
      ...restaurante,
      _precioRef: precioMinimoEnProductos(productos),
      _productosCoincidentes: productos,
    },
    productos,
  }))

  const ordenados = ordenarRestaurantes(
    enriquecidos.map((r) => r.restaurante),
    orden,
  )

  return ordenados.map((r) => ({
    restaurante: r,
    productos: r._productosCoincidentes ?? [],
  }))
}

export function ordenarOfertasAgrupadas(grupos, orden) {
  const enriquecidos = (grupos ?? []).map((g) => ({
    ...g,
    _precioRef: precioMinimoEnProductos(g.productos),
    calificacionProm: g.calificacionProm ?? 0,
    nombre: g.nombre,
    idUsuario: g.idRestaurante,
    idRestaurante: g.idRestaurante,
    tieneOfertas: true,
    abierto: true,
    reparteEnZona: true,
    fotoPerfil: g.productos?.[0]?.fotoPlato ?? g.productos?.[0]?.urlImagen,
    descripcion: g.productos?.length
      ? `${g.productos.length} oferta${g.productos.length > 1 ? 's' : ''} activa${g.productos.length > 1 ? 's' : ''}`
      : 'Ofertas disponibles',
  }))

  return ordenarRestaurantes(enriquecidos, orden)
}

export function hayFiltrosActivos(filtros) {
  return (
    !!filtros.categoria ||
    filtros.calificacionMin > 0 ||
    !!filtros.horarioDesde ||
    !!filtros.horarioHasta ||
    filtros.precioMin !== '' ||
    filtros.precioMax !== ''
  )
}
