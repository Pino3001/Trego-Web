/* import { NavLink, useMatch } from "react-router";
import TextoDivider from "../TextoDivider.js";

interface NavItem {
  label: string;
  path: string;
  end?: boolean;
  badge?: number;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface DisabledItem {
  label: string;
}

interface DisabledSection {
  section: string;
  items: DisabledItem[];
}

interface AdminSidebarProps {
  pendientesCount?: number;
}

const SECCIONES: NavSection[] = [
  {
    section: "Restaurantes",
    items: [
      { label: "Todos los registrados", path: "/admin/restaurantes/todos", end: true },
      { label: "Solicitudes pendientes", path: "/admin/restaurantes", end: true },
    ],
  },
  {
    section: "Clientes",
    items: [
      { label: "Todos los clientes", path: "/admin/clientes", end: true },
    ],
  },
];

const SECCIONES_FUTURAS: DisabledSection[] = [
  {
    section: "Sistema",
    items: [{ label: "Estadísticas" }],
  },
];

function AdminNavLink({
  item,
  badge,
}: {
  item: NavItem;
  badge?: number;
}) {
  const match = useMatch({ path: item.path, end: item.end ?? false });
  const isActive = !!match;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={`
        w-full text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150
        flex items-center justify-between gap-2
        ${
          isActive
            ? "bg-trego-admin text-white font-semibold shadow-sm"
            : "text-gray-600 hover:bg-blue-50 hover:text-trego-admin"
        }
      `}
    >
      <span>{item.label}</span>
      {badge != null && badge > 0 && (
        <span
          className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${
            isActive ? "bg-white/20 text-white" : "bg-trego-admin text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AdminSidebar({ pendientesCount }: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-trego-admin bg-white pt-8 px-4 gap-6">
      {SECCIONES.map(({ section, items }) => (
        <div key={section} className="flex flex-col gap-1">
          <TextoDivider
            texto={section}
            classNameTexto="font-bold text-trego-admin"
            classNameDivider="bg-trego-admin"
            height="h-0"
          />
          <div className="flex flex-col gap-0.5 mt-2">
            {items.map((item) => (
              <AdminNavLink
                key={item.label}
                item={item}
                badge={
                  item.path === "/admin/restaurantes"
                    ? pendientesCount
                    : item.badge
                }
              />
            ))}
          </div>
        </div>
      ))}

      {SECCIONES_FUTURAS.map(({ section, items }) => (
        <div key={section} className="flex flex-col gap-1">
          <TextoDivider
            texto={section}
            classNameTexto="font-bold text-trego-admin"
            classNameDivider="bg-trego-admin"
            height="h-0"
          />
          <div className="flex flex-col gap-0.5 mt-2">
            {items.map((item) => (
              <span
                key={item.label}
                className="w-full text-left text-sm px-4 py-2.5 rounded-xl text-gray-400 cursor-not-allowed select-none"
                aria-disabled="true"
                title="Próximamente"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
 */