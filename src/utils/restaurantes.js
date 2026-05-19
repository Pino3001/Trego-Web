export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function reparteEnZona(restaurante, latitud, longitud) {
  if (restaurante.reparteEnZona != null) return restaurante.reparteEnZona
  const dir = restaurante.direccion
  if (!dir?.latitud || !latitud) return true
  const km = distanciaKm(latitud, longitud, dir.latitud, dir.longitud)
  return km <= (restaurante.radioEntregaKm ?? 5)
}

export function formatearHorario(horarioServicio) {
  if (!horarioServicio?.length) return '—'
  if (horarioServicio.length >= 2) {
    return `${horarioServicio[0]} - ${horarioServicio[horarioServicio.length - 1]}`
  }
  return horarioServicio[0]
}

export function aplicaFiltros(restaurantes, filtros) {
  let lista = [...restaurantes]

  if (filtros.categoria) {
    lista = lista.filter((r) => r.categoria === filtros.categoria)
  }

  if (filtros.calificacionMin > 0) {
    lista = lista.filter((r) => r.calificacionProm >= filtros.calificacionMin)
  }

  if (filtros.horarioDesde && filtros.horarioHasta) {
    lista = lista.filter((r) => {
      const [desde] = r.horarioServicio ?? []
      const [, hasta] =
        r.horarioServicio?.length >= 2
          ? r.horarioServicio
          : [null, r.horarioServicio?.[0]]
      if (!desde) return true
      return desde <= filtros.horarioHasta && (hasta ?? '23:59') >= filtros.horarioDesde
    })
  }

  return lista
}

/** Listado principal: habilitados, abiertos y que reparten en zona */
export function filtrarRestaurantesZona(restaurantes, latitud, longitud) {
  return restaurantes.filter(
    (r) =>
      r.habilitado &&
      r.abierto &&
      reparteEnZona(r, latitud, longitud),
  )
}

export function buscarPorNombre(restaurantes, nombre) {
  const q = nombre.trim().toLowerCase()
  if (!q) return restaurantes
  return restaurantes.filter(
    (r) =>
      r.nombre?.toLowerCase().includes(q) ||
      r.razonSocial?.toLowerCase().includes(q),
  )
}
