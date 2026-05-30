import type { EnumCategoriaProducto } from "./EnumCategoriaProducto.js";

export interface DTSubcategoria{
    idSubCategoria?: string;
    nombre?: string;
    categoria?: EnumCategoriaProducto;
    urlImagen?: string;
}