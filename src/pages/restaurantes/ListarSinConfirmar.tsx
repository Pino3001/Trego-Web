import React, { useState, useEffect } from "react";
import { Search, CheckCircle, AlertCircle } from "lucide-react";
import CardPedidoAconfirmar from "./componentes/CardPedidoAconfirmar.js";
import type { DTOPedido } from "../../data/DTOPedido.js";
import { EnumEstadoPedido } from "../../data/EnumEstadoPedido.js";
import { listarPedidos } from "../../api/apiRestaurante.js";
import type { PedidoListado } from "./types/PedidoListado.js";

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

// Helper para formatear dirección a string (asumí campos típicos de DTODireccion; ajustá según tu definición)
function formatearDireccion(direccion: any): string {
  if (!direccion) return "Dirección no disponible";
  const partes = [
    direccion.calle,
    direccion.numero,
    direccion.apartamento,
  ].filter(Boolean);
  return partes.join(" ") || "Dirección no disponible";
}

// Helper para mapear DTOPedido a PedidoDTO
function mapearPedido(pedido: DTOPedido): PedidoListado | null {
  // Si no hay productos, devolvemos null para indicar error
  if (!pedido.productos || pedido.productos.length === 0) {
    return null;
  }

  // Calcular tiempo de espera en minutos (diferencia desde fechaCreacion hasta ahora)
  let tiempoEspera = 0;
  if (pedido.fechaCreacion) {
    const creado = new Date(pedido.fechaCreacion).getTime();
    const ahora = Date.now();
    tiempoEspera = Math.max(0, Math.floor((ahora - creado) / 60000)); // en minutos
  }

  return {
    id: String(pedido.idPedido ?? ""),
    cliente: `Cliente #${pedido.nombreCliente ?? "?"}`, // ← idealmente aquí pondrías el nombre real cuando lo tengas
    direccion: formatearDireccion(pedido.direccionEntrega),
    productos: pedido.productos,
    tiempoEspera,
    total: pedido.total ?? 0,
  };
}

export default function ListarSinConfirmar() {
  const [pedidos, setPedidos] = useState<PedidoListado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  // Obtener pedidos con estado "Solicitado"
  useEffect(() => {
    let cancelado = false;
    const fetchPedidos = async () => {
      try {
        const data = await listarPedidos({
          estado: EnumEstadoPedido.Pagado,
        });
        console.log(data)
        if (cancelado) return;

        const mapeados: PedidoListado[] = [];
        const errores: DTOPedido[] = [];

        for (const pedido of data) {
          const mapeado = mapearPedido(pedido);
          if (mapeado) {
            mapeados.push(mapeado);
          } else {
            errores.push(pedido);
          }
        }

        setPedidos(mapeados);

        // Si hubo pedidos sin productos, lo notificamos
        if (errores.length > 0) {
          showNotification(
            `${errores.length} pedido(s) ignorado(s) por no contener productos.`,
            "error",
          );
        }
      } catch (error) {
        if (!cancelado) {
          const mensaje =
            error instanceof Error ? error.message : "Error al cargar pedidos";
          showNotification(mensaje, "error");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    fetchPedidos();
    return () => {
      cancelado = true;
    };
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  // Placeholder para confirmar pedido (deberás implementar la llamada a tu endpoint)
  const handleConfirmar = async (pedidoId: string) => {
    try {
      // Ejemplo: await confirmarPedido(pedidoId);
      showNotification("Pedido confirmado correctamente.", "success");
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    } catch (error) {
      showNotification("Error al confirmar el pedido.", "error");
    }
  };

  // Placeholder para cancelar pedido (deberás implementar la llamada a tu endpoint)
  const handleCancelar = async (pedidoId: string) => {
    try {
      // Ejemplo: await cancelarPedido(pedidoId);
      showNotification("Pedido cancelado por el restaurante.", "error");
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    } catch (error) {
      showNotification("Error al cancelar el pedido.", "error");
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 w-full h-full p-4 md:p-8 overflow-y-auto bg-gray-50 text-gray-800 font-sans">
      {notification.show && (
        <div
          className={`mb-4 p-4 rounded-xl flex items-center shadow-sm ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="mr-3" size={20} />
          ) : (
            <AlertCircle className="mr-3" size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <h1 className="text-2xl font-black text-gray-800 text-center mb-6 uppercase tracking-tight">
        Pedidos a Confirmar
      </h1>

      <div className="max-w-2xl mx-auto mb-8 relative group">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white text-gray-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none border border-gray-200 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
        />
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full"></span>
              Cargando pedidos...
            </p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium text-lg">
              No hay pedidos pendientes de confirmación.
            </p>
            <p className="text-gray-400 text-sm mt-1">La cocina está al día.</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <CardPedidoAconfirmar
              key={pedido.id}
              pedido={pedido}
              onConfirmar={handleConfirmar}
              onCancelar={handleCancelar}
            />
          ))
        )}
      </div>
    </div>
  );
}
