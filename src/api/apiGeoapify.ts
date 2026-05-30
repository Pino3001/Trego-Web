import type { DireccionGeoapify } from "../data/DireccionGeoapify.js";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

/**
 * Busca sugerencias de direcciones usando Geoapify Geocoding Autocomplete.
 * Filtra los resultados para Uruguay (countrycode: uy).
 */
export async function buscarDireccionesGeoapify(texto: string): Promise<DireccionGeoapify[]> {
  if (!texto || texto.trim().length < 3) return [];

  // Codificamos el texto para la URL
  const query = encodeURIComponent(texto);
  
  // URL configurada para buscar solo en Uruguay (lon: -56, lat: -34) y autocompletar
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&lang=es&limit=5&filter=countrycode:uy&apiKey=${GEOAPIFY_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al consultar Geoapify");

    const data = await response.json();

    // Mapeamos la respuesta de Geoapify a una estructura limpia para nuestra app
    return data.features.map((feature: any) => {
      const props = feature.properties;
      return {
        direccionCompleta: props.formatted || "",
        calle: props.street || props.name || props.address_line1 || "",
        numero: props.housenumber || "",
        esquina: props.street_junction || "",
        latitud: feature.geometry.coordinates[1],  // Geoapify devuelve [lon, lat]
        longitud: feature.geometry.coordinates[0],
      };
    });
  } catch (error) {
    console.error("Error en Geoapify:", error);
    return [];
  }
}