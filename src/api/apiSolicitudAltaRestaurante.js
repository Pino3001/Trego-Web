import { ENDPOINTS } from './endpoints'

/** falta endpoint backend */
export async function enviarSolicitudAltaRestaurante(_payload) {
  const response = await fetch(ENDPOINTS.SOLICITUD_ALTA_RESTAURANTE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_payload),
  })
  if (!response.ok) {
    throw new Error('No se pudo enviar la solicitud de alta')
  }
  return response.json()
}
