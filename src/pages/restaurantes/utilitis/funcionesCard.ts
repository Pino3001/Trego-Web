import { EnumEstadoPedido } from "../../../data/EnumEstadoPedido.js";

/**
 * Retorna los estados a los que puede transicionar un pedido según su estado actual.
 * El flujo normal es EnPreparacion -> EnCamino -> Entregado.
 * Cancelado siempre está disponible.
 */
export function getEstadosDisponibles(
  estadoActual: EnumEstadoPedido | undefined,
): EnumEstadoPedido[] {
  if (!estadoActual) return [];

  const flujo: EnumEstadoPedido[] = [
    EnumEstadoPedido.EnPreparacion,
    EnumEstadoPedido.EnCamino,
    EnumEstadoPedido.Entregado,
  ];

  const idx = flujo.indexOf(estadoActual);

  // Si está en el flujo, solo puede pasar al siguiente estado (si existe)
  if (idx !== -1) {
    const siguiente = flujo[idx + 1]; // undefined si es el último (Entregado)
    return siguiente
      ? [siguiente, EnumEstadoPedido.Cancelado]
      : [EnumEstadoPedido.Cancelado];
  }

  // Si no está en el flujo (ej. Pagado, Solicitado...) o es Entregado,
  // solo se permite Cancelado (opcional)
  if (estadoActual === EnumEstadoPedido.Entregado) {
    return [EnumEstadoPedido.Cancelado];
  }

  // Para otros estados (Pagado, Solicitado, etc.) no se muestra selector
  return [];
}

export const ESTADOS_FLUJO: { id: EnumEstadoPedido; label: string }[] = [
  { id: EnumEstadoPedido.EnPreparacion, label: "En Preparación" },
  { id: EnumEstadoPedido.EnCamino, label: "En Camino" },
  { id: EnumEstadoPedido.Entregado, label: "Entregado" },
  { id: EnumEstadoPedido.Cancelado, label: "Cancelado" },
];
