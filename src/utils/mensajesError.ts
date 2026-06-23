const MENSAJES_AMIGABLES: Record<string, string> = {
  "No se pueden agregar productos de distintos restaurantes al carrito":
    "Solo podés pedir de un restaurante a la vez. Vacía el carrito para agregar productos de otro local.",
  "El producto no está disponible":
    "Este producto no está disponible en este momento.",
  "La petición debe incluir producto.idProducto":
    "No se pudo agregar el producto. Intentá de nuevo.",
  "producto.idRestaurante es obligatorio":
    "No se pudo identificar el restaurante. Volvé a intentar desde el menú.",
  "El usuario no tiene un carrito activo":
    "Tu carrito está vacío.",
};

function extraerMensajeBackend(raw: string): string {
  const texto = (raw ?? "").trim();
  if (!texto) return "";

  try {
    const parsed = JSON.parse(texto) as {
      message?: string;
      error?: string;
      mensaje?: string;
    };
    if (typeof parsed === "string") return parsed;
    return parsed.message ?? parsed.mensaje ?? parsed.error ?? texto;
  } catch {
    // Sigue abajo
  }

  const prefijoHttp = texto.match(/^\s*Error\s+\d+:\s*(.+)$/is);
  const cuerpo = prefijoHttp?.[1]?.trim() ?? texto;

  try {
    const parsed = JSON.parse(cuerpo) as { message?: string; mensaje?: string };
    return parsed.message ?? parsed.mensaje ?? cuerpo;
  } catch {
    return cuerpo;
  }
}

/** Convierte respuestas técnicas del back en textos legibles para el usuario. */
export function mensajeAmigableApi(
  raw: string,
  status?: number,
): string {
  const tecnico = extraerMensajeBackend(raw);
  if (tecnico && MENSAJES_AMIGABLES[tecnico]) {
    return MENSAJES_AMIGABLES[tecnico];
  }
  if (tecnico) return tecnico;

  if (status === 401 || status === 403) {
    return "Tenés que iniciar sesión para continuar.";
  }
  if (status === 404) {
    return "No encontramos lo que buscabas.";
  }
  if (status === 400) {
    return "No se pudo completar la operación. Revisá los datos e intentá de nuevo.";
  }

  return "Ocurrió un error inesperado. Intentá de nuevo.";
}
