import React, { useState, type ReactNode } from "react";
import tregoLogo from "../../assets/tregoicon.svg";
import tregoRestaurante from "../../assets/tregoIconRestaurante.svg";
import tregoAdmin from "../../assets/tregoAdminCircular.svg";
import { IconCart, IconMenu, IconSearch, IconUser } from "../icons.jsx";
import { useNavigate } from "react-router";
import { apiAuth } from "../../api/apiAuth.js";
import { useCarrito } from "../../context/CarritoContext.jsx";

interface HeaderProps {
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  onBuscar?: () => void;
  onAbrirFiltros?: () => void;
  abrirPerfil?: boolean;
  tipoUser?: "Cliente" | "Restaurante" | "Administrador";
  botonRegistrar?: boolean;
  children?: ReactNode;
}

export default function Header(props: HeaderProps) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { abrirCarrito, cantidadTotal } = useCarrito();

  const {
    busqueda,
    onBusquedaChange,
    onBuscar,
    onAbrirFiltros,
    abrirPerfil, // Esto es momentaneo, despues cuandp tengammos lo de perfil cambiamos por lo que convenga
    tipoUser = "Cliente",
    botonRegistrar,
    children
  } = props;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onBuscar?.();
  };

  const handleLogout = async () => {
    try {
      setMenuAbierto(false);
      await apiAuth.cerrarSesion();
    } catch (error) {
      console.error("Error al revocar el token en el servidor:", error);
    } finally {
      localStorage.removeItem("jwtToken");
      navigate("/");
    }
  };
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <button
          onClick={() => navigate("/")}
          className="shrink-0  cursor-pointer hover:scale-120 transition-transform"
        >
          <img
            src={
              tipoUser == "Cliente"
                ? tregoLogo
                : tipoUser == "Restaurante"
                  ? tregoRestaurante
                  : tregoAdmin
            }
            alt="Trego"
            className="h-13 w-13 sm:h-15 sm:w-15 scale-120"
          />
        </button>

        {onBuscar && ( // Para poder reutilizar el header en otro componente ponemos como opcional todo el
          // formulario que no necesitamos en iniciar sesion por ejemplo
          <form
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-1 justify-center"
          >
            <div className="flex h-11 items-center w-130 overflow-hidden rounded-full border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:h-12">
              <button
                type="button"
                onClick={onAbrirFiltros}
                className="flex h-full w-11 shrink-0 items-center justify-center text-gray-700 hover:bg-gray-50"
                aria-label="Aplicar filtros"
                title="Aplicar filtros"
              >
                <IconMenu className="h-5 w-5" />
              </button>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => (onBusquedaChange ? e.target.value : {})}
                placeholder="Buscar Producto"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="flex h-full w-11 shrink-0 items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Buscar"
              >
                <IconSearch className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 ml-auto">
          {onAbrirFiltros && (
            <button
              type="button"
              onClick={abrirCarrito}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-trego-cart shadow-sm sm:h-11 sm:w-11"
              aria-label="Carrito"
            >
              <IconCart className="h-5 w-5 text-white" />
              {cantidadTotal > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white">
                  {cantidadTotal}
                </span>
              )}
            </button>
          )}
          {/**Aca podemos colocar el boton que quieramos, ejemplo el de registrar usuario, etc */}
          {children}

          {abrirPerfil && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-trego-profile shadow-sm sm:h-11 sm:w-11 cursor-pointer transition-transform active:scale-95"
                aria-label="Perfil"
              >
                <IconUser className="h-5 w-5 text-white" />
              </button>

              {/* Capa invisible para cerrar el menú si se hace clic fuera */}
              {menuAbierto && (
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuAbierto(false)}
                />
              )}

              {/* Pequeño menú modal flotante */}
              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-xl z-50 frame-fade-in">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {tipoUser}
                  </div>
                  <hr className="border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={`h-0.5 ${tipoUser == "Cliente" ? "bg-trego-orange" : `${tipoUser == "Restaurante" ? "bg-trego-restaurante" : "bg-trego-admin"}`}`}
      />
    </header>
  );
}
