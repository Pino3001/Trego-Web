import type { CategoriaRestaurante } from "./CategoriaRestaurante.js";
import type { DTODireccion } from "./DTODireccion.js";
import type { DTOIngrediente } from "./DTOIngrediente.js";
import type { DTOProducto } from "./DTOProducto.js";

export interface DTORestaurante {
  idRestaurante?: number | null;
  nombre?: string;
  email?: string;
  password?: string;
  rut?: string;
  telefono?: string;
  fotoPerfil?: string;
  fotoPortada?: string;
  direccion?: DTODireccion | null;
  descripcion?: string;
  categoria?: CategoriaRestaurante | null;
  calificacionProm?: number | null;
  radioEntrega?: number;
  habilitado?: boolean;
  abierto?: boolean;
  horaApertura?: string | null;  // Formato "HH:mm:ss"
  horaCierre?: string | null;    // Formato "HH:mm:ss"
  productos?: DTOProducto[];
  ingredientesDisponibles?: DTOIngrediente[];
}
