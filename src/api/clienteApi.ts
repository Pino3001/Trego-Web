import type { DTODireccion } from "../data/DTODireccion.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";
import {
  esMenuSinProductos,
  type VerMenuRespuesta,
} from "../data/VerMenuRespuesta.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

export type OrdenMenuPrecio = "precio_asc" | "precio_desc";

export interface OpcionesVerMenu {
  categoria?: string;
  orden?: OrdenMenuPrecio;
}

async function parsearError(
  response: Response,
  mensajePorDefecto: string,
): Promise<never> {
  let detalle = mensajePorDefecto;
  try {
    const body = await response.json();
    if (body?.mensaje) detalle = body.mensaje;
  } catch {
    // ignore
  }
  throw new Error(detalle);
}

export const clienteApi = {
  listarRestaurantes: async (nombre?: string): Promise<DTORestaurante[]> => {
    let query = "";
    if (nombre && nombre.trim() !== "") {
      query = `?nombre=${encodeURIComponent(nombre.trim())}`;
    }
console.log("Esta es la url que se una  ", ENDPOINTS.RESTAURANTES_TODOS)
    const response = await fetchConAuth(
      `${ENDPOINTS.RESTAURANTES_TODOS}${query}`,
    );

    if (!response.ok) {
      await parsearError(response, "Error al listar restaurantes");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  listarRestaurantesPorDireccion: async (
    direccion: DTODireccion,
  ): Promise<DTORestaurante[]> => {
    const response = await fetchConAuth(ENDPOINTS.RESTAURANTES_ZONA, {
      method: "POST",
      body: JSON.stringify(direccion),
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      await parsearError(
        response,
        "No se pudieron cargar restaurantes para tu zona",
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  obtenerRestaurante: async (id: number): Promise<DTORestaurante> => {
    const response = await fetchConAuth(
      `${ENDPOINTS.RESTAURANTE_POR_ID}/${id}`,
    );

    if (response.status === 404) {
      throw new Error("El restaurante no existe o no está disponible");
    }

    if (!response.ok) {
      await parsearError(response, "Error al cargar datos del restaurante");
    }

    return response.json();
  },

  verMenu: async (
    restauranteId: number,
    opts?: OpcionesVerMenu,
  ): Promise<VerMenuRespuesta> => {
    const path = ENDPOINTS.MENU_RESTAURANTE.replace(
      ":id",
      String(restauranteId),
    );
    const params = new URLSearchParams();
    if (opts?.categoria?.trim()) {
      params.set("categoria", opts.categoria.trim());
    }
    if (opts?.orden) {
      params.set("orden", opts.orden);
    }

    const query = params.toString();
    const url = query ? `${path}?${query}` : path;

    const response = await fetch(url);

    if (response.status === 404) {
      throw new Error("El restaurante no existe o no está disponible");
    }

    if (!response.ok) {
      await parsearError(response, "Error al cargar el menú");
    }

    const data: VerMenuRespuesta = await response.json();
    return data;
  },
};

export { esMenuSinProductos };
