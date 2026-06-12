import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { DTOSubcategoria } from "../data/DTOSubcategoria.js";
import { listarSubcategorias } from "../api/apiRestaurante.js";
import type { EnumCategoriaProducto } from "../data/EnumCategoriaProducto.js";

interface UseSubCategoriasUnificadoOptions {
  onError?: (mensaje: string) => void;
}

export function useSubCategorias({
  onError,
}: UseSubCategoriasUnificadoOptions = {}) {
  const [subcategorias, setSubcategorias] = useState<DTOSubcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<
    EnumCategoriaProducto | undefined
  >(undefined);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<
    DTOSubcategoria | undefined
  >();

  // Estabilidad de onError
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Carga inicial con cancelación
  const cargar = useCallback(() => {
    setLoading(true);
    setError(null);
    let cancelado = false;

    (async () => {
      try {
        const data = await listarSubcategorias();
        if (!cancelado) {
          setSubcategorias(data);
        }
      } catch (e) {
        if (!cancelado) {
          const mensaje =
            e instanceof Error ? e.message : "Error al cargar subcategorías";
          setError(mensaje);
          onErrorRef.current?.(mensaje);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    // Return sync cleanup for useEffect
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const cancel = cargar();
    return cancel;
  }, [cargar]);

  // Lista filtrada por categoría
  const subcategoriasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return subcategorias;
    return subcategorias.filter((sub) => sub.categoria === categoriaFiltro);
  }, [subcategorias, categoriaFiltro]);

  // Seleccionar una subcategoría (para uso en formularios, etc.)
  const seleccionarSubcategoria = useCallback(
    (sub: DTOSubcategoria | undefined) => {
      setSubcategoriaSeleccionada(sub);
    },
    [],
  );

  return {
    subcategorias,
    subcategoriasFiltradas,
    loading,
    error,
    categoriaFiltro,
    setCategoriaFiltro,
    subcategoriaSeleccionada,
    seleccionarSubcategoria,
    recargar: cargar,
  };
}
