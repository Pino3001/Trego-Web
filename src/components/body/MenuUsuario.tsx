import { ChevronRight, LogOut, Store, User } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MenuUsuarioProps {
  nombre: string;
  email: string;
  tipoUser: string;
  avatarUrl?: string;
  restauranteAbierto: boolean;
  onVerPerfil: () => void;
  onCerrarSesion: () => void;
  onToggleRestaurante: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MenuUsuario({
  nombre,
  email,
  tipoUser,
  avatarUrl,
  restauranteAbierto,
  onVerPerfil,
  onCerrarSesion,
  onToggleRestaurante,
}: MenuUsuarioProps) {
  return (
    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl z-50 frame-fade-in overflow-hidden">
      {/* ── Encabezado con avatar ── */}
      <div className="flex items-center gap-3.5 p-4 pb-3.5 border-b border-gray-100">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={nombre}
            className="w-22 h-22 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-22 h-22 rounded-full bg-blue-50 flex items-center justify-center text-base font-medium text-blue-600 flex-shrink-0 select-none">
            {getInitials(nombre)}
          </div>
        )}
        <div className="min-w-0 ">
          <p className="font-medium text-[15px] text-gray-900 mb-0.5">
            ¡Hola, {nombre}!
          </p>
          <p className="text-xs text-gray-400 mb-1.5 truncate">{email}</p>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="p-1.5">
        {/* Toggle restaurante */}
        {tipoUser === "Restaurante" ? (
          <div
            role="button"
            tabIndex={0}
            onClick={onToggleRestaurante}
            onKeyDown={(e) => e.key === "Enter" && onToggleRestaurante()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Store
              size={32}
              className={`shrink-0 ${
                restauranteAbierto ? "text-trego-restaurante" : "text-gray-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium leading-tight ${
                  restauranteAbierto
                    ? "text-trego-restaurante"
                    : "text-gray-800"
                }
                `}
              >
                Restaurante
              </p>
              <p
                className={`text-sm leading-tight mt-0.5 transition-colors ${
                  restauranteAbierto ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {restauranteAbierto ? "Abierto" : "Cerrado"}
              </p>
            </div>

            {/* Switch */}
            <div
              className={`relative w-12 h-7 rounded-full shrink-0 transition-colors duration-200 ${
                restauranteAbierto ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  restauranteAbierto ? "left-6" : "left-1"
                }`}
              />
            </div>
          </div>
        ) : undefined}

        {/* Ver perfil */}
        <button
          type="button"
          onClick={onVerPerfil}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 transition-colors"
        >
          <User size={32} className="text-gray-400 shrink-0" />
          <span className="flex-1 text-sm font-medium text-gray-800">
            Ver perfil
          </span>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </button>

        <hr className="border-gray-100 my-1 mx-1" />

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={onCerrarSesion}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 transition-colors"
        >
          <LogOut size={32} className="text-red-500 shrink-0" />
          <span className="text-sm font-medium text-red-600">
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  );
}
