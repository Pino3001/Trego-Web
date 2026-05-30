import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MenuApiError, obtenerMenuRestaurante } from '../api/menuApi'
import { productosConOferta } from '../utils/productos'

export function useMenuRestaurante(idRestaurante) {
  const [menu, setMenu] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [categoria, setCategoria] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const restauranteRef = useRef(null)

  const cargar = useCallback(async () => {
    if (!idRestaurante) return
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerMenuRestaurante(idRestaurante, {
        categoria,
        ordenPrecio,
      })
      if (data.restaurante) {
        restauranteRef.current = data.restaurante
      }
      setMenu({
        restaurante: data.restaurante ?? restauranteRef.current,
        productos: data.productos,
        mensaje: data.mensaje,
      })
    } catch (e) {
      if (e instanceof MenuApiError && e.status === 404) {
        setError('El restaurante no existe o no está disponible')
      } else {
        setError(e.message ?? 'Error al cargar el menú')
      }
      setMenu(null)
    } finally {
      setCargando(false)
    }
  }, [idRestaurante, categoria, ordenPrecio])

  useEffect(() => {
    cargar()
  }, [cargar])

  const productos = menu?.productos ?? []

  const ofertas = useMemo(() => productosConOferta(productos), [productos])

  const sinProductos = !!menu?.restaurante && !categoria && productos.length === 0
  const sinProductosEnCategoria = !!categoria && productos.length === 0 && !!menu?.restaurante

  return {
    menu,
    cargando,
    error,
    categoria,
    setCategoria,
    ordenPrecio,
    setOrdenPrecio,
    productosFiltrados: productos,
    ofertas,
    sinProductos,
    sinProductosEnCategoria,
    recargar: cargar,
  }
}
