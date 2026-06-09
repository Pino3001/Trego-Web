import { useState, useEffect, useCallback, useRef } from "react";
import { clienteActual } from "../api/apiPerfil.js";
import type { DTOCliente } from "../data/DTOCliente.js";

interface UseClienteOptions {
  onError?: (mensaje: string) => void;
}

export function useCliente({ onError }: UseClienteOptions = {}) {
  const [cliente, setCliente] = useState<DTOCliente | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cargarPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteActual();
      setCliente(data);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error al cargar perfil";
      setError(mensaje);
      onErrorRef.current?.(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  return {
    cliente,
    loading,
    error,
    recargar: cargarPerfil,
    setCliente,
  };
}
