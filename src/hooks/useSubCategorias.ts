import { useState, useEffect, useCallback } from 'react';
import { listarSubcategorias } from '../api/apiRestaurante.js';
import type { DTOSubcategoria } from '../data/DTOSubcategoria.js';

interface UseSubCategoriasOptions {
  onError?: (mensaje: string) => void;
}

export function useSubCategorias({ onError }: UseSubCategoriasOptions = {}) {
  const [subcategorias, setSubcategorias] = useState<DTOSubcategoria[]>([]);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<DTOSubcategoria | undefined>();

  // Carga inicial
  useEffect(() => {
    let cancelado = false;
    const cargarSubcategorias = async () => {
      try {
        const data = await listarSubcategorias();
        if (!cancelado) setSubcategorias(data);
      } catch (e) {
        if (!cancelado) {
          const mensaje = e instanceof Error ? e.message : 'Error inesperado';
          onError?.(mensaje);
        }
      }
    };
    cargarSubcategorias();
    return () => {
      cancelado = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const seleccionarSubcategoria = useCallback((sub: DTOSubcategoria | undefined) => {
    setSubcategoriaSeleccionada(sub);
  }, []);

  return {
    subcategorias,
    subcategoriaSeleccionada,
    seleccionarSubcategoria,
  };
}