import { precioConDescuento } from '../../utils/productos'

export default function OfertaCard({ producto }) {
  const { nombre, descripcion, precio, fotoPlato, oferta } = producto
  const descuento = oferta?.descuentoPorcentaje ?? 0
  const precioFinal = precioConDescuento(precio, descuento)

  return (
    <article className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] sm:w-[280px]">
      <div className="relative">
        <img
          src={fotoPlato}
          alt={nombre}
          className="h-[140px] w-full object-cover"
          loading="lazy"
        />
        {descuento > 0 && (
          <span className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-trego-orange text-[11px] font-bold leading-none text-white shadow-md">
            -{descuento}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-gray-900">
          {nombre}
        </h3>
        <p className="mb-3 line-clamp-3 flex-1 text-[12px] leading-relaxed text-gray-500">
          {descripcion}
        </p>
        <p className="flex items-baseline gap-2">
          <span className="text-[14px] text-gray-400 line-through">{precio}$</span>
          <span className="text-[18px] font-bold text-red-600">{precioFinal}$</span>
        </p>
      </div>
    </article>
  )
}
