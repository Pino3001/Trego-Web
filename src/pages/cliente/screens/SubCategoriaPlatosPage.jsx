import { Link, useLocation, useParams } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconBack } from "../../../components/icons.jsx";
import EmptyState from "../../../components/EmptyState.jsx";
import OfertaPlatoCard from "../../../components/OfertaPlatoCard.jsx";
import { useGeolocation } from "../../../hooks/useGeolocation.js";
import { useSubCategorias } from "../../../hooks/useSubCategorias.js";
import { obtenerRestaurantesZona } from "../../../api/restaurantesApi.js";
import {
  listarProductosPorSubcategoriaEnZona,
  resolverProductoOfertaParaCarrito,
} from "../../../api/productosClienteApi.js";
import { useCarrito } from "../../../context/CarritoContext.js";

export default function SubCategoriaPlatosPage() {
  const { id } = useParams();
  const location = useLocation();
  const geo = useGeolocation(false);
  const { subcategorias } = useSubCategorias();
  const { abrirDetalleProducto, validarRestauranteAbierto } = useCarrito();

  const [platos, setPlatos] = useState([]);
  const [restaurantesZona, setRestaurantesZona] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cargandoSeleccion, setCargandoSeleccion] = useState(false);

  const idSubCategoria = Number(id);
  const subcategoria = useMemo(() => {
    if (location.state?.subcategoria?.idSubCategoria === idSubCategoria) {
      return location.state.subcategoria;
    }
    return subcategorias.find((s) => s.idSubCategoria === idSubCategoria);
  }, [location.state, subcategorias, idSubCategoria]);

  const titulo = subcategoria?.nombre ?? "Platos";

  useEffect(() => {
    if (!geo.tieneUbicacion || !geo.coords || !idSubCategoria) return;

    let activo = true;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const base = await obtenerRestaurantesZona({
          latitud: geo.coords.latitud,
          longitud: geo.coords.longitud,
        });
        if (activo) setRestaurantesZona(base);

        const data = await listarProductosPorSubcategoriaEnZona(
          geo.coords,
          idSubCategoria,
          base,
        );
        if (activo) setPlatos(data);
      } catch (e) {
        if (activo) {
          setError(e?.message ?? "No se pudieron cargar los platos");
          setPlatos([]);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [
    geo.tieneUbicacion,
    geo.coords?.latitud,
    geo.coords?.longitud,
    idSubCategoria,
  ]);

  const handleSeleccionar = useCallback(
    async (item) => {
      if (cargandoSeleccion) return;
      setCargandoSeleccion(true);
      try {
        const { producto, restaurante } = await resolverProductoOfertaParaCarrito(
          item,
          { restaurantesZona },
        );
        if (!producto) return;
        if (restaurante) {
          validarRestauranteAbierto(restaurante.abierto ?? true);
        }
        abrirDetalleProducto(producto, restaurante);
      } finally {
        setCargandoSeleccion(false);
      }
    },
    [
      abrirDetalleProducto,
      cargandoSeleccion,
      restaurantesZona,
      validarRestauranteAbierto,
    ],
  );

  if (!geo.tieneUbicacion) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="mx-auto w-full max-w-400 px-3 py-4 sm:px-6 sm:py-6">
          <Link
            to="/restaurantes"
            className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-800 hover:text-trego-orange"
          >
            <IconBack className="h-5 w-5" />
            Volver al inicio
          </Link>
          <EmptyState mensaje="Activá tu ubicación desde el inicio para ver platos en tu zona" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto w-full max-w-400 px-3 py-4 sm:px-6 sm:py-6">
        <Link
          to="/restaurantes"
          className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-800 hover:text-trego-orange"
        >
          <IconBack className="h-5 w-5" />
          Volver al inicio
        </Link>

        <header className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{titulo}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platos disponibles en tu zona
          </p>
        </header>

        {cargando && (
          <p className="text-center text-sm text-gray-500">Cargando platos...</p>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {!cargando && !error && platos.length === 0 && (
          <EmptyState mensaje={`No hay platos de "${titulo}" en tu zona`} />
        )}

        {platos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {platos.map((item) => (
              <OfertaPlatoCard
                key={`${item.idRestaurante}-${item.producto?.idProducto}`}
                oferta={item}
                enGrid
                onSeleccionar={handleSeleccionar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
