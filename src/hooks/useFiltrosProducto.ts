import { useState, useMemo, useCallback } from "react";
import type { DTOProducto } from "../data/DTOProducto.js";

export function useFiltrosProductos(productos: DTOProducto[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredienteSeleccionadoId, setIngredienteSeleccionadoId] = useState<
    number | undefined
  >();
  const [orden, setOrden] = useState<"ASC" | "DESC">("ASC");

  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // Filtro por texto (nombre o ID del producto)
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          String(p.idProducto ?? "").includes(termino),
      );
    }

    // Filtro por ingrediente
    if (ingredienteSeleccionadoId !== undefined) {
      resultado = resultado.filter((producto) =>
        producto.ingredientes?.some(
          (ing) => ing.idIngrediente === ingredienteSeleccionadoId,
        ),
      );
    }

    // Ordenamiento por NOMBRE
    return [...resultado].sort((a, b) => {
      const nombreA = (a.nombre ?? "").toLowerCase();
      const nombreB = (b.nombre ?? "").toLowerCase();
      if (orden === "ASC") {
        return nombreA.localeCompare(nombreB);
      } else {
        return nombreB.localeCompare(nombreA);
      }
    });
  }, [productos, searchTerm, ingredienteSeleccionadoId, orden]);

  const hayFiltros =
    searchTerm.trim() !== "" || ingredienteSeleccionadoId !== undefined;

  const limpiarFiltros = useCallback(() => {
    setSearchTerm("");
    setIngredienteSeleccionadoId(undefined);
    setOrden("ASC");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    ingredienteSeleccionadoId,
    setIngredienteSeleccionadoId,
    orden,
    setOrden,
    productosFiltrados,
    hayFiltros,
    limpiarFiltros,
  };
}
