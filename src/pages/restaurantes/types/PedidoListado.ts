import type { DTOProductoPedido } from "../../../data/DTOProductoPedido.js";

export interface PedidoListado {
  id: string;
  cliente: string;
  direccion: string;
  productos: DTOProductoPedido[];
  tiempoEspera: number;
  total: number;
}
