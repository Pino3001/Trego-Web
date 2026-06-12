import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MenuApiError, obtenerMenuRestaurante, type MenuResponse } from '../api/menuApi.js';
import type { DTORestaurante } from '../data/DTORestaurante.js';
import { productosConOferta } from '../utils/productos.js';

export function useMenuRestaurante(idRestaurante: number | undefined) {
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState('');
  const [ordenPrecio, setOrdenPrecio] = useState('');
  const restauranteRef = useRef<DTORestaurante | null>(null);

  const cargar = useCallback(async () => {
    if (!idRestaurante) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMenuRestaurante(idRestaurante, {
        categoria,
        ordenPrecio,
      });
      if (data.restaurante) {
        restauranteRef.current = data.restaurante;
      }
      const restaurante = data.restaurante ?? restauranteRef.current;
      setMenu(data);
      console.log(data)
    } catch (e: unknown) {
      if (e instanceof MenuApiError && e.status === 404) {
        setError('El restaurante no existe o no está disponible');
      } else {
        setError(e instanceof Error ? e.message : 'Error al cargar el menú');
      }
      setMenu(null);
    } finally {
      setCargando(false);
    }
  }, [idRestaurante, categoria, ordenPrecio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const productos = menu?.productos ?? [];
  const ofertas = useMemo(() => productosConOferta(productos), [productos]);

  const sinProductos =
    (!!menu?.restaurante || !!menu?.mensaje) &&
    !categoria &&
    productos.length === 0;

  const sinProductosEnCategoria =
    !!categoria && productos.length === 0 && !!menu?.restaurante;

  return {
    menu,
    cargando,
    error,
    categoria,
    setCategoria,
    ordenPrecio,
    setOrdenPrecio,
    productosFiltrados: productos,
    ofertas,
    sinProductos,
    sinProductosEnCategoria,
    recargar: cargar,
  };
}