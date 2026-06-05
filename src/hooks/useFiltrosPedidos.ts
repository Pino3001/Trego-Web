import { useCallback, useMemo, useState } from "react";
import type { DTOPedido } from "../data/DTOPedido.js";
import { toDateString } from "../pages/restaurantes/utilitis/funcionesListado.js";

export function useFiltrosPedidos(pedidos: DTOPedido[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<
    number | undefined
  >();
  const [orden, setOrden] = useState<"ASC" | "DESC">("ASC");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidos;

    // Filtro por texto (nombre cliente o ID)
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (p) =>
          p.nombreCliente?.toLowerCase().includes(termino) ||
          String(p.idPedido ?? "").includes(termino),
      );
    }

    // Filtro por producto
    if (productoSeleccionadoId !== undefined) {
      resultado = resultado.filter((pedido) =>
        pedido.productos?.some(
          (pp) => pp.producto?.idProducto === productoSeleccionadoId,
        ),
      );
    }

    if (fechaDesde.trim()) {
      resultado = resultado.filter((p) => {
        const fechaPedido = toDateString(p.fechaCreacion);
        return fechaPedido !== null && fechaPedido >= fechaDesde;
      });
    }

    if (fechaHasta.trim()) {
      resultado = resultado.filter((p) => {
        const fechaPedido = toDateString(p.fechaCreacion);
        return fechaPedido !== null && fechaPedido <= fechaHasta;
      });
    }

    // Ordenamiento (crea copia para no mutar el original)
    return [...resultado].sort((a, b) => {
      const idA = a.idPedido ?? 0;
      const idB = b.idPedido ?? 0;
      return orden === "ASC" ? idA - idB : idB - idA;
    });
  }, [
    pedidos,
    searchTerm,
    productoSeleccionadoId,
    orden,
    fechaDesde,
    fechaHasta,
  ]);

  const hayFiltros =
    searchTerm.trim() !== "" ||
    productoSeleccionadoId !== undefined ||
    fechaDesde.trim() !== "" ||
    fechaHasta.trim() !== "";

  const limpiarFiltros = useCallback(() => {
    setSearchTerm("");
    setProductoSeleccionadoId(undefined);
    setOrden("ASC");
    setFechaDesde("");
    setFechaHasta("");
  }, []);

  return {
    // Estados
    searchTerm,
    setSearchTerm,
    productoSeleccionadoId,
    setProductoSeleccionadoId,
    orden,
    setOrden,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    // Datos derivados
    pedidosFiltrados,
    hayFiltros,
    limpiarFiltros,
  };
}
