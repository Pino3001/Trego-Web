import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerActual } from "../api/apiRestaurante.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";

interface UseRestauranteActualOptions {
  onError?: (mensaje: string) => void;
}

export function useRestauranteActual({ onError }: UseRestauranteActualOptions = {}) {
  const [restaurante, setRestaurante] = useState<DTORestaurante | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evitamos que onError sea dependencia de useCallback
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerActual();
      setRestaurante(data);
      console.log("Viene imagen: ", data.fotoPerfil )
      console.log("¡Token encontrado!",localStorage.getItem("jwtToken"));
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'Error al obtener el restaurante';
      setError(mensaje);
      onErrorRef.current?.(mensaje);
    } finally {
      setLoading(false);
    }
  }, []); // estable, sin dependencias

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    restaurante,
    loading,
    error,
    recargar: cargar,
    setRestaurante, // por si querés actualizar localmente después de mutaciones
  };
}