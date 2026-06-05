import { IconPlus } from "../icons";
import type { DTOProducto } from "../../data/DTOProducto.js";
import {
  precioFinalProducto,
  productoTieneOferta,
} from "../../utils/menuCliente.js";

interface ProductoClienteCardProps {
  producto: DTOProducto;
  onAgregar?: (producto: DTOProducto) => void;
}

export default function ProductoClienteCard({
  producto,
  onAgregar,
}: ProductoClienteCardProps) {
  const tieneOferta = productoTieneOferta(producto);
  const descuento = producto.oferta?.descuento ?? 0;
  const precioFinal = precioFinalProducto(producto);
  const disponible = producto.disponible !== false;

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-[#ececec] p-3 sm:p-4">
      <img
        src={producto.urlImagen}
        alt={producto.nombre}
        className="h-[72px] w-[72px] shrink-0 rounded-xl bg-gray-300 object-cover sm:h-20 sm:w-20"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-bold text-gray-900">
            {producto.nombre}
          </h3>
          {tieneOferta && descuento > 0 && (
            <span className="rounded-full bg-trego-orange px-2 py-0.5 text-[11px] font-bold text-white">
              -{descuento}%
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] text-gray-600">
          {producto.descripcion}
        </p>
        <p className="mt-2 flex items-baseline gap-2">
          {tieneOferta ? (
            <>
              <span className="text-[14px] text-gray-400 line-through">
                {producto.precio}$
              </span>
              <span className="text-[16px] font-bold text-red-600">
                {precioFinal}$
              </span>
            </>
          ) : (
            <span className="text-[16px] font-bold text-trego-brown">
              {producto.precio}$
            </span>
          )}
        </p>
      </div>
      <button
        type="button"
        disabled={!disponible}
        onClick={() => onAgregar?.(producto)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-trego-add text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Agregar ${producto.nombre}`}
      >
        <IconPlus className="h-5 w-5" />
      </button>
    </article>
  );
}
