import type { DTOArticulo } from "./DTOArticulo.js";
import type { DTOCombo } from "./DTOCombo.js";
import type { DTOIngrediente } from "./DTOIngrediente.js";
import type { DTOOferta } from "./DTOOferta.js";
import type { DTOPlato } from "./DTOPato.js";
import type { DTOSubcategoria } from "./DTOSubcategoria.js";
import type { EnumCategoriaProducto } from "./EnumCategoriaProducto.js";
import type { EnumTipoProducto } from "./EnumTipoProducto.js";

export interface DTOProducto {
  idProducto?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  urlImagen?: string;
  categoria?: EnumCategoriaProducto; // O un Union Type: 'PIZZA' | 'BEBIDA' | ...
  disponible?: boolean;
  idRestaurante?: number;
  cantidadDisponible?: number;
  ingredientes?: DTOIngrediente[];
  tipo?: EnumTipoProducto; // O un Union Type
  oferta?: DTOOferta;
  ofertaActiva?: boolean;
  plato?: DTOPlato;
  articulo?: DTOArticulo;
  combo?: DTOCombo;
  idSubCategoria?: number;
  subCategoria?: DTOSubcategoria;
}