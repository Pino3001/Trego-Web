import { useState } from "react";
import {
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Check,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum EnumEstadoReclamo {
  Pendiente = "Pendiente",
  EnRevision = "En Revisión",
  Resuelto = "Resuelto",
  Rechazado = "Rechazado",
}

export enum EnumResolucion {
  ReembolsoCompleto = "Reembolso Completo",
  ReembolsoParcial = "Reembolso Parcial",
  Reenvio = "Reenvío del Pedido",
  DescuentoProximaCompra = "Descuento en Próxima Compra",
  ReclamoInvalido = "Reclamo Inválido",
  OtraResolucion = "Otra Resolución",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ClienteReclamo {
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface Reclamo {
  idReclamo: number;
  descripcion: string;
  cliente: ClienteReclamo;
  idPedido: number;
  fechaPedido: string | Date;
  fechaReclamo: string | Date;
  estado: EnumEstadoReclamo;
  resolucion?: EnumResolucion | string;
}

export interface CardReclamoProps {
  reclamo: Reclamo;
  /** Callback para enviar la resolución al backend. Debe retornar una promesa. */
  onEnviarResolucion?: (idReclamo: number, resolucion: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatearFecha = (fecha: string | Date): string => {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const minutosTranscurridos = (fecha: string | Date): number => {
  const ahora = new Date();
  const inicio = new Date(fecha);
  return Math.floor((ahora.getTime() - inicio.getTime()) / 60_000);
};

// ─── Opciones de resolución ───────────────────────────────────────────────────

const OPCIONES_RESOLUCION: { id: EnumResolucion; label: string }[] = [
  { id: EnumResolucion.ReembolsoCompleto,     label: "💸 Reembolso Completo" },
  { id: EnumResolucion.ReembolsoParcial,      label: "💰 Reembolso Parcial" },
  { id: EnumResolucion.Reenvio,               label: "🔄 Reenvío del Pedido" },
  { id: EnumResolucion.DescuentoProximaCompra,label: "🎫 Descuento en Próxima Compra" },
  { id: EnumResolucion.ReclamoInvalido,       label: "🚫 Reclamo Inválido" },
  { id: EnumResolucion.OtraResolucion,        label: "📝 Otra Resolución" },
];

// ─── Estilos por estado ───────────────────────────────────────────────────────

const ESTADO_STYLES: Record<
  EnumEstadoReclamo,
  { header: string; badge: string; border: string; dot: string }
> = {
  [EnumEstadoReclamo.Pendiente]: {
    header: "bg-amber-500 text-white",
    badge:  "bg-white text-amber-600",
    border: "border-amber-400",
    dot:    "bg-amber-400",
  },
  [EnumEstadoReclamo.EnRevision]: {
    header: "bg-blue-500 text-white",
    badge:  "bg-white text-blue-600",
    border: "border-blue-300",
    dot:    "bg-blue-400",
  },
  [EnumEstadoReclamo.Resuelto]: {
    header: "bg-green-600 text-white",
    badge:  "bg-white text-green-700",
    border: "border-green-400",
    dot:    "bg-green-500",
  },
  [EnumEstadoReclamo.Rechazado]: {
    header: "bg-gray-500 text-white",
    badge:  "bg-white text-gray-600",
    border: "border-gray-300",
    dot:    "bg-gray-400",
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function CardReclamo({ reclamo, onEnviarResolucion }: CardReclamoProps) {
  const [resolucionSeleccionada, setResolucionSeleccionada] = useState<
    string | undefined
  >(reclamo.resolucion as string | undefined);
  const [cargando, setCargando]     = useState(false);
  const [desplegado, setDesplegado] = useState(false);

  const finalizado =
    reclamo.estado === EnumEstadoReclamo.Resuelto ||
    reclamo.estado === EnumEstadoReclamo.Rechazado;

  const minutos    = minutosTranscurridos(reclamo.fechaReclamo);
  const esCritico  = reclamo.estado === EnumEstadoReclamo.Pendiente && minutos > 60;
  const styles     = ESTADO_STYLES[reclamo.estado];

  const handleEnviarResolucion = async () => {
    if (!resolucionSeleccionada || !onEnviarResolucion) return;
    try {
      setCargando(true);
      await onEnviarResolucion(reclamo.idReclamo, resolucionSeleccionada);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 flex flex-col ${
        esCritico
          ? "border-red-500 bg-red-50/10"
          : `${styles.border} hover:border-gray-300`
      }`}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        className={`px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b ${
          esCritico ? "bg-red-500 text-white" : styles.header
        }`}
      >
        {/* ID + estado */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-black px-2 py-0.5 rounded ${
              esCritico ? "bg-white text-red-600" : styles.badge
            }`}
          >
            RECLAMO #{reclamo.idReclamo}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
            {esCritico ? "🔴 URGENTE" : reclamo.estado}
          </span>
        </div>

        {/* Tiempo transcurrido */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Clock
            size={14}
            className={esCritico ? "animate-spin" : ""}
            style={esCritico ? { animationDuration: "3s" } : undefined}
          />
          <span>Hace {minutos} min</span>
        </div>
      </div>

      {/* ── CUERPO ─────────────────────────────────────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 justify-between items-start">

        {/* Columna izquierda: descripción + datos del pedido */}
        <div className="flex-1 w-full space-y-3">
          <h2 className="font-bold text-gray-900 text-center uppercase tracking-wide text-sm">
            Descripción del Reclamo
          </h2>

          {/* Descripción */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-800 leading-relaxed">
              {reclamo.descripcion}
            </p>
          </div>

          {/* Pedido + fecha del pedido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2">
              <ShoppingBag size={15} className="text-gray-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                  Pedido
                </span>
                <span className="text-sm font-black text-gray-900">
                  #{reclamo.idPedido}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2">
              <Calendar size={15} className="text-gray-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                  Fecha Pedido
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {formatearFecha(reclamo.fechaPedido)}
                </span>
              </div>
            </div>
          </div>

          {/* Fecha del reclamo */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2">
            <Clock size={15} className="text-gray-400 shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                Fecha del Reclamo
              </span>
              <span className="text-xs font-semibold text-gray-700">
                {formatearFecha(reclamo.fechaReclamo)}
              </span>
            </div>
          </div>
        </div>

        {/* Columna derecha: datos del cliente */}
        <div className="w-full md:w-72 bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 text-sm h-full">
          <h2 className="font-bold text-gray-900 text-center uppercase tracking-wide text-xs">
            Datos del Cliente
          </h2>

          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
              Cliente
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <User size={15} className="text-gray-400 shrink-0" />
              {reclamo.cliente.nombre}
            </div>
          </div>

          {reclamo.cliente.email && (
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                Email
              </span>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span className="text-xs break-all">{reclamo.cliente.email}</span>
              </div>
            </div>
          )}

          {reclamo.cliente.telefono && (
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                Teléfono
              </span>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                <span>{reclamo.cliente.telefono}</span>
              </div>
            </div>
          )}

          {/* Resolución aplicada (solo si está finalizado) */}
          {finalizado && reclamo.resolucion && (
            <div className="pt-3 border-t border-gray-200 mt-auto">
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                Resolución Aplicada
              </span>
              <span className="text-sm font-bold text-green-700 mt-0.5 block">
                {reclamo.resolucion}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── BARRA INFERIOR: selector de resolución ─────────────────────────── */}
      {!finalizado && onEnviarResolucion && (
        <div className="border-t border-gray-100">
          {/* Toggle desplegable */}
          <button
            onClick={() => setDesplegado((prev) => !prev)}
            className="w-full px-5 py-3 bg-gray-50 flex items-center justify-between text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span>Resolver Reclamo</span>
            {desplegado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Panel de resolución */}
          {desplegado && (
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-3 justify-end">
              {/* Select estilizado */}
              <div className="relative flex-1 min-w-52">
                <select
                  value={resolucionSeleccionada ?? ""}
                  onChange={(e) =>
                    setResolucionSeleccionada(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors appearance-none cursor-pointer pr-9"
                >
                  <option value="">Seleccionar resolución...</option>
                  {OPCIONES_RESOLUCION.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Botón de envío */}
              <button
                onClick={handleEnviarResolucion}
                disabled={!resolucionSeleccionada || cargando}
                className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {cargando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} strokeWidth={3} />
                )}
                ENVIAR RESOLUCIÓN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}