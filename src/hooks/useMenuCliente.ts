import { useCallback, useEffect, useMemo, useState } from "react";
import { clienteApi } from "../api/clienteApi.js";
import { esMenuSinProductos } from "../data/VerMenuRespuesta.js";
import type { DTOProducto } from "../data/DTOProducto.js";
import type { DTORestaurante } from "../data/DTORestaurante.js";
import {
  filtrarProductosLocales,
  ordenFrontAMenu,
  productoTieneOferta,
  type OrdenPrecioFront,
} from "../utils/menuCliente.js";
import { productosConOferta } from "../utils/productos.js";

export function useMenuCliente(idRestaurante: string | undefined) {
  const [restaurante, setRestaurante] = useState<DTORestaurante | null>(null);
  const [productos, setProductos] = useState<DTOProducto[]>([]);
  const [mensajeVacio, setMensajeVacio] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoria, setCategoria] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<OrdenPrecioFront>("");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [busquedaPlato, setBusquedaPlato] = useState("");

  const cargar = useCallback(async () => {
    const id = Number(idRestaurante);
    if (!idRestaurante || Number.isNaN(id)) {
      setError("Restaurante no válido");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    setMensajeVacio(null);

    try {
      const [cabecera, menuResp] = await Promise.all([
        clienteApi.obtenerRestaurante(id),
        clienteApi.verMenu(id, {
          categoria: categoria ?? undefined,
          orden: ordenFrontAMenu(ordenPrecio) ?? "precio_asc",
        }),
      ]);

      if (esMenuSinProductos(menuResp)) {
        setRestaurante(cabecera);
        setProductos([]);
        setMensajeVacio(menuResp.mensaje);
        return;
      }

      setRestaurante({
        ...cabecera,
        ...menuResp,
        idRestaurante: menuResp.idRestaurante ?? cabecera.idRestaurante ?? id,
      });
      setProductos(menuResp.productos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el menú");
      setRestaurante(null);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, [idRestaurante, categoria, ordenPrecio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const productosFiltrados = useMemo(
    () =>
      filtrarProductosLocales(productos, {
        nombrePlato: busquedaPlato,
        soloOfertas,
      }),
    [productos, busquedaPlato, soloOfertas],
  );

  const ofertas = useMemo(() => productosConOferta(productos), [productos]);

  const sinProductos =
    !!restaurante && productos.length === 0 && !!mensajeVacio;
  const sinResultadosLocales =
    productos.length > 0 && productosFiltrados.length === 0;
  const sinProductosEnCategoria =
    !!categoria && productos.length === 0 && !mensajeVacio;

  return {
    restaurante,
    productos,
    productosFiltrados,
    ofertas,
    cargando,
    error,
    mensajeVacio,
    categoria,
    setCategoria,
    ordenPrecio,
    setOrdenPrecio,
    soloOfertas,
    setSoloOfertas,
    busquedaPlato,
    setBusquedaPlato,
    sinProductos,
    sinResultadosLocales,
    sinProductosEnCategoria,
    recargar: cargar,
  };
}
