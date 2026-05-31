import type { DTOIngrediente } from "./DTOIngrediente.js";
import type { DTOProductoSimplificado } from "./DTOProductoSimplificado.js";

export interface DTOProductoPedido {
  cantidadDisponible?: number;
  ingredientesAQuitar?: DTOIngrediente[];
  observaciones?: string;
  cantidad?: number;
  subtotal?: number;
  producto?: DTOProductoSimplificado;
}