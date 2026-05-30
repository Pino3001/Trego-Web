import type { DTOFirma } from "../data/DTOFirma.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

/** falta endpoint backend */
export async function enviarSolicitudAltaRestaurante(
  resto: Partial<DTORestaurante>,
) {
  const response = await fetchConAuth(ENDPOINTS.SOLICITUD_ALTA_RESTAURANTE, {
    method: "PATCH",
    body: JSON.stringify(resto),
  });
  if (!response.ok) {
    throw new Error("No se pudo enviar la solicitud de alta");
  }
  return response.json();
}

export async function obtenerFirmaCloudinary(
  nombreArchivo: string,
  tipo: "image" | "video" | "raw" = "image",
): Promise<DTOFirma> {
  // Limpiamos el nombre de espacios o caracteres raros por las dudas
  const nombreLimpio = encodeURIComponent(nombreArchivo.trim());
  const url = `${ENDPOINTS.FIRMA_IMAGEN}/${nombreLimpio},${tipo}`;

  const response = await fetchConAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(`No se pudo obtener la firma de Cloudinary: ${errorText}`);
  }

  return response.json();
}

export async function obtenerActual(): Promise<DTORestaurante> {

  const response = await fetchConAuth(ENDPOINTS.OBTENER_RESTAURANTE_ACTUAL, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(`No se pudo obtener la informacion del restaurante: ${errorText}`);
  }

  return response.json();
}