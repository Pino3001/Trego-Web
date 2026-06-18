/* import { useCallback, useEffect, useMemo, useState } from "react";
import { clienteApi } from "../api/clienteApi.js";
import type { DTODireccion } from "../data/DTODireccion.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";

export interface FiltrosRestauranteCliente {
  categoria: string;
  calificacionMin: number;
  horarioDesde: string;
  horarioHasta: string;
}

const FILTROS_INICIALES: FiltrosRestauranteCliente = {
  categoria: "",
  calificacionMin: 0,
  horarioDesde: "",
  horarioHasta: "",
};

type ModoCarga = "todos" | "nombre" | "direccion";

function filtrarEnFront(
  lista: DTORestaurante[],
  filtros: FiltrosRestauranteCliente,
): DTORestaurante[] {
  return lista.filter((r) => {
    if (filtros.categoria && r.categoria !== filtros.categoria) {
      return false;
    }
    if (
      filtros.calificacionMin > 0 &&
      (r.calificacionProm ?? 0) < filtros.calificacionMin
    ) {
      return false;
    }
    if (filtros.horarioDesde && r.horaApertura) {
      if (r.horaApertura < filtros.horarioDesde) return false;
    }
    if (filtros.horarioHasta && r.horaCierre) {
      if (r.horaCierre > filtros.horarioHasta) return false;
    }
    return true;
  });
}

export function useRestaurantesCliente() {
  const [listaBase, setListaBase] = useState<DTORestaurante[]>([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [modo, setModo] = useState<ModoCarga>("todos");
  const [terminoNombre, setTerminoNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTodos = useCallback(async () => {
    setCargando(true);
    setError(null);
    setModo("todos");
    setTerminoNombre("");
    try {
      const data = await clienteApi.listarRestaurantes();
      setListaBase(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar restaurantes",
      );
      setListaBase([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const buscarPorNombre = useCallback(async (nombre: string) => {
    const termino = nombre.trim();
    if (!termino) {
      await cargarTodos();
      return;
    }
    setCargando(true);
    setError(null);
    setModo("nombre");
    setTerminoNombre(termino);
    try {
      const data = await clienteApi.listarRestaurantes(termino);
      setListaBase(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en la búsqueda");
      setListaBase([]);
    } finally {
      setCargando(false);
    }
  }, [cargarTodos]);

  const cargarPorDireccion = useCallback(async (direccion: DTODireccion) => {
    setCargando(true);
    setError(null);
    setModo("direccion");
    try {
      const data = await clienteApi.listarRestaurantesPorDireccion(direccion);
      setListaBase(data);
      if (data.length === 0) {
        setError("No hay restaurantes que repartan en tu zona.");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar restaurantes para tu zona",
      );
      setListaBase([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodos();
  }, [cargarTodos]);

  const restaurantes = useMemo(
    () => filtrarEnFront(listaBase, filtros),
    [listaBase, filtros],
  );

  const aplicarFiltros = useCallback((nuevos: FiltrosRestauranteCliente) => {
    setFiltros(nuevos);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
  }, []);

  const recargar = useCallback(async () => {
    if (modo === "nombre" && terminoNombre) {
      await buscarPorNombre(terminoNombre);
    } else {
      await cargarTodos();
    }
  }, [modo, terminoNombre, buscarPorNombre, cargarTodos]);

  const hayFiltrosActivos =
    !!filtros.categoria ||
    filtros.calificacionMin > 0 ||
    !!filtros.horarioDesde ||
    !!filtros.horarioHasta;

  return {
    restaurantes,
    listaBase,
    filtros,
    cargando,
    error,
    modo,
    terminoNombre,
    cargarTodos,
    buscarPorNombre,
    cargarPorDireccion,
    aplicarFiltros,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  };
}
 */