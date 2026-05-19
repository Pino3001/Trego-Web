import { useNavigate } from "react-router";
import Header from "../components/Header.js";

type Rol = {
  id: string;
  label: string;
  descripcion: string;
  ruta: string;
  icon: React.ReactNode;
  acento: string;
  bg: string;
  border: string;
  iconBg: string;
};

const roles: Rol[] = [
  {
    id: "cliente",
    label: "Cliente",
    descripcion: "Explorá restaurantes y hacé tus pedidos favoritos.",
    ruta: "/login/cliente",
    acento: "text-orange-500",
    bg: "hover:bg-orange-50",
    border: "hover:border-orange-400",
    iconBg: "bg-orange-100 group-hover:bg-orange-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-orange-500">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "restaurante",
    label: "Restaurante",
    descripcion: "Gestioná tu menú, pedidos y disponibilidad en tiempo real.",
    ruta: "/login/restaurante",
    acento: "text-emerald-600",
    bg: "hover:bg-emerald-50",
    border: "hover:border-emerald-400",
    iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-600">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
  {
    id: "administrador",
    label: "Administrador",
    descripcion: "Accedé al panel de control de la plataforma.",
    ruta: "/login/admin",
    acento: "text-sky-600",
    bg: "hover:bg-sky-50",
    border: "hover:border-sky-400",
    iconBg: "bg-sky-100 group-hover:bg-sky-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-sky-600">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M19 8h2M3 8h2M12 3V1M12 15v-2" />
      </svg>
    ),
  },
];

export default function SeleccionarRol() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="mt-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl flex flex-col items-center gap-10">

          {/* Encabezado */}
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xl font-semibold tracking-widest text-orange-500 uppercase">
              Bienvenido a Trego
            </span>
            <h1 className="text-3xl font-bold text-gray-800">
              ¿Cómo querés ingresar?
            </h1>
            <p className="text-sm text-gray-500">
              Seleccioná tu tipo de usuario para continuar
            </p>
          </div>

          {/* Tarjetas */}
          <div className="flex flex-col gap-4 w-full">
            {roles.map((rol) => (
              <button
                key={rol.id}
                onClick={() => navigate(rol.ruta)}
                className={`
                  group flex items-center gap-5 w-full text-left
                  bg-white rounded-2xl border-2 border-gray-200
                  px-6 py-5 transition-all duration-200
                  shadow-sm hover:shadow-md
                  ${rol.bg} ${rol.border}
                  active:scale-[0.99]
                `}
              >
                {/* Ícono */}
                <div className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-200 ${rol.iconBg}`}>
                  {rol.icon}
                </div>

                {/* Texto */}
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className={`text-lg font-bold ${rol.acento}`}>
                    {rol.label}
                  </span>
                  <span className="text-sm text-gray-500 leading-snug">
                    {rol.descripcion}
                  </span>
                </div>

                {/* Flecha */}
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors duration-200"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Trego — Lo pedís, Terego
          </p>

        </div>
      </main>
    </>
  );
}
