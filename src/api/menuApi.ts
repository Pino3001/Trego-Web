// menuApi.ts
import { mapearMenuRespuesta, ordenFrontABackend } from './mapeadores.js';
import { ENDPOINTS } from './endpoints.js';
import type { DTORestaurante } from '../data/DTORestaurante.js';
import type { DTOProducto } from '../data/DTOProducto.js';

// ---------- Error personalizado ----------
export class MenuApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MenuApiError';
    this.status = status;
  }
}

// ---------- Tipos mínimos ----------
export interface MenuResponse {
  restaurante: DTORestaurante;
  productos: DTOProducto[];
  mensaje?: string;
}

// ---------- Helpers internos ----------
async function fetchMenuPublic(url: string): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('jwtToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { headers });
}

async function leerMensajeError(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    return data?.message ?? data?.error ?? null;
  } catch {
    return null;
  }
}

// ---------- Función principal ----------
export async function obtenerMenuRestaurante(
  idRestaurante: number,
  opciones?: { categoria?: string; ordenPrecio?: string }
): Promise<MenuResponse> {
  const { categoria, ordenPrecio } = opciones ?? {};
  const path = ENDPOINTS.MENU_RESTAURANTE.replace(':id', String(idRestaurante));
  const params = new URLSearchParams();
  if (categoria) params.set('categoria', categoria);
  const orden = ordenFrontABackend(ordenPrecio);
  if (orden) params.set('orden', orden);
  const url = params.toString() ? `${path}?${params}` : path;

  const response = await fetchMenuPublic(url);

  // 404: puede ser restaurante inexistente o restaurante sin productos
  if (response.status === 404) {
    const detalle = await leerMensajeError(response);
    if (detalle && /productos|producto/i.test(detalle)) {
      // El restaurante existe pero no tiene productos → devolvemos vacío con mensaje
      return {
        restaurante: {},
        productos: [],
        mensaje: 'Este restaurante aún no ha cargado su menú',
      };
    }
    throw new MenuApiError(
      detalle ?? 'El restaurante no existe o no está disponible',
      404
    );
  }

  if (!response.ok) {
    const detalle = await leerMensajeError(response);
    throw new MenuApiError(detalle ?? 'Error al cargar el menú', response.status);
  }

  const data: DTORestaurante = await response.json();
  const menu = mapearMenuRespuesta(data);
  if (!menu) {
    throw new MenuApiError('Respuesta de menú inválida', 500);
  }

  return menu;
}