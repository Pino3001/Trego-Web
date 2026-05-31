import type { EnumCategoriaProducto } from "./EnumCategoriaProducto.js";

export interface DTOSubcategoria{
    idSubCategoria?: number;
    nombre?: string;
    categoria?: EnumCategoriaProducto;
    urlImagen?: string;
}