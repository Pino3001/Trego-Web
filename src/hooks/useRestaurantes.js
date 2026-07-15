import { useCallback, useMemo, useRef, useState } from 'react'
import { obtenerRestaurantesZona } from '../api/restaurantesApi'
import {
  buscarPlatosEnZona,
  listarProductosOfertaEnZona,
} from '../api/productosClienteApi.js'
import {
  FILTROS_INICIALES,
  filtrarOfertasPlatos,
  filtrarRestaurantes,
  filtrarResultadosPlato,
  hayFiltrosActivos,
  ordenarOfertasPlatos,
  ordenarRestaurantes,
  ordenarResultadosPlato,
} from '../utils/filtrosRestaurantes.js'

export function useRestaurantes() {
  const [restaurantesZona, setRestaurantesZona] = useState([])
  const [resultadosPlato, setResultadosPlato] = useState([])
  const [ofertasZona, setOfertasZona] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [modoBusqueda, setModoBusqueda] = useState(false)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoOfertas, setCargandoOfertas] = useState(false)
  const [error, setError] = useState(null)

  const restaurantesZonaRef = useRef(restaurantesZona)
  const ofertasZonaRef = useRef(ofertasZona)
  restaurantesZonaRef.current = restaurantesZona
  ofertasZonaRef.current = ofertasZona

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

  const cargarOfertas = useCallback(async (coords, restaurantes = null) => {
    if (!coords) return
    setCargandoOfertas(true)
    try {
      const base = restaurantes ?? restaurantesZonaRef.current
      const data = await listarProductosOfertaEnZona(coords, base)
      setOfertasZona(data)
    } catch {
      setOfertasZona([])
    } finally {
      setCargandoOfertas(false)
    }
  }, [])

  const cargarZona = useCallback(
    async (coords) => {
      if (!coords) return
      setCargando(true)
      setError(null)
      setModoBusqueda(false)
      setTerminoBusqueda('')
      setResultadosPlato([])
      try {
        const data = await obtenerRestaurantesZona({
          latitud: coords.latitud,
          longitud: coords.longitud,
        })
        setRestaurantesZona(data)
        setCargando(false)
        // Ofertas van en paralelo: no bloquean la lista (también llaman Geoapify en back)
        void cargarOfertas(coords, data)
      } catch (e) {
        setError(mensajeErrorAmigable(e))
        setRestaurantesZona([])
        setOfertasZona([])
        setCargando(false)
      }
    },
    [cargarOfertas],
  )

  const buscarPlato = useCallback(
    async (coords, termino) => {
      if (!coords || !termino.trim()) return
      setCargando(true)
      setError(null)
      setModoBusqueda(true)
      setTerminoBusqueda(termino.trim())

      try {
        let base = restaurantesZonaRef.current
        if (base.length === 0) {
          base = await obtenerRestaurantesZona({
            latitud: coords.latitud,
            longitud: coords.longitud,
          })
          setRestaurantesZona(base)
        }

        const resultados = await buscarPlatosEnZona(base, termino.trim())
        setResultadosPlato(resultados)
        setCargando(false)

        if (ofertasZonaRef.current.length === 0) {
          void cargarOfertas(coords, base)
        }
      } catch (e) {
        setError(e.message ?? 'Error en la búsqueda de platos')
        setResultadosPlato([])
        setCargando(false)
      }
    },
    [cargarOfertas],
  )

  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(nuevosFiltros)
  }, [])

  const limpiarFiltros = useCallback(async (coords) => {
    setFiltros({ ...FILTROS_INICIALES })
    setModoBusqueda(false)
    setTerminoBusqueda('')
    setResultadosPlato([])
    if (coords) {
      await cargarZona(coords)
    }
  }, [cargarZona])

  const recargar = useCallback(
    (coords) => {
      if (modoBusqueda && terminoBusqueda) {
        return buscarPlato(coords, terminoBusqueda)
      }
      return cargarZona(coords)
    },
    [modoBusqueda, terminoBusqueda, buscarPlato, cargarZona],
  )

  const restaurantes = useMemo(() => {
    const filtrados = filtrarRestaurantes(restaurantesZona, filtros)
    return ordenarRestaurantes(filtrados, filtros.ordenamiento)
  }, [restaurantesZona, filtros])

  const resultadosBusquedaPlato = useMemo(() => {
    const filtrados = filtrarResultadosPlato(resultadosPlato, filtros)
    return ordenarResultadosPlato(filtrados, filtros.ordenamiento)
  }, [resultadosPlato, filtros])

  const mejoresOfertas = useMemo(() => {
    const filtradas = filtrarOfertasPlatos(ofertasZona, filtros)
    return ordenarOfertasPlatos(filtradas, filtros.ordenamiento)
  }, [ofertasZona, filtros])

  return {
    restaurantes,
    resultadosBusquedaPlato,
    mejoresOfertas,
    filtros,
    cargando,
    cargandoOfertas,
    error,
    modoBusqueda,
    terminoBusqueda,
    cargarZona,
    buscarPlato,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    setOrdenamiento: (orden) => setFiltros((f) => ({ ...f, ordenamiento: orden })),
    hayFiltrosActivos: hayFiltrosActivos(filtros),
  }
}
