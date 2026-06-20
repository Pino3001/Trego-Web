import type { DTOProductoPedido } from "./DTOProductoPedido.js";

export interface DTOCarrito {
  idCarrito?: number;
  idRestaurante?: number;
  productos?: DTOProductoPedido[];
  total?: number;
}
