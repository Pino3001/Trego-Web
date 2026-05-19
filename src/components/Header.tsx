import React from "react";
import tregoLogo from "../assets/tregoicon.png";
import { IconCart, IconMenu, IconSearch, IconUser } from "./icons.jsx";
import { useNavigate } from "react-router";

interface HeaderProps {
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  onBuscar?: () => void;
  onAbrirFiltros?: () => void;
  abrirPerfil?: boolean;
}

export default function Header(props: HeaderProps) {
  const navigate = useNavigate();

  const {
    busqueda,
    onBusquedaChange,
    onBuscar,
    onAbrirFiltros,
    abrirPerfil, // Esto es momentaneo, despues cuandp tengammos lo de perfil cambiamos por lo que convenga
  } = props;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onBuscar?.();
  };

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <button onClick={() => navigate("/")} className="shrink-0  cursor-pointer hover:scale-105 transition-transform">
          <img
            src={tregoLogo}
            alt="Trego"
            className="h-12 w-12 sm:h-14 sm:w-14"
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {onAbrirFiltros && (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-trego-cart shadow-sm sm:h-11 sm:w-11"
              aria-label="Carrito"
            >
              <IconCart className="h-5 w-5 text-white" />
            </button>
          )}
          {abrirPerfil && (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-trego-profile shadow-sm sm:h-11 sm:w-11"
              aria-label="Perfil"
            >
              <IconUser className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
      <div className="h-0.5 bg-trego-orange" />
    </header>
  );
}
