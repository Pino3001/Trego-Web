import type { DTODireccion } from "../data/DTODireccion.js";

export function getInitials(nombre: string = ""): string {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "?";

  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? "?";

  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  return first && last ? (first + last).toUpperCase() : "?";
}

export function formatAddressLine(d: DTODireccion | undefined) {
  const parts = [];

  if (d?.calle) {
    let streetStr = d?.calle;
    if (d?.numero) streetStr += ` ${d?.numero}`;
    parts.push(streetStr);
  } else if (d?.numero) {
    parts.push(`Nº ${d?.numero}`);
  }

  if (d?.apartamento) parts.push(`Apt ${d.apartamento}`);
  if (d?.esquina) parts.push(`Esq. ${d.esquina}`);

  return parts.length > 0 ? parts.join(" - ") : "Dirección sin detalles";
}