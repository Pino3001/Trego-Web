import { obtenerConteoPorNombre, type ProductoIncluido } from "../../data/DTOCombo.js";

export function DetalleCombo({ productos, className }: { productos: ProductoIncluido[], className?: string }) {
  const conteo = obtenerConteoPorNombre(productos);
  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {Object.entries(conteo).map(([nombre, cantidad]) => (
        <span
          key={nombre}
          className={`rounded-lg bg-trego-restaurante/15 px-2 py-1 text-xs font-semibold text-slate-700 ${className}`}
        >
          {cantidad > 1 ? `${cantidad}× ` : ""}
          {nombre}
        </span>
      ))}
    </div>
  );
}