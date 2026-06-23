/**
 * Normaliza una hora a formato HH:MM (sin segundos).
 * Conserva el cero inicial de la hora si existe.
 */
function formatearHora(horario: string): string {
  const limpio = horario.trim();
  const partes = limpio.split(':');

  if (partes.length < 2) return limpio; // no tiene formato HH:MM

  const hora = partes[0];
  let minutos = partes[1];

  // Asegurar que los minutos tengan siempre dos dígitos
  minutos = minutos?.padStart(2, '0').slice(0, 2);

  // Siempre mostramos minutos, sin importar si son "00"
  return `${hora}:${minutos}`;
}

export function formatearHorario(
  horaApertura?: string | null | unknown,
  horaCierre?: string | null | unknown,
): string {
  const aperturaStr = String(horaApertura ?? '').trim();
  const cierreStr = String(horaCierre ?? '').trim();

  // Si no hay string, pasamos un valor por defecto para mantener la estructura hh:mm
  const aperturaFormateada = aperturaStr ? formatearHora(aperturaStr) : '--:--';
  const cierreFormateada = cierreStr ? formatearHora(cierreStr) : '--:--';

  return `${aperturaFormateada} - ${cierreFormateada}`;
}