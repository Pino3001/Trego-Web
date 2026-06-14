import { useState, useMemo, useCallback } from "react";
import type { DTOProducto } from "../data/DTOProducto.js";

export function useFiltrosProductos(productos: DTOProducto[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredienteSeleccionadoId, setIngredienteSeleccionadoId] = useState<number | undefined>();
  const [orden, setOrden] = useState<"ASC" | "DESC">("ASC");
  const [estadoFiltro, setEstadoFiltro] = useState<"TODOS" | "HABILITADOS" | "DESHABILITADOS">("HABILITADOS");
  const [fechaInicioOferta, setFechaInicioOferta] = useState(""); // YYYY-MM-DD
  const [fechaFinOferta, setFechaFinOferta] = useState("");         // YYYY-MM-DD

  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // 1. Filtro por texto (nombre o ID)
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim();
      resultado = resultado.filter((p) =>
        p.nombre?.toLowerCase().includes(termino) ||
        String(p.idProducto ?? "").includes(termino)
      );
    }

    // 2. Filtro por ingrediente
    if (ingredienteSeleccionadoId !== undefined) {
      resultado = resultado.filter((producto) =>
        producto.ingredientes?.some(
          (ing) => ing.idIngrediente === ingredienteSeleccionadoId,
        ),
      );
    }

    // 3. Filtro por estado (habilitado/deshabilitado)
    if (estadoFiltro !== "TODOS") {
      resultado = resultado.filter((p) =>
        estadoFiltro === "HABILITADOS"
          ? p.disponible === true
          : p.disponible === false,
      );
    }

    // 4. Filtro por rango de fechas de oferta
    const inicio = fechaInicioOferta.trim();
    const fin = fechaFinOferta.trim();

    if (inicio || fin) {
      resultado = resultado.filter((p) => {
        if (!p.oferta) return false; // sin oferta -> no cumple

        const inicioOferta = p.oferta.fechaInicio
          ? (typeof p.oferta.fechaInicio === "string"
              ? p.oferta.fechaInicio.slice(0, 10)
              : new Date(p.oferta.fechaInicio).toISOString().slice(0, 10))
          : null;
        const finOferta = p.oferta.fechaFin
          ? (typeof p.oferta.fechaFin === "string"
              ? p.oferta.fechaFin.slice(0, 10)
              : new Date(p.oferta.fechaFin).toISOString().slice(0, 10))
          : null;

        if (!inicioOferta || !finOferta) return false;

        // Caso 1: solo fecha de inicio → oferta que comienza exactamente ese día
        if (inicio && !fin) return inicioOferta === inicio;

        // Caso 2: solo fecha de fin → oferta que termina exactamente ese día
        if (!inicio && fin) return finOferta === fin;

        // Caso 3: ambas fechas → oferta activa dentro del intervalo [inicio, fin]
        return inicioOferta <= fin && finOferta >= inicio;
      });
    }

    // 5. Ordenamiento por nombre
    return [...resultado].sort((a, b) => {
      const nombreA = (a.nombre ?? "").toLowerCase();
      const nombreB = (b.nombre ?? "").toLowerCase();
      return orden === "ASC"
        ? nombreA.localeCompare(nombreB)
        : nombreB.localeCompare(nombreA);
    });
  }, [
    productos,
    searchTerm,
    ingredienteSeleccionadoId,
    orden,
    estadoFiltro,
    fechaInicioOferta,
    fechaFinOferta,
  ]);

  const hayFiltros =
    searchTerm.trim() !== "" ||
    ingredienteSeleccionadoId !== undefined ||
    estadoFiltro !== "TODOS" ||
    fechaInicioOferta.trim() !== "" ||
    fechaFinOferta.trim() !== "";

  const limpiarFiltros = useCallback(() => {
    setSearchTerm("");
    setIngredienteSeleccionadoId(undefined);
    setOrden("ASC");
    setEstadoFiltro("TODOS");
    setFechaInicioOferta("");
    setFechaFinOferta("");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    ingredienteSeleccionadoId,
    setIngredienteSeleccionadoId,
    orden,
    setOrden,
    estadoFiltro,
    setEstadoFiltro,
    fechaInicioOferta,
    setFechaInicioOferta,
    fechaFinOferta,
    setFechaFinOferta,
    productosFiltrados,
    hayFiltros,
    limpiarFiltros,
  };
}