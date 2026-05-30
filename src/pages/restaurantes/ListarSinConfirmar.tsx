import React, { useState, useEffect } from "react";
import { Search, User, CheckCircle, AlertCircle } from "lucide-react"; // Asumiendo que usas lucide-react para los íconos
import CardPedidoAconfirmar from "./componentes/CardPedidoAconfirmar.js";

// --- Tipos e Interfaces ---
export interface ProductoDTO {
  cantidad: number;
  nombre: string;
  notas?: string; // Crucial: "Sin cebolla", "Bien cocido", etc.
}

export interface PedidoDTO {
  id: string;
  cliente: string;
  direccion: string;
  productos: ProductoDTO[];
  tiempoEspera: number;
  tipoEntrega: "DELIVERY" | "TAKE_AWAY";
  total: number;
  estaPagado: boolean;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function ListarSinConfirmar() {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  // --- Simulación de Fetch Inicial (Paso 1 y 2 del Flujo Principal) ---
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // En producción: const response = await fetch('/api/pedidos?estado=pendiente');
        // const data = await response.json();

        // Datos mockeados basados en tu imagen para propósitos de la demo
        const MOCK_PEDIDOS: PedidoDTO[] = [
          {
            id: "3401",
            cliente: "Roberto Florez",
            direccion: "Av. Rivera 3601",
            productos: [
              { cantidad: 1, nombre: "HAMBURGUESA CON QUESO" },
              { cantidad: 1, nombre: "PAPAS FRITAS" },
            ],
            tiempoEspera: 3,
            tipoEntrega: "DELIVERY",
            total: 580,
            estaPagado: true,
          },
          {
            id: "3402",
            cliente: "Gimena Rodriguez",
            direccion: "Av. 8 de Octubre 1516",
            productos: [
              { cantidad: 1, nombre: "PIZZA MUZZARELLA" },
              { cantidad: 1, nombre: "COCA COLA 1.5L" },
              { cantidad: 1, nombre: "PIZZA MUZZARELLA" },
              { cantidad: 1, nombre: "COCA COLA 1.5L" },
              { cantidad: 1, nombre: "PIZZA MUZZARELLA" },
              { cantidad: 1, nombre: "COCA COLA 1.5L" },
              { cantidad: 1, nombre: "PIZZA MUZZARELLA" },
              { cantidad: 1, nombre: "COCA COLA 1.5L" },
              { cantidad: 1, nombre: "PIZZA MUZZARELLA" },
              { cantidad: 1, nombre: "COCA COLA 1.5L" },
            ],
            tiempoEspera: 12, // Activará la alerta crítica (> 8 min)
            tipoEntrega: "DELIVERY",
            total: 620,
            estaPagado: false,
          },
          {
            id: "3403",
            cliente: "Sebastian Lopez",
            direccion: "Av. 18 de Julio 2203",
            productos: [
              {
                cantidad: 1,
                nombre: "MILANESA AL PAN",
                notas: "Con extra mayonesa",
              },
            ],
            tiempoEspera: 5,
            tipoEntrega: "TAKE_AWAY",
            total: 450,
            estaPagado: true,
          },
          {
            id: "3404",
            cliente: "Maxi Cruz",
            direccion: "Bv. Artigas 1120",
            productos: [
              {
                cantidad: 2,
                nombre: "HAMBURGUESA CON QUESO",
                notas: "SIN CEBOLLA",
              },
              { cantidad: 1, nombre: "PAPAS FRITAS" },
            ],
            tiempoEspera: 2,
            tipoEntrega: "DELIVERY",
            total: 980,
            estaPagado: false,
          },
          {
            id: "3405",
            cliente: "Valentina Silva",
            direccion: "Av. Italia 4230",
            productos: [
              {
                cantidad: 1,
                nombre: "CHIVITO COMPLETO",
                notas: "Huevo bien cocido",
              },
              { cantidad: 1, nombre: "AGUA COCO" },
            ],
            tiempoEspera: 9, // Activará la alerta crítica
            tipoEntrega: "DELIVERY",
            total: 710,
            estaPagado: true,
          },
          {
            id: "3406",
            cliente: "Santiago Pereira",
            direccion: "Retira en local",
            productos: [
              { cantidad: 3, nombre: "EMPANADAS DE CARNE" },
              { cantidad: 2, nombre: "EMPANADAS DE JAMÓN Y QUESO" },
            ],
            tiempoEspera: 1,
            tipoEntrega: "TAKE_AWAY",
            total: 450,
            estaPagado: true,
          },
          {
            id: "3407",
            cliente: "Mariana Costa",
            direccion: "Bv. España 2890",
            productos: [
              {
                cantidad: 1,
                nombre: "ENSALADA CESAR",
                notas: "Aderezo aparte",
              },
            ],
            tiempoEspera: 4,
            tipoEntrega: "DELIVERY",
            total: 390,
            estaPagado: false,
          },
          {
            id: "3408",
            cliente: "Bruno Diaz",
            direccion: "Av. Larrañaga 3312",
            productos: [
              { cantidad: 1, nombre: "PIZZA CON PEPPERONI" },
              { cantidad: 1, nombre: "CERVEZA PATAGONIA 730ML" },
            ],
            tiempoEspera: 15, // Activará la alerta crítica por mucho retraso
            tipoEntrega: "DELIVERY",
            total: 850,
            estaPagado: false,
          },
          {
            id: "3409",
            cliente: "Lucía Méndez",
            direccion: "Retira en local",
            productos: [{ cantidad: 1, nombre: "CHIVITO AL PLATO (PARA DOS)" }],
            tiempoEspera: 6,
            tipoEntrega: "TAKE_AWAY",
            total: 1100,
            estaPagado: true,
          },
          {
            id: "3410",
            cliente: "Facundo Torres",
            direccion: "Gonzalo Ramírez 1840",
            productos: [
              { cantidad: 2, nombre: "MILANESA CON PAPAS FRITAS" },
              { cantidad: 2, nombre: "COCA COLA 500ML" },
            ],
            tiempoEspera: 7,
            tipoEntrega: "DELIVERY",
            total: 1340,
            estaPagado: true,
          },
        ];

        setTimeout(() => {
          setPedidos(MOCK_PEDIDOS);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error al cargar los pedidos", error);
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  // --- Manejador de Confirmación (Paso 3 y Flujo Alternativo 3.1) ---
  const handleConfirmar = async (pedidoId: string) => {
    try {
      /* En producción:
      const response = await fetch(`/api/pedidos/confirmar/${pedidoId}`, { method: 'PATCH' });
      
      // Flujo Alternativo 3.1: Pedido cancelado previamente
      if (response.status === 409) {
        showNotification("El pedido ha sido cancelado por el cliente", 'error');
        setPedidos(prev => prev.filter(p => p.id !== pedidoId));
        return;
      }
      
      if (!response.ok) throw new Error('Error al confirmar pedido');
      */

      // Simulación de éxito (Paso 4 del Flujo Principal)
      showNotification(
        "Pedido confirmado correctamente. Notificando al cliente...",
        "success",
      );

      // Se elimina de la lista actual UI
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    } catch (error) {
      showNotification(
        "Ocurrió un error al procesar la confirmación.",
        "error",
      );
    }
  };

  // --- Manejador de Cancelación por parte del restaurante ---
  const handleCancelar = async (pedidoId: string) => {
    try {
      // Llamada al C.U Cancelar Pedido referenciado en tu diagrama
      // await fetch(`/api/pedidos/cancelar/${pedidoId}`, { method: 'PATCH' });
      showNotification("Pedido cancelado por el restaurante.", "error");
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    } catch (error) {
      console.error("Error al cancelar", error);
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()),
  );

return (
    // Contenedor principal de la vista. 
    // Toma todo el ancho y alto disponible que le deje el Layout padre.
    <div className="flex-1 w-full h-full p-4 md:p-8 overflow-y-auto bg-gray-50 text-gray-800 font-sans">
      
      {/* --- Notificaciones (Toast) --- */}
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

      {/* --- Encabezado de la Vista --- */}
      <h1 className="text-2xl font-black text-gray-800 text-center mb-6 uppercase tracking-tight">
        Pedidos a Confirmar
      </h1>

      {/* --- Buscador --- */}
      <div className="max-w-2xl mx-auto mb-8 relative group">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por nombre de cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white text-gray-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none border border-gray-200 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
        />
      </div>

      {/* --- Lista de Tarjetas --- */}
      <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-10">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full"></span>
              Cargando pedidos pendientes...
            </p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium text-lg">
              No hay pedidos pendientes de confirmación.
            </p>
            <p className="text-gray-400 text-sm mt-1">Buen trabajo, la cocina está al día.</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <CardPedidoAconfirmar
              key={pedido.id}
              pedido={pedido}
              onConfirmar={(id) => { /* tu logica */ }}
              onCancelar={(id) => { /* tu logica */ }}
            />
          ))
        )}
      </div>
      
    </div>
  );
}
