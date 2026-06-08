import type { EnumEstadoReclamo } from "./EnumEstadoReclamo.js";

export interface DTOReclamo {
  idReclamo: number;
  idPedido: number;
  nombreUsuario?: string | null;
  emailUsuario?: string | null;
  motivoReclamo?: string | null;
  estado: EnumEstadoReclamo;
  fechaReclamo?: string | null;
  motivoRechazo?: string | null;
  totalPedido?: number | null;
}

export interface ResolverReclamoPayload {
  accion: boolean;
  motivoRechazo?: string;
}
