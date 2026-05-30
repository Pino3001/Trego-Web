import { useCallback, useEffect, useState } from 'react'

const LS_UBICACION = 'trego_ubicacion_v1'
const LS_UBICACION_PREF = 'trego_ubicacion_pref_v1'

const ESTADOS = {
  idle: 'idle',
  loading: 'loading',
  granted: 'granted',
  denied: 'denied',
  unsupported: 'unsupported',
}

function leerUbicacionGuardada() {
  try {
    const raw = localStorage.getItem(LS_UBICACION)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.latitud != null && data?.longitud != null) {
      return { latitud: data.latitud, longitud: data.longitud }
    }
  } catch {
    // ignore
  }
  return null
}

function guardarUbicacion(coords) {
  try {
    localStorage.setItem(LS_UBICACION, JSON.stringify(coords))
  } catch {
    // ignore
  }
}

export function leerPrefUbicacion() {
  try {
    const raw = localStorage.getItem(LS_UBICACION_PREF)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function guardarPrefUbicacion(pref) {
  try {
    localStorage.setItem(LS_UBICACION_PREF, JSON.stringify(pref))
  } catch {
    // ignore
  }
}

/** El usuario ya respondió al prompt (activó, canceló o denegó permisos). */
export function ubicacionPromptYaRespondido() {
  if (leerUbicacionGuardada()) return true
  return !!leerPrefUbicacion()?.promptRespondido
}

function estadoInicial() {
  const guardada = leerUbicacionGuardada()
  if (guardada) return { estado: ESTADOS.granted, coords: guardada }
  const pref = leerPrefUbicacion()
  if (pref?.denied || pref?.rechazado) {
    return { estado: ESTADOS.denied, coords: null }
  }
  return { estado: ESTADOS.idle, coords: null }
}

export function useGeolocation(autoRequest = true) {
  const inicial = estadoInicial()
  const [estado, setEstado] = useState(inicial.estado)
  const [coords, setCoords] = useState(inicial.coords)
  const [error, setError] = useState(null)

  const solicitar = useCallback(() => {
    if (!navigator.geolocation) {
      setEstado(ESTADOS.unsupported)
      setError('Geolocalización no soportada en este navegador')
      guardarPrefUbicacion({ promptRespondido: true, denied: true })
      return
    }

    setEstado(ESTADOS.loading)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevas = {
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }
        setCoords(nuevas)
        setEstado(ESTADOS.granted)
        guardarUbicacion(nuevas)
        guardarPrefUbicacion({ promptRespondido: true })
      },
      (err) => {
        setEstado(ESTADOS.denied)
        setError(err.message)
        setCoords(null)
        guardarPrefUbicacion({ promptRespondido: true, denied: true })
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }, [])

  const marcarPromptRechazado = useCallback(() => {
    guardarPrefUbicacion({ promptRespondido: true, rechazado: true })
    setEstado(ESTADOS.denied)
    setCoords(null)
  }, [])

  useEffect(() => {
    if (autoRequest) solicitar()
  }, [autoRequest, solicitar])

  return {
    coords,
    estado,
    error,
    solicitar,
    marcarPromptRechazado,
    tieneUbicacion: estado === ESTADOS.granted && coords != null,
    ubicacionDenegada: estado === ESTADOS.denied || estado === ESTADOS.unsupported,
    cargandoUbicacion: estado === ESTADOS.loading,
  }
}
