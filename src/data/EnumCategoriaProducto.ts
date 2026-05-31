export enum EnumCategoriaProducto {
  Bebida = "Bebida",
  Ensalada = "Ensalada",
  Principal = "Principal",
  Entrada = "Entrada",
  Guarnicion = "Guarnicion",
  Postre = "Postre",
  Otros = "Otros"
}

export const CATEGORIAS_PRODUCTO = Object.values(EnumCategoriaProducto).map((categoria) => ({
  id: categoria,  
  label: categoria,
}));