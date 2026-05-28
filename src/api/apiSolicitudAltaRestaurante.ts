import type { DTOFirma } from "../data/DTOFirma.js";
import type { DireccionGeoapify } from "../data/DireccionGeoapify.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

/** POST solicitud de alta — endpoint definido en el CU (endpoints.js no se modifica por regla del proyecto). */
const ENDPOINT_SOLICITUD_ALTA = "/api/restaurante/solicitud";

export interface PayloadSolicitudAlta {
  nombre: string;
  razonSocial: string;
  rut: string;
  telefono: string;
  descripcion: string;
  direccion: DireccionGeoapify;
  imagenPerfil: string;
  imagenPortada: string;
}

export interface RespuestaSolicitudAlta {
  success: boolean;
  message: string;
  errorCampo?: "rut" | "razonSocial" | "telefono" | null;
}

export async function enviarSolicitudAlta(
  payload: PayloadSolicitudAlta,
): Promise<RespuestaSolicitudAlta> {
  try {
    const response = await fetchConAuth(ENDPOINT_SOLICITUD_ALTA, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: true,
        message: data.message ?? "Solicitud enviada correctamente",
      };
    }

    if (response.status === 409) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        errorCampo?: "rut" | "razonSocial" | "telefono";
      };
      return {
        success: false,
        message:
          data.message ?? "Este dato ya está registrado en el sistema",
        errorCampo: data.errorCampo ?? null,
      };
    }

    if (response.status === 400) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: false,
        message: data.message ?? "Datos inválidos. Revisá el formulario.",
      };
    }

    return {
      success: false,
      message:
        "Ocurrió un error al enviar la solicitud. Intentá nuevamente.",
    };
  } catch {
    return {
      success: false,
      message: "No se pudo conectar con el servidor. Intentá nuevamente.",
    };
  }
}

export async function obtenerFirmaCloudinary(
  nombreArchivo: string,
  tipo: "image" | "video" | "raw" = "image",
): Promise<DTOFirma> {
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
