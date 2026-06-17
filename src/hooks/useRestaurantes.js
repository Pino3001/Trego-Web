import { useCallback, useState } from 'react'
import {
  obtenerRestaurantesZona,
} from '../api/restaurantesApi'
import { clienteApi } from '../api/clienteApi.js'

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

  const mensajeErrorAmigable = (e) => {
    const msg = e?.message ?? ''
    if (msg === 'NO_EN_ZONA') {
      return 'No hay restaurantes que repartan hasta tu ubicación. Probá desde Montevideo o ampliá el radio en los locales de prueba.'
    }
    if (msg === 'SIN_SESION') {
      return 'Tenés que iniciar sesión como cliente para ver restaurantes en tu zona.'
    }
    if (msg.includes('listar por zona') || msg.includes('500')) {
      return 'No se pudieron cargar restaurantes para tu zona. Reiniciá el backend y revisá geoapify.api.key en application.properties.'
    }
    return msg || 'Error al cargar restaurantes'
  }

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
        setError(mensajeErrorAmigable(e))
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
      const data = await clienteApi.listarRestaurantes(nombre.trim())
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