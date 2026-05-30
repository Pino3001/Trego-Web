import { reverseGeocodeGeoapify } from './apiGeoapify'
import { reverseGeocodeNominatim } from './nominatim'
import { precioConDescuento } from '../utils/productos'

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
  if (data.mensaje && !data.idRestaurante && !data.idUsuario && !data.productos) {
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

/** Texto corto para UI: "Calle 1234" */
export function nombreDireccionDesdeCampos(calle, numero) {
  const c = String(calle ?? '').trim()
  if (!c) return null
  const n = numero != null && String(numero).trim() !== '' ? String(numero).trim() : ''
  return n ? `${c} ${n}` : c
}

function armarResultadoDireccion({ nombre, calle, numero, esquina, latitud, longitud }) {
  return {
    nombre,
    datos: {
      calle: calle || nombre,
      numero: Number(numero) || 0,
      apartamento: 0,
      esquina: esquina ?? '',
      latitud,
      longitud,
    },
  }
}

function direccionDesdeNominatim(data, latitud, longitud) {
  const addr = data.address ?? {}
  const calleRaw =
    addr.road ||
    addr.pedestrian ||
    addr.footway ||
    addr.residential ||
    addr.cycleway ||
    addr.path ||
    ''
  const barrio = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || ''
  const ciudad = addr.city || addr.town || addr.village || 'Montevideo'
  const numero = addr.house_number ?? ''

  let calle = calleRaw.trim()
  if (!calle && barrio) calle = barrio

  let nombre =
    nombreDireccionDesdeCampos(calle, numero) ||
    (calle ? calle : '') ||
    (barrio ? `${barrio}, ${ciudad}` : '')

  if (!nombre && data.display_name) {
    const partes = data.display_name
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    nombre = partes.length >= 2 ? `${partes[0]}, ${partes[1]}` : partes[0] || `Cerca de ${ciudad}`
    if (!calle && partes[0]) calle = partes[0]
  }

  if (!nombre) nombre = `Cerca de ${ciudad}`

  return armarResultadoDireccion({
    nombre,
    calle: calle || nombre.split(',')[0].trim(),
    numero,
    esquina: '',
    latitud,
    longitud,
  })
}

function direccionDesdeGeoapify(geo, latitud, longitud) {
  const nombre =
    nombreDireccionDesdeCampos(geo.calle, geo.numero) ||
    geo.direccionCompleta?.trim() ||
    'Ubicación actual'
  return armarResultadoDireccion({
    nombre,
    calle: geo.calle?.trim() || nombre,
    numero: geo.numero,
    esquina: geo.esquina ?? '',
    latitud,
    longitud,
  })
}

/** ¿El label guardado es solo coordenadas crudas? */
export function esLabelSoloCoordenadas(nombre) {
  if (!nombre) return false
  return /^Lat\s-?\d/i.test(nombre) || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(nombre)
}

/** Resuelve coords GPS → nombre + DTO (Geoapify → Nominatim → texto genérico). */
export async function resolverDireccionDesdeCoords(coords) {
  const latitud = Number(coords?.latitud)
  const longitud = Number(coords?.longitud)
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return armarResultadoDireccion({
      nombre: 'Ubicación actual',
      calle: 'Ubicación actual',
      numero: 0,
      esquina: '',
      latitud: 0,
      longitud: 0,
    })
  }

  const geo = await reverseGeocodeGeoapify(latitud, longitud)
  if (geo?.calle || geo?.direccionCompleta) {
    return direccionDesdeGeoapify(geo, latitud, longitud)
  }

  const nominatim = await reverseGeocodeNominatim(latitud, longitud)
  if (nominatim && (nominatim.address || nominatim.display_name)) {
    return direccionDesdeNominatim(nominatim, latitud, longitud)
  }

  return armarResultadoDireccion({
    nombre: 'Tu ubicación en Montevideo',
    calle: 'Ubicación actual',
    numero: 0,
    esquina: '',
    latitud,
    longitud,
  })
}

export function mapearDireccionUi(direccion, indice) {
  const calle = direccion.calle ?? ''
  const numero = direccion.numero ?? ''
  const nombre = nombreDireccionDesdeCampos(calle, numero) ?? `Dirección ${indice + 1}`
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

/** Precio que enviamos al carrito (con descuento si hay oferta activa). */
export function precioProductoParaApi(producto) {
  if (!producto) return 0
  const base = Number(producto.precio) || 0
  const descuento =
    producto.ofertaActiva && producto.oferta
      ? (producto.oferta.descuentoPorcentaje ?? 0)
      : 0
  return precioConDescuento(base, descuento)
}

/** Objeto producto mínimo para DTOProductoPedido (el back exige precio en el JSON). */
export function productoMinimoParaCarrito(producto, idRestaurante) {
  return {
    idProducto: producto.idProducto,
    idRestaurante: idRestaurante ?? producto.idRestaurante,
    precio: precioProductoParaApi(producto),
    nombre: producto.nombre,
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
    producto: productoMinimoParaCarrito(producto, idRestaurante),
  }
}

export function ordenFrontABackend(ordenPrecio) {
  if (ordenPrecio === 'asc') return 'precio_asc'
  if (ordenPrecio === 'desc') return 'precio_desc'
  return undefined
}
