import { CATEGORIAS_MENU_CLIENTE } from "../../utils/menuCliente.js";

const ORDEN_OPCIONES = [
  { id: "", label: "Sin orden" },
  { id: "asc", label: "Menor precio" },
  { id: "desc", label: "Mayor precio" },
] as const;

interface MenuFiltrosClienteProps {
  categoria: string;
  onCategoriaChange: (value: string) => void;
  ordenPrecio: "" | "asc" | "desc";
  onOrdenChange: (value: "" | "asc" | "desc") => void;
  soloOfertas: boolean;
  onSoloOfertasChange: (value: boolean) => void;
  busquedaPlato: string;
  onBusquedaPlatoChange: (value: string) => void;
}

export default function MenuFiltrosCliente({
  categoria,
  onCategoriaChange,
  ordenPrecio,
  onOrdenChange,
  soloOfertas,
  onSoloOfertasChange,
  busquedaPlato,
  onBusquedaPlatoChange,
}: MenuFiltrosClienteProps) {
  return (
    <aside className="w-full shrink-0 rounded-2xl bg-trego-sidebar p-4 shadow-sm lg:w-[220px] lg:p-5">
      <section className="mb-5">
        <label
          htmlFor="buscar-plato"
          className="mb-2 block text-[15px] font-bold text-gray-900"
        >
          Buscar plato
        </label>
        <input
          id="buscar-plato"
          type="search"
          value={busquedaPlato}
          onChange={(e) => onBusquedaPlatoChange(e.target.value)}
          placeholder="Nombre del plato…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </section>

      <section className="mb-5">
        <label className="mb-2 flex cursor-pointer items-center gap-2 text-[14px] font-medium text-gray-800">
          <input
            type="checkbox"
            checked={soloOfertas}
            onChange={(e) => onSoloOfertasChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-trego-orange focus:ring-trego-orange"
          />
          Solo ofertas
        </label>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-gray-900">Categorías</h2>
        <ul className="max-h-48 space-y-0.5 overflow-y-auto">
          {CATEGORIAS_MENU_CLIENTE.map(({ id, label }) => (
            <li key={id || "todas"}>
              <button
                type="button"
                onClick={() => onCategoriaChange(id)}
                className={`w-full py-1.5 text-left text-[14px] transition ${
                  categoria === id
                    ? "font-bold text-gray-900"
                    : "font-normal text-gray-600 hover:text-trego-orange"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-bold text-gray-900">Ordenar</h2>
        <select
          value={ordenPrecio}
          onChange={(e) =>
            onOrdenChange(e.target.value as "" | "asc" | "desc")
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {ORDEN_OPCIONES.map(({ id, label }) => (
            <option key={id || "ninguno"} value={id}>
              {label}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}
