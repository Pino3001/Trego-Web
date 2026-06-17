import { useCallback, useEffect, useMemo, useState } from "react";
import { listarProductos } from "../api/apiRestaurante.js";
import type { DTOProducto } from "../data/DTOProducto.js";
import { productosConOferta } from "../utils/productos.js";

interface UseProductoRestauranteOptions {
  soloOfertasInicial?: boolean; // por defecto false (todos los productos)
  ofertasActivasInicial?: boolean; // por defecto true (solo vigentes)
}

export function useProductoRestaurante({
  soloOfertasInicial = false,
  ofertasActivasInicial = true,
}: UseProductoRestauranteOptions = {}) {
  const [productos, setProductos] = useState<DTOProducto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);
  const [soloOfertas, setSoloOfertas] = useState(soloOfertasInicial);
  const [ofertasActivas, setOfertasActivas] = useState(ofertasActivasInicial);

  const fetchProductos = useCallback(async () => {
    setLoadingProductos(true);
    setErrorProductos(null);
    try {
      const data = await listarProductos();
      setProductos(data);
    } catch (err) {
      setErrorProductos(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Lista que se expone al componente (filtrada según las opciones de ofertas)
  const productosOfertas = useMemo(() => {
    if (!soloOfertas) {
      return productos; // todos los productos
    }
    // Si solo ofertas está activo, decidimos qué tipo de oferta filtrar
    if (ofertasActivas) {
      // Solo ofertas vigentes (fechas válidas y ofertasActivas = true)
      return productosConOferta(productos);
    } else {
      return productos.filter((p) => p.oferta != null);
    }
  }, [productos, soloOfertas, ofertasActivas]);

  const isProductoOfertaActiva = useCallback(
    (producto: DTOProducto) => isOfertaActiva(producto),
    [],
  );

  return {
    productos, // lista completa sin filtrar
    productosOfertas, // lista visible según filtro de ofertas
    loadingProductos,
    errorProductos,
    soloOfertas,
    setSoloOfertas,
    ofertasActivas,
    setOfertasActivas,
    recargarProductos: fetchProductos,
    isProductoOfertaActiva,
  };
}

/**
 * Verifica si un producto tiene una oferta activa hoy (fecha actual).
 * @param producto - producto a evaluar (debe tener propiedad "oferta" con fechas)
 * @returns true si la oferta existe y está vigente, false en caso contrario
 */
export function isOfertaActiva(producto: DTOProducto): boolean {
  // Nuevo: verificar el booleano ofertasActivas
  if (producto.ofertaActiva !== true) return false;

  if (!producto.oferta) return false;

  const { fechaInicio, fechaFin } = producto.oferta;
  if (!fechaInicio || !fechaFin) return false;

  const parseFecha = (f: string | Date): string | null => {
    try {
      const date = typeof f === "string" ? new Date(f) : new Date(f);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  };

  const inicioStr = parseFecha(fechaInicio);
  const finStr = parseFecha(fechaFin);

  if (!inicioStr || !finStr) return false;

  const hoy = new Date().toISOString().slice(0, 10);

  return hoy >= inicioStr && hoy <= finStr;
}
