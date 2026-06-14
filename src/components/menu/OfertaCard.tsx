import type { DTOProducto } from "../../data/DTOProducto.js";
import { obtenerPrecios, precioConDescuento } from "../../utils/productos.js";

interface OfertaCardProps {
  producto?: DTOProducto | undefined;
  onClick?: () => void;
}

export default function OfertaCard({ producto, onClick }: OfertaCardProps) {
  if (!producto) return null;

  const { nombre, oferta } = producto;
  const descuento = oferta?.descuento ?? 0;
  const { tieneOferta, conDescuento, original } = obtenerPrecios(producto);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-trego-orange sm:w-60"
    >
      {/* Imagen */}
      <div className="relative overflow-hidden">
        <img
          src={oferta?.urlImagen || "/placeholder.png"}
          alt={nombre ?? "Oferta"}
          className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {tieneOferta && (
          <span className="absolute right-2 top-2 rounded-full bg-trego-orange px-2 py-1 text-center text-[10px] font-bold text-white shadow-sm">
            -{descuento}%
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-trego-orange">
          {nombre}
        </h3>
        <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-gray-400">
          {oferta?.descripcion}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[14px] text-gray-600 ">
            Precio:
          </span>
          <span className="text-[12px] text-gray-300 line-through">
            {original ?? 0}$
          </span>
          <span className="text-[16px] font-bold text-trego-orange">
            {conDescuento}$
          </span>
        </div>
      </div>
    </button>
  );
}
