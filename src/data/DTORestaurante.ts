import type { DTODireccion } from "./DTODireccion.js";
import type { DTOProducto } from "./DTOProducto.js";

export interface DTORestaurante {
  idRestaurante?: number;
  nombre: string;
  razonSocial?: string;
  email?: string;
  password?: string;
  rut?: string;
  telefono?: string;
  fotoPerfil?: string;
  fotoPortada?: string;
  direccion?: DTODireccion;
  descripcion?: string;
  categoria?: "CATEGORIA_A" | "CATEGORIA_B"; // Reemplaza con los valores de tu Enum
  calificacionProm?: number;
  radioEntrega?: number;
  habilitado?: boolean;
  abierto?: boolean;
  horaApertura?: string;
  horaCierre?: string;
  productos?: DTOProducto[];
}
