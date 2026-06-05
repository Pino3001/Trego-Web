import type { DTORestaurante } from "./DTORestaurante.js";

/** Respuesta 200 cuando el restaurante no tiene productos cargados. */
export interface MenuSinProductosRespuesta {
  mensaje: string;
}

export type VerMenuRespuesta = DTORestaurante | MenuSinProductosRespuesta;

export function esMenuSinProductos(
  data: VerMenuRespuesta,
): data is MenuSinProductosRespuesta {
  const dto = data as DTORestaurante;
  return (
    typeof (data as MenuSinProductosRespuesta).mensaje === "string" &&
    !dto.idRestaurante &&
    !dto.productos
  );
}
