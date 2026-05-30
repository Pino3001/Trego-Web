import { useCallback, useState } from 'react'
import {
  buscarRestaurantes,
  obtenerRestaurantesZona,
} from '../api/restaurantesApi'

const FILTROS_INICIALES = {
  categoria: '',
  calificacionMin: 0,
  horarioDesde: '',
  horarioHasta: '',
}

export function useRestaurantes() {
  const [restaurantes, setRestaurantes] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [modoBusqueda, setModoBusqueda] = useState(false)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const cargarZona = useCallback(
    async (coords) => {
      if (!coords) return
      setCargando(true)
      setError(null)
      setModoBusqueda(false)
      try {
        const data = await obtenerRestaurantesZona({
          latitud: coords.latitud,
          longitud: coords.longitud,
        })
        setRestaurantes(data)
      } catch (e) {
        setError(e.message ?? 'Error al cargar restaurantes')
        setRestaurantes([])
      } finally {
        setCargando(false)
      }
    },
    [],
  )

  const buscar = useCallback(async (coords, nombre) => {
    if (!coords || !nombre.trim()) return
    setCargando(true)
    setError(null)
    setModoBusqueda(true)
    setTerminoBusqueda(nombre)
    try {
      const data = await buscarRestaurantes({
        latitud: coords.latitud,
        longitud: coords.longitud,
        nombre: nombre.trim(),
      })
      setRestaurantes(data)
    } catch (e) {
      setError(e.message ?? 'Error en la búsqueda')
      setRestaurantes([])
    } finally {
      setCargando(false)
    }
  }, [])

  const aplicarFiltros = useCallback(
    async (coords, nuevosFiltros) => {
      setFiltros(nuevosFiltros)
      await cargarZona(coords)
    },
    [cargarZona],
  )

  const limpiarFiltros = useCallback(
    async (coords) => {
      const vacios = { ...FILTROS_INICIALES }
      setFiltros(vacios)
      await cargarZona(coords)
    },
    [cargarZona],
  )

  const recargar = useCallback(
    (coords) => {
      if (modoBusqueda && terminoBusqueda) {
        return buscar(coords, terminoBusqueda)
      }
      return cargarZona(coords)
    },
    [modoBusqueda, terminoBusqueda, buscar, cargarZona],
  )

  return {
    restaurantes,
    filtros,
    cargando,
    error,
    modoBusqueda,
    terminoBusqueda,
    cargarZona,
    buscar,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos:
      !!filtros.categoria ||
      filtros.calificacionMin > 0 ||
      !!filtros.horarioDesde ||
      !!filtros.horarioHasta,
  }
}
