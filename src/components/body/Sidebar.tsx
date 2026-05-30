import { NavLink } from "react-router";
import TextoDivider from "../../components/TextoDivider.js";

interface SidebarItem {
  label: string;
  path: string;
}

interface SidebarSection {
  section: string;
  items: SidebarItem[];
}

interface SidebarProps {
  habilitado: boolean;
}

const SECCIONES: SidebarSection[] = [
  {
    section: "Pedidos",
    items: [
      { label: "En espera de confirmación", path: "/ListarPedidosSinConfirmar" },
      { label: "En preparacion (Confirmados)", path: "/restaurantes/pedidos-preparacion" },
      { label: "En camino", path: "/restaurantes/pedidos-en-camino" },
      { label: "Entregados", path: "/restaurantes/pedidos-entregados" },
      { label: "Cancelados", path: "/restaurantes/pedidos-cancelados" },
    ],
  },
  {
    section: "Reclamos",
    items: [
      { label: "Ver Reclamos", path: "/restaurantes/reclamos" }
    ],
  },
  {
    section: "Gestión",
    items: [
      { label: "Alta Producto", path: "/restaurantes/altaProducto" },
      { label: "Modificar Producto", path: "/restaurantes/modificarProducto" },
    ],
  },
  {
    section: "Estadísticas",
    items: [
      { label: "Platos mas solicitados", path: "/restaurantes/estadisticas/platos" },
      { label: "Pedidos por fecha", path: "/restaurantes/estadisticas/fechas" },
      { label: "Monto promedio", path: "/restaurantes/estadisticas/monto" },
    ],
  },
];

// Ya no necesitamos el prop 'itemActivo', se calcula solo por URL
export default function Sidebar({ habilitado }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-trego-restaurante bg-white pt-8 px-4 gap-6">
      
      {/* CASO: No habilitado (Solicitud de Alta) */}
      {!habilitado ? (
        <div className="flex flex-col gap-3">
          <TextoDivider
            texto="Solicitudes"
            classNameTexto="font-bold text-trego-restaurante"
            classNameDivider="bg-trego-restaurante w-full"
          />
          <NavLink 
            to="/restaurantes/solicitarAlta"
            className={({ isActive }) => `
              w-full text-center text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 block font-semibold
              ${isActive 
                ? "bg-trego-restaurante text-white shadow-sm" 
                : "text-gray-600 hover:bg-green-50 hover:text-trego-restaurante"
              }
            `}
          >
            Solicitar Alta
          </NavLink>
        </div>
      ) : (
        
        /* CASO: Habilitado (Menú Completo) */
        SECCIONES.map(({ section, items }) => (
          <div key={section} className="flex flex-col gap-1">
            <TextoDivider
              texto={section}
              classNameTexto="font-bold text-trego-restaurante"
              classNameDivider="bg-trego-restaurante"
              height="h-0"
            />
            <div className="flex flex-col gap-0.5 mt-2">
              {items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  // NavLink nos permite pasarle una función a className que recibe 'isActive'
                  className={({ isActive }) => `
                    w-full text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 block
                    ${isActive
                      ? "bg-trego-restaurante text-white font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-green-50 hover:text-trego-restaurante"
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))
      )}
    </aside>
  );
}