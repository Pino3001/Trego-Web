import { useCallback, useEffect, useMemo, useState } from "react";
import { listarProductos } from "../api/apiRestaurante.js";
import type { DTOProducto } from "../data/DTOProducto.js";
import {
  aplicarOverridesOfertaActiva,
  esProductoOfertaVigente,
  guardarOverrideOfertaActiva,
  productoTieneOferta,
  productosConOferta,
} from "../utils/productos.js";

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
      setProductos(aplicarOverridesOfertaActiva(data));
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

  const productosOfertas = useMemo(() => {
    if (!soloOfertas) {
      return productos;
    }
    if (ofertasActivas) {
      return productosConOferta(productos);
    }
    return productos.filter((p) => productoTieneOferta(p));
  }, [productos, soloOfertas, ofertasActivas]);

  const isProductoOfertaActiva = useCallback(
    (producto: DTOProducto) => esProductoOfertaVigente(producto),
    [],
  );

  const actualizarOfertaActiva = useCallback(
    (idProducto: number, activa: boolean) => {
      guardarOverrideOfertaActiva(idProducto, activa);
      setProductos((prev) =>
        prev.map((p) =>
          p.idProducto === idProducto ? { ...p, ofertaActiva: activa } : p,
        ),
      );
    },
    [],
  );

  return {
    productos,
    productosOfertas,
    loadingProductos,
    errorProductos,
    soloOfertas,
    setSoloOfertas,
    ofertasActivas,
    setOfertasActivas,
    recargarProductos: fetchProductos,
    isProductoOfertaActiva,
    actualizarOfertaActiva,
  };
}

/** @deprecated Usar esProductoOfertaVigente de utils/productos */
export function isOfertaActiva(producto: DTOProducto): boolean {
  return esProductoOfertaVigente(producto);
}
