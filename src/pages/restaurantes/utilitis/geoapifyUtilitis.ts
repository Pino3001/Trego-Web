import type { DireccionGeoapify } from "../../../data/DireccionGeoapify.js";

// ─── API ──────────────────────────────────────────────────────────────────────
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

// Coordenadas de Montevideo para sesgar resultados hacia esa zona
const MONTEVIDEO_BIAS = "proximity:-56.1674,-34.9011";

export async function buscarDireccionesGeoapify(
  query: string,
): Promise<DireccionGeoapify[]> {
  const params = new URLSearchParams({
    text: query,
    apiKey: GEOAPIFY_API_KEY,
    lang: "es",
    limit: "6",
    filter: "countrycode:uy", // Solo resultados de Uruguay
    bias: MONTEVIDEO_BIAS, // Priorizar resultados cerca de Montevideo
  });

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
  );

  if (!res.ok) throw new Error(`Geoapify error ${res.status}`);

  const data = await res.json();

  return (
    (data.features ?? [])
      .map((feature: any) => {
        const p = feature.properties;

        return {
          calle: p.street ?? p.address_line1 ?? "",
          numero: p.housenumber ?? "", // ← campo que faltaba mapear
          direccionCompleta: p.formatted ?? "",
          esquina: p.street_junction ?? "",
          latitud: p.lat,
          longitud: p.lon,
        } satisfies DireccionGeoapify;
      })
      // Filtrar resultados sin calle (zonas genéricas sin valor)
      .filter((d: DireccionGeoapify) => d.calle.length > 0)
  );
}
