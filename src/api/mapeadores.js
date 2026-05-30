/** Convierte respuestas del backend al formato que usa el front. */

function formatearHora(hora) {
  if (!hora) return null
  const s = String(hora)
  return s.length >= 5 ? s.slice(0, 5) : s
}

export function mapearRestaurante(dto) {
  if (!dto) return null
  const id = dto.idRestaurante ?? dto.idUsuario
  const horaA = formatearHora(dto.horaApertura)
  const horaC = formatearHora(dto.horaCierre)
  const horarioServicio =
    horaA && horaC ? [horaA, horaC] : dto.horarioServicio ?? ['12:00', '23:00']

  return {
    idUsuario: id,
    idRestaurante: id,
    nombre: dto.nombre,
    razonSocial: dto.razonSocial ?? dto.nombre,
    descripcion: dto.descripcion ?? '',
    categoria: dto.categoria ?? '',
    calificacionProm: dto.calificacionProm ?? 0,
    cantidadResenas: dto.cantidadResenas ?? 0,
    habilitado: dto.habilitado ?? true,
    abierto: dto.abierto ?? true,
    reparteEnZona: dto.reparteEnZona ?? true,
    tieneOfertas: dto.tieneOfertas ?? false,
    fotoPerfil: dto.fotoPerfil,
    fotoPortada: dto.fotoPortada,
    direccion: dto.direccion
      ? {
          nombre: dto.direccion.calle ?? dto.direccion.nombre ?? 'Montevideo',
          ciudad: dto.direccion.ciudad ?? 'Montevideo',
          latitud: dto.direccion.latitud,
          longitud: dto.direccion.longitud,
          nroPuerta: dto.direccion.numero ?? dto.direccion.nroPuerta,
        }
      : { nombre: 'Montevideo', ciudad: 'Montevideo' },
    horarioServicio,
    radioEntregaKm: dto.radioEntrega ?? dto.radioEntregaKm ?? 5,
  }
}

export function mapearProducto(dto) {
  if (!dto) return null
  const ofertaActiva = !!dto.oferta
  return {
    idProducto: dto.idProducto,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? '',
    precio: dto.precio,
    categoria: typeof dto.categoria === 'string' ? dto.categoria : dto.categoria?.name ?? '',
    fotoPlato: dto.urlImagen ?? dto.fotoPlato,
    ofertaActiva,
    oferta: dto.oferta
      ? {
          descuentoPorcentaje: dto.oferta.descuento ?? dto.oferta.descuentoPorcentaje,
          descripcion: dto.oferta.descripcion,
        }
      : undefined,
    ingredientes: dto.ingredientes ?? [],
    idRestaurante: dto.idRestaurante,
  }
}

export function mapearMenuRespuesta(data) {
  if (!data) return null
  if (data.mensaje && !data.idRestaurante && !data.productos) {
    return {
      restaurante: null,
      productos: [],
      mensaje: data.mensaje,
    }
  }
  const restaurante = mapearRestaurante(data)
  const productos = (data.productos ?? []).map(mapearProducto).filter(Boolean)
  return { restaurante, productos }
}

export function mapearLineaCarritoAItem(linea) {
  const p = linea.producto ?? {}
  return {
    idProducto: p.idProducto ?? linea.idProducto,
    nombre: p.nombre ?? 'Producto',
    precio: p.precioOferta ?? p.precio ?? 0,
    fotoPlato: p.urlImagen ?? p.fotoPlato,
    cantidad: linea.cantidad ?? 1,
    comentarios: linea.observaciones ?? '',
    ingredientesQuitados: (linea.ingredientesAQuitar ?? []).map((i) => i.nombre ?? i),
  }
}

export function mapearCarritoDtoAItems(carritoDto) {
  if (!carritoDto?.productos) return []
  return carritoDto.productos.map(mapearLineaCarritoAItem)
}

export function mapearDireccionUi(direccion, indice) {
  const calle = direccion.calle ?? ''
  const numero = direccion.numero ?? ''
  const nombre =
    calle.trim() !== ''
      ? `${calle}${numero ? ` ${numero}` : ''}`
      : `Dirección ${indice + 1}`
  const descripcion =
    direccion.esquina?.trim() ||
    `Lat ${Number(direccion.latitud).toFixed(4)}, Lng ${Number(direccion.longitud).toFixed(4)}`

  return {
    id: `dir-${indice}`,
    nombre,
    descripcion,
    datos: direccion,
  }
}

/** Body para POST/PATCH /api/carrito/productos */
export function armarProductoPedidoRequest({
  producto,
  cantidad,
  comentarios,
  idRestaurante,
}) {
  return {
    cantidad: cantidad ?? 1,
    observaciones: comentarios ?? '',
    producto: {
      idProducto: producto.idProducto,
      idRestaurante: idRestaurante ?? producto.idRestaurante,
    },
  }
}

export function ordenFrontABackend(ordenPrecio) {
  if (ordenPrecio === 'asc') return 'precio_asc'
  if (ordenPrecio === 'desc') return 'precio_desc'
  return undefined
}
