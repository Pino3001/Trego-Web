import type { DTORestaurante } from "../data/DTORestaurante.js";
import type { DTOClienteResponse } from "../data/DTOClienteResponse.js";
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

  obtenerRestaurantesHabilitados: async (): Promise<DTORestaurante[]> => {
    const response = await fetchConAuth(ENDPOINTS.RESTAURANTES_TODOS);

    if (!response.ok) {
      throw new Error("ERROR_CARGA_HABILITADOS");
    }

    return response.json();
  },

  obtenerClientesRegistrados: async (): Promise<DTOClienteResponse[]> => {
    const response = await fetchConAuth(ENDPOINTS.CLIENTES_TODOS);

    if (!response.ok) {
      throw new Error("ERROR_CARGA_CLIENTES");
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

  cambiarEstadoUsuario: async (
    idUsuario: number,
    habilitar: boolean,
    motivo?: string,
  ): Promise<void> => {
    let url = ENDPOINTS.ADMIN_USUARIO_HABILITAR_DESHABILITAR.replace(
      ":id",
      String(idUsuario),
    ).replace(":habilitar", String(habilitar));

    if (!habilitar && motivo?.trim()) {
      url += `?motivo=${encodeURIComponent(motivo.trim())}`;
    }

    const response = await fetchConAuth(url, { method: "POST" });

    if (!response.ok) {
      throw new Error("ERROR_CAMBIAR_ESTADO");
    }
  },
};
