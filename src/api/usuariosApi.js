import { ENDPOINTS } from './endpoints'
import { fetchConAuth } from './header/fetchConAuth'
import { mapearDireccionUi } from './mapeadores'

async function leerMensajeError(response) {
  try {
    const texto = await response.text()
    if (!texto) return null
    try {
      const json = JSON.parse(texto)
      return json.message ?? json.error ?? texto
    } catch {
      return texto
    }
  } catch {
    return null
  }
}

export async function obtenerUsuarioActual() {
  const response = await fetchConAuth(ENDPOINTS.USUARIO_ACTUAL, {
    redirectOnUnauthorized: false,
  })
  if (!response.ok) {
    throw new Error('NO_SE_PUDO_OBTENER_USUARIO')
  }
  return response.json()
}

export async function recuperarContraseña(correo) {
  const correoCodificado = encodeURIComponent(correo.trim())
  const response = await fetch(
    `${ENDPOINTS.USUARIO_RECUPERAR_CONTRASENA}/${correoCodificado}`,
    { method: 'POST' },
  )

  if (response.ok) return

  const mensaje = await leerMensajeError(response)

  if (response.status === 401 || response.status === 403) {
    throw new Error('RECUPERAR_NO_AUTORIZADO')
  }
  if (response.status === 400) {
    throw new Error(mensaje ?? 'CORREO_NO_ENCONTRADO')
  }
  throw new Error(mensaje ?? 'ERROR_SERVIDOR')
}

export async function actualizarContraseña(nuevaContraseña) {
  const params = new URLSearchParams({ nuevaContraseña })
  const response = await fetchConAuth(
    `${ENDPOINTS.USUARIO_ACTUALIZAR_CONTRASENA}?${params.toString()}`,
    {
      method: 'POST',
      redirectOnUnauthorized: false,
    },
  )

  if (response.ok) return

  const mensaje = await leerMensajeError(response)

  if (response.status === 401) {
    throw new Error('SESION_EXPIRADA')
  }
  if (response.status === 400) {
    throw new Error(mensaje ?? 'CONTRASENA_INVALIDA')
  }
  throw new Error(mensaje ?? 'ERROR_SERVIDOR')
}

/** falta endpoint backend */
export async function guardarDireccion(_direccion) {
  throw new Error('guardarDireccion: falta endpoint backend')
}

export async function obtenerDireccionesGuardadas() {
  const response = await fetchConAuth(ENDPOINTS.USUARIO_DIRECCIONES, {
    redirectOnUnauthorized: false,
  })
  if (!response.ok) {
    if (response.status === 401) return []
    throw new Error('No se pudieron cargar las direcciones')
  }
  const lista = await response.json()
  if (!Array.isArray(lista)) return []
  return lista.map(mapearDireccionUi)
}
