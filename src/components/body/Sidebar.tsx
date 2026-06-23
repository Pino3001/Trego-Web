import { NavLink } from "react-router";
import TextoDivider from "../../components/TextoDivider.js";
import type { SidebarSection } from "./utilities/DataSidebar.js";

interface SidebarProps {
  secciones: SidebarSection[];
  tipoUser: "Restaurante" | "Administrador";
}
// Ya no necesitamos el prop 'itemActivo', se calcula solo por URL
export default function Sidebar({
  secciones,
  tipoUser = "Restaurante",
}: SidebarProps) {
  const colorClass =
    tipoUser === "Administrador" ? "trego-admin" : "trego-restaurante";

  return (
    <aside
      className={`hidden md:flex flex-col w-64 shrink-0 min-h-0 h-full overflow-y-auto border-r border-${colorClass} bg-white pt-8 px-4 pb-6 gap-6`}
    >
      {secciones.map(({ section, items }) => (
        <div key={section} className="flex flex-col gap-1">
          <TextoDivider
            texto={section}
            classNameTexto={`font-bold text-${colorClass}`}
            classNameDivider={`bg-${colorClass}`}
          />
          <div className="flex flex-col gap-0.5 mt-2">
            {items.map((item) => {
              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="w-full text-left text-sm px-4 py-2.5 rounded-xl text-gray-400 cursor-not-allowed select-none"
                    title="Próximamente"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.path!}
                  end={item.end ?? false}
                  className={({ isActive }) => `
                    w-full text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150
                    flex items-center justify-between gap-2
                    ${
                      isActive
                        ? `bg-${colorClass} text-white font-semibold shadow-sm`
                        : `text-gray-600 hover:bg-green-50 hover:text-${colorClass}`
                    }
                  `}
                >
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${
                        item.disabled
                          ? "bg-white/20 text-white"
                          : `bg-${colorClass} text-white`
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
