import { useCallback, useEffect, useMemo, useState } from 'react'
import { obtenerMenuRestaurante } from '../api/menuApi'
import {
  filtrarPorCategoria,
  ordenarPorPrecio,
  productosConOferta,
} from '../utils/productos'

export function useMenuRestaurante(idRestaurante) {
  const [menu, setMenu] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [categoria, setCategoria] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')

  const cargar = useCallback(async () => {
    if (!idRestaurante) return
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerMenuRestaurante(idRestaurante)
      setMenu(data)
    } catch (e) {
      setError(e.message ?? 'Error al cargar el menú')
      setMenu(null)
    } finally {
      setCargando(false)
    }
  }, [idRestaurante])

  useEffect(() => {
    cargar()
  }, [cargar])

  const productosFiltrados = useMemo(() => {
    if (!menu?.productos) return []
    let lista = filtrarPorCategoria(menu.productos, categoria)
    lista = ordenarPorPrecio(lista, ordenPrecio)
    return lista
  }, [menu, categoria, ordenPrecio])

  const ofertas = useMemo(() => {
    if (!menu?.productos) return []
    return productosConOferta(menu.productos)
  }, [menu])

  const sinProductos = menu && menu.productos.length === 0
  const sinProductosEnCategoria =
    menu && menu.productos.length > 0 && productosFiltrados.length === 0 && !!categoria

  return {
    menu,
    cargando,
    error,
    categoria,
    setCategoria,
    ordenPrecio,
    setOrdenPrecio,
    productosFiltrados,
    ofertas,
    sinProductos,
    sinProductosEnCategoria,
    recargar: cargar,
  }
}
