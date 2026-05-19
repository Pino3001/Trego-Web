export function precioConDescuento(precio, descuentoPorcentaje) {
  if (!descuentoPorcentaje) return precio
  return Math.round(precio * (1 - descuentoPorcentaje / 100))
}

export function productosConOferta(productos) {
  return productos.filter((p) => p.ofertaActiva && p.oferta)
}

export function filtrarPorCategoria(productos, categoriaId) {
  if (!categoriaId) return productos
  return productos.filter((p) => p.categoria === categoriaId)
}

export function ordenarPorPrecio(productos, orden) {
  if (!orden) return [...productos]
  const lista = [...productos]
  lista.sort((a, b) => (orden === 'asc' ? a.precio - b.precio : b.precio - a.precio))
  return lista
}
