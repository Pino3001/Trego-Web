import type { DTODireccion } from "./DTODireccion.js";

export interface DTOClienteResponse {
  id: number;
  nombre?: string;
  email?: string;
  fotoPerfil?: string;
  telefono?: string;
  uidCliente?: string;
  habilitado?: boolean;
  rol?: string;
  direcciones?: DTODireccion[];
}
