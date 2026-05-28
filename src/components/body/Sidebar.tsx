import TextoDivider from "../TextoDivider.js";

interface SidebarSection {
  section: string;
  items: string[];
}

interface SidebarProps {
  habilitado: boolean;
  itemActivo?: string;
}

const SECCIONES: SidebarSection[] = [
  {
    section: "Pedidos",
    items: [
      "En espera de confirmación",
      "En preparacion (Confirmados)",
      "En camino",
      "Entregados",
      "Cancelados",
    ],
  },
  {
    section: "Reclamos",
    items: ["Ver Reclamos"],
  },
  {
    section: "Gestión",
    items: ["Alta Producto", "Modificar Producto"],
  },
  {
    section: "Estadísticas",
    items: ["Platos mas solicitados", "Pedidos por fecha", "Monto promedio"],
  },
];

export default function Sidebar({ habilitado, itemActivo }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-trego-restaurante bg-white pt-8 px-4 gap-6">
      {!habilitado ? (
        <div className="flex flex-col gap-3">
          <TextoDivider
            texto="Solicitudes"
            classNameTexto="font-bold text-trego-restaurante"
            classNameDivider="bg-trego-restaurante w-full"
          />
          <button className="w-full text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 bg-trego-restaurante text-white font-semibold shadow-sm">
            Solicitar Alta
          </button>
        </div>
      ) : (
        SECCIONES.map(({ section, items }) => (
          <div key={section} className="flex flex-col gap-1">
            <TextoDivider
              texto={section}
              classNameTexto="font-bold text-trego-restaurante"
              classNameDivider="bg-trego-restaurante"
            />
            <div className="flex flex-col gap-0.5 mt-1">
              {items.map((item) => {
                const activo = item === itemActivo;
                return (
                  <button
                    key={item}
                    className={`
                      w-full text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150
                      ${activo
                        ? "bg-trego-restaurante text-white font-semibold shadow-sm"
                        : "text-gray-600 hover:bg-green-50 hover:text-trego-restaurante"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </aside>
  );
}