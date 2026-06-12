export interface ProductoIncluido {
  id: number;
  nombre: string;
}

export interface DTOCombo {
  productosIncluidos?: ProductoIncluido[];
}

export function obtenerConteoPorNombre(
  productos: ProductoIncluido[],
): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const { nombre } of productos) {
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  }
  return conteo;
}
