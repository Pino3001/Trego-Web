import { Link, useParams } from "react-router";
import { useEffect, type ReactNode } from "react";
import RestauranteBanner from "../../components/menu/RestauranteBanner.jsx";
import OfertaCard from "../../components/menu/OfertaCard.jsx";
import Header from "../../components/body/Header.js";
import { useCarrito } from "../../context/CarritoContext.jsx";
import { useMenuCliente } from "../../hooks/useMenuCliente.js";
import {
  productoParaCarrito,
  restauranteParaUi,
} from "../../utils/menuCliente.js";
import type { DTOProducto } from "../../data/DTOProducto.js";
import MenuFiltrosCliente from "../../components/cliente/MenuFiltrosCliente.js";
import { IconBack, IconTag } from "../../components/icons.jsx";
import ProductoClienteCard from "../../components/cliente/ProductoClienteCard.js";

export default function MenuRestauranteClientePage() {
  const { id } = useParams();
  const { abrirDetalleProducto, validarRestauranteAbierto } = useCarrito();

  const {
    restaurante,
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
  } = useMenuCliente(id);

  const restauranteUi = restaurante ? restauranteParaUi(restaurante) : null;

  useEffect(() => {
    if (restauranteUi) {
      validarRestauranteAbierto(restauranteUi.abierto);
    }
  }, [restauranteUi?.abierto, restauranteUi, validarRestauranteAbierto]);

  const handleAgregar = (producto: DTOProducto) => {
    if (!restauranteUi) return;
    abrirDetalleProducto(productoParaCarrito(producto), restauranteUi);
  };

  const ofertasUi = ofertas.map(productoParaCarrito);

  if (cargando) {
    return (
      <PageShell>
        <p className="py-16 text-center text-gray-500">Cargando menú…</p>
      </PageShell>
    );
  }

  if (error || !restaurante || !restauranteUi) {
    return (
      <PageShell>
        <NavBack />
        <p className="py-16 text-center text-red-600">
          {error ?? "No se pudo cargar el menú"}
        </p>
      </PageShell>
    );
  }

  if (restaurante.habilitado === false) {
    return (
      <PageShell>
        <NavBack />
        <p className="py-16 text-center text-gray-600">
          Este restaurante no está disponible.
        </p>
      </PageShell>
    );
  }

  if (sinProductos) {
    return (
      <PageShell>
        <NavBack />
        <RestauranteBanner restaurante={restauranteUi} />
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-gray-600">
            {mensajeVacio ?? "Este restaurante aún no ha cargado su menú"}
          </p>
          <Link
            to="/cliente/restaurantes"
            className="rounded-xl bg-trego-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Volver al listado
          </Link>
        </div>
      </PageShell>
    );
  }

  const mostrarOfertas = ofertasUi.length > 0 && !categoria && !soloOfertas;

  return (
    <PageShell>
      <NavBack />
      <RestauranteBanner restaurante={restauranteUi} />

      <div className="mt-5 flex flex-col gap-5 lg:mt-6 lg:flex-row lg:items-start lg:gap-6">
        <MenuFiltrosCliente
          categoria={categoria}
          onCategoriaChange={setCategoria}
          ordenPrecio={ordenPrecio}
          onOrdenChange={setOrdenPrecio}
          soloOfertas={soloOfertas}
          onSoloOfertasChange={setSoloOfertas}
          busquedaPlato={busquedaPlato}
          onBusquedaPlatoChange={setBusquedaPlato}
        />

        <div className="min-w-0 flex-1">
          {mostrarOfertas && (
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-[17px] font-bold text-gray-900">
                <IconTag className="h-5 w-5 text-trego-orange" />
                Ofertas del día
              </h2>
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 scrollbar-thin">
                {ofertasUi.map((p) => (
                  <OfertaCard key={p.idProducto} producto={p} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-[17px] font-bold text-gray-900">
              Todos los productos
            </h2>

            {sinProductosEnCategoria ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
                No hay productos en esta categoría
              </p>
            ) : sinResultadosLocales ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
                Ningún plato coincide con tu búsqueda o filtros
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {productosFiltrados.map((p) => (
                  <li key={p.idProducto}>
                    <ProductoClienteCard
                      producto={p}
                      onAgregar={handleAgregar}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Header
        busqueda=""
        onBusquedaChange={() => {}}
        onBuscar={() => {}}
        onAbrirFiltros={() => {}}
      />
      <main className="mx-auto max-w-275 px-4 py-3 sm:px-6 sm:py-4">
        {children}
      </main>
    </div>
  );
}

function NavBack() {
  return (
    <Link
      to="/cliente/restaurantes"
      className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-800 hover:text-trego-orange"
    >
      <IconBack className="h-5 w-5" />
      Lista de restaurantes
    </Link>
  );
}
