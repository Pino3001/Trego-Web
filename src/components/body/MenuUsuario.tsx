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
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-base font-medium text-blue-600 flex-shrink-0 select-none">
            {getInitials(nombre)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-[15px] text-gray-900 mb-0.5">
            ¡Hola, {nombre}!
          </p>
          <p className="text-xs text-gray-400 mb-1.5 truncate">{email}</p>
          <span className="text-[11px] bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-md">
            {tipoUser}
          </span>
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
            <Store size={18} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                Restaurante
              </p>
              <p
                className={`text-xs leading-tight mt-0.5 transition-colors ${
                  restauranteAbierto ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {restauranteAbierto ? "Abierto" : "Cerrado"}
              </p>
            </div>

            {/* Switch */}
            <div
              className={`relative w-9 h-[22px] rounded-full flex-shrink-0 transition-colors duration-200 ${
                restauranteAbierto ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                  restauranteAbierto ? "left-[18px]" : "left-0.5"
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
          <User size={18} className="text-gray-400 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-gray-800">
            Ver perfil
          </span>
          <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        </button>

        <hr className="border-gray-100 my-1 mx-1" />

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={onCerrarSesion}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} className="text-red-500 flex-shrink-0" />
          <span className="text-sm font-medium text-red-600">
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  );
}
