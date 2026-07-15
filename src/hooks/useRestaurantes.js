import { useCallback, useEffect, useMemo, useRef, useState } from 'react' // <-- 1. Agregamos useEffect aquí
import { obtenerRestaurantesZona } from '../api/restaurantesApi'
import {
  buscarPlatosEnZona,
  listarProductosOfertaEnZona,
  enriquecerOfertaZona,
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

  // Sincronizamos las referencias de forma segura DESPUÉS del renderizado
  useEffect(() => {
    restaurantesZonaRef.current = restaurantesZona
  }, [restaurantesZona])

  useEffect(() => {
    ofertasZonaRef.current = ofertasZona
  }, [ofertasZona])

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

  // CARGAMOS EN PARALELO 
  const cargarZona = useCallback(async (coords) => {
    if (!coords) return
    setCargando(true)
    setCargandoOfertas(true)
    setError(null)
    setModoBusqueda(false)
    setTerminoBusqueda('')
    setResultadosPlato([])

    try {
      const [restaurantesData, ofertasData] = await Promise.all([
        obtenerRestaurantesZona({
          latitud: coords.latitud,
          longitud: coords.longitud,
        }),
        listarProductosOfertaEnZona(coords)
      ])

      setRestaurantesZona(restaurantesData)
      setOfertasZona(ofertasData)
    } catch (e) {
      setError(mensajeErrorAmigable(e))
      setRestaurantesZona([])
      setOfertasZona([])
    } finally {
      setCargando(false)
      setCargandoOfertas(false)
    }
  }, [])

  const buscarPlato = useCallback(async (coords, termino) => {
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

      const promesas = [buscarPlatosEnZona(base, termino.trim())]
      const necesitaCargarOfertas = ofertasZonaRef.current.length === 0

      if (necesitaCargarOfertas) {
        setCargandoOfertas(true)
        promesas.push(listarProductosOfertaEnZona(coords))
      }

      const [resultados, ofertasNuevas] = await Promise.all(promesas)
      
      setResultadosPlato(resultados)
      if (necesitaCargarOfertas && ofertasNuevas) {
        setOfertasZona(ofertasNuevas)
      }
    } catch (e) {
      setError(e.message ?? 'Error en la búsqueda de platos')
      setResultadosPlato([])
    } finally {
      setCargando(false)
      setCargandoOfertas(false)
    }
  }, [])

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

  const recargar = useCallback((coords) => {
    if (modoBusqueda && terminoBusqueda) {
      return buscarPlato(coords, terminoBusqueda)
    }
    return cargarZona(coords)
  }, [modoBusqueda, terminoBusqueda, buscarPlato, cargarZona])

  const restaurantes = useMemo(() => {
    const filtrados = filtrarRestaurantes(restaurantesZona, filtros)
    return ordenarRestaurantes(filtrados, filtros.ordenamiento)
  }, [restaurantesZona, filtros])

  const resultadosBusquedaPlato = useMemo(() => {
    const filtrados = filtrarResultadosPlato(resultadosPlato, filtros)
    return ordenarResultadosPlato(filtrados, filtros.ordenamiento)
  }, [resultadosPlato, filtros])

  const mejoresOfertas = useMemo(() => {
    const ofertasEnriquecidas = ofertasZona.map((o) =>
      enriquecerOfertaZona(o, restaurantesZona)
    )
    const filtradas = filtrarOfertasPlatos(ofertasEnriquecidas, filtros)
    return ordenarOfertasPlatos(filtradas, filtros.ordenamiento)
  }, [ofertasZona, restaurantesZona, filtros])

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