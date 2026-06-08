export enum EnumEstadoReclamo {
  Pendiente = "Pendiente",
  Resuelto = "Resuelto",
  Rechazado = "Rechazado",
}

export const ESTADOS_RECLAMO_FILTRO: EnumEstadoReclamo[] = [
  EnumEstadoReclamo.Pendiente,
  EnumEstadoReclamo.Resuelto,
  EnumEstadoReclamo.Rechazado,
];
