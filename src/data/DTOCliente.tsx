import type { DTODireccion } from "./DTODireccion.js";

export interface DTOCliente {
  nombre?: string;
  email?: string;
  urlImagen?: string;
  telefono?: string;
  uidCliente?: string;
  habilitado?: boolean;
  direcciones?: DTODireccion[];
}
