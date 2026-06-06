import { useEffect, useState } from "react";
import type { DTOPedido } from "../../../data/DTOPedido.js";
import { EnumEstadoPedido } from "../../../data/EnumEstadoPedido.js";
import { listarPedidos } from "../../../api/apiRestaurante.js";

// Helper para formatear dirección a string (asumí campos típicos de DTODireccion; ajustá según tu definición)
export function formatearDireccion(direccion: any): string {
  if (!direccion) return "Dirección no disponible";
  const partes = [
    direccion.calle,
    direccion.numero,
    direccion.apartamento,
  ].filter(Boolean);
  return partes.join(" ") || "Dirección no disponible";
}

export function tiempoTranscurrido(horaCreacion: string | undefined): number {
  if (!horaCreacion) return 0;

  const creado = new Date(horaCreacion).getTime();
  if (isNaN(creado)) return 0;

  const ahora = Date.now();
  return Math.max(0, Math.floor((ahora - creado) / 60000));
}

/**
 * Filtra los pedidos que contienen un producto con el idProducto dado.
 * @param pedidos - array de DTOPedido
 * @param idProducto - id del producto a buscar (number)
 * @returns pedidos que incluyen ese producto
 */
export const filtrarPedidosPorProducto = (
  pedidos: DTOPedido[],
  idProducto: number | undefined,
): DTOPedido[] => {
  return pedidos.filter((pedido) =>
    pedido.productos?.some((pp) => pp.producto?.idProducto === idProducto),
  );
};

/**
 * Convierte un valor de fecha recibido del backend (posiblemente LocalDateTime)
 * a un string 'YYYY-MM-DD' para comparación.
 * Soporta formato ISO string ("2023-10-05T14:30:00") o array [año, mes, día, ...].
 * Si no es una fecha válida, retorna null.
 */
export function toDateString(fecha: any): string | null {
  if (!fecha) return null;
  let date: Date;
  if (Array.isArray(fecha) && fecha.length >= 3) {
    // formato array: [year, month, day, ...]
    date = new Date(fecha[0], fecha[1] - 1, fecha[2]);
  } else if (typeof fecha === "string") {
    date = new Date(fecha);
  } else {
    return null;
  }
  if (isNaN(date.getTime())) return null;
  // Formatear a YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
