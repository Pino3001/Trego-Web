import React from "react";
import {
  Clock,
  MapPin,
  User,
  Check,
  X,
  AlertTriangle,
  Bike,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import type { PedidoDTO } from "../ListarSinConfirmar.js";

interface Props {
  pedido: PedidoDTO;
  onConfirmar: (id: string) => void;
  onCancelar: (id: string) => void;
}

export default function CardPedidoAconfirmar({
  pedido,
  onConfirmar,
  onCancelar,
}: Props) {
  const esCrítico = pedido.tiempoEspera > 8;

  return (
    <div
      className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 flex flex-col ${
        esCrítico
          ? "border-red-500 bg-red-50/10"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* 1. HEADER DE LA TARJETA: Control Operativo y Tiempos */}
      <div
        className={`px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b ${
          esCrítico ? "bg-red-500 text-white" : "bg-gray-50 text-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-black px-2 py-0.5 rounded ${esCrítico ? "bg-white text-red-600" : "bg-gray-800 text-white"}`}
          >
            #{pedido.id}
          </span>
        </div>

        {/* Alerta de Tiempo Activa */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Clock size={14} className={esCrítico ? "animate-spin-slow" : ""} />
          <span>Hace {pedido.tiempoEspera} min en espera</span>
          {esCrítico && <AlertTriangle size={14} className="animate-bounce" />}
        </div>
      </div>

      {/* 2. CUERPO CENTRAL: Lo que la cocina DEBE ver */}
      <div className="p-5 flex-1 h-full flex flex-col md:flex-row gap-6 justify-between items-start">
        {/* Detalle del Pedido (Maximizado) */}
        <div className="flex-1 w-full space-y-3">
          <h1 className="font-bold text-gray-900 text-center text-shadow-2xs tracking-wide uppercase">
            Productos Pedidos
          </h1>
          {pedido.productos.map((prod, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-100 rounded-xl p-1 flex items-start gap-2"
            >
              {/* Cantidad gigante */}
              <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white font-black text-base rounded-lg min-w-8">
                {prod.cantidad}
              </span>

              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                  {prod.nombre}
                </p>
                {/* Notas de modificación: Resaltadas en amarillo/alerta si existen */}
                {prod.notas && (
                  <p className="mt-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded inline-block">
                    ⚠️ NOTA: {prod.notas}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full md:w-85 bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col h-full text-sm">
          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
              Cliente
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <User size={15} className="text-gray-400" />
              {pedido.cliente}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
              Dirección
            </span>
            <div className="flex items-start gap-1.5 text-gray-600">
              <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{pedido.direccion}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-center items-center mt-auto">
            <div>
              <span className="text-xs text-gray-400 text-center font-bold block uppercase tracking-wider">
                Total
              </span>
              <span className="text-base font-black text-gray-950">
                ${pedido.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BARRA INFERIOR: Botones de Acción rápidos */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
        <button
          onClick={() => onCancelar(pedido.id)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition-all flex items-center gap-1.5"
        >
          <X size={16} />
          RECHAZAR
        </button>
        <button
          onClick={() => onConfirmar(pedido.id)}
          className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Check size={16} strokeWidth={3} />
          CONFIRMAR PEDIDO
        </button>
      </div>
    </div>
  );
}
