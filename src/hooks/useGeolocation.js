import { useCallback, useEffect, useState } from 'react'

const ESTADOS = {
  idle: 'idle',
  loading: 'loading',
  granted: 'granted',
  denied: 'denied',
  unsupported: 'unsupported',
}

export function useGeolocation(autoRequest = true) {
  const [estado, setEstado] = useState(ESTADOS.idle)
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)

  const solicitar = useCallback(() => {
    if (!navigator.geolocation) {
      setEstado(ESTADOS.unsupported)
      setError('Geolocalización no soportada en este navegador')
      return
    }

    setEstado(ESTADOS.loading)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        })
        setEstado(ESTADOS.granted)
      },
      (err) => {
        setEstado(ESTADOS.denied)
        setError(err.message)
        setCoords(null)
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }, [])

  useEffect(() => {
    if (autoRequest) solicitar()
  }, [autoRequest, solicitar])

  return {
    coords,
    estado,
    error,
    solicitar,
    tieneUbicacion: estado === ESTADOS.granted && coords != null,
    ubicacionDenegada: estado === ESTADOS.denied || estado === ESTADOS.unsupported,
    cargandoUbicacion: estado === ESTADOS.loading,
  }
}
