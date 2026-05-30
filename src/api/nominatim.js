/**
 * Reverse geocoding gratuito (OpenStreetMap). Fallback si no hay Geoapify.
 * Uso moderado; requiere User-Agent identificable.
 */
export async function reverseGeocodeNominatim(latitud, longitud) {
  const url = `/nominatim/reverse?lat=${latitud}&lon=${longitud}&format=json&addressdetails=1&accept-language=es`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Trego-Web/1.0 (app pedidos comida)',
      },
    })
    if (!response.ok) return null
    return await response.json()
  } catch (err) {
    console.warn('[Trego] Nominatim reverse falló', err)
    return null
  }
}
