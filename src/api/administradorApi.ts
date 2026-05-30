import type { DTORestaurante } from "../data/DTORestaurante.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

export const administradorApi = {
  obtenerRestaurantesPendientes: async (): Promise<DTORestaurante[]> => {
    const response = await fetchConAuth(ENDPOINTS.ADMIN_RESTAURANTES_LISTA);

    if (!response.ok) {
      throw new Error("ERROR_CARGA");
    }

    return response.json();
  },

  habilitarRestaurante: async (idRestaurante: number): Promise<void> => {
    const url = ENDPOINTS.ADMIN_RESTAURANTE_HABILITAR.replace(
      ":id",
      String(idRestaurante),
    );

    const response = await fetchConAuth(url, { method: "PUT" });

    if (!response.ok) {
      throw new Error("ERROR_HABILITAR");
    }
  },

  rechazarRestaurante: async (
    idRestaurante: number,
    motivo: string,
  ): Promise<void> => {
    const url = ENDPOINTS.ADMIN_RESTAURANTE_NO_HABILITAR.replace(
      ":id",
      String(idRestaurante),
    ).replace(":motivo", encodeURIComponent(motivo));

    const response = await fetchConAuth(url, { method: "PUT" });

    if (!response.ok) {
      throw new Error("ERROR_RECHAZAR");
    }
  },
};
