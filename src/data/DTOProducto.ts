import type { DTOIngrediente } from "./DTOIngrediente.js";
import type { DTOOferta } from "./DTOOferta.js";

export interface DTOProducto {
  idProducto?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  urlImagen?: string;
  categoria: string; // O un Union Type: 'PIZZA' | 'BEBIDA' | ...
  disponible: boolean;
  idRestaurante?: number;
  cantidadDisponible?: number;
  ingredientes: DTOIngrediente[];
  tipo: string; // O un Union Type
  oferta?: DTOOferta;
  //plato?: DTOPlato;
  //articulo?: DTOArticulo;
 // combo?: DTOCombo;
}