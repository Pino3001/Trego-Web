import { useCallback, useEffect, useState } from "react";
import { listarProductos } from "../api/apiRestaurante.js";
import type { DTOProducto } from "../data/DTOProducto.js";

export function useProductoRestaurante() {
  const [productos, setProductos] = useState<DTOProducto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoadingProductos(true);
    setErrorProductos(null);
    try {
      const data = await listarProductos();
      setProductos(data);
    } catch (err) {
      setErrorProductos(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return {
    productos,
    loadingProductos,
    errorProductos,
    recargarProductos: fetchProductos,    // recarga manual (con spinner)
  };
}