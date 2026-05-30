import { IconPlus } from '../icons'
import { precioConDescuento } from '../../utils/productos'

export default function ProductoMenuCard({ producto, onAgregar }) {
  const { nombre, descripcion, precio, fotoPlato, ofertaActiva, oferta } = producto
  const descuento = ofertaActiva && oferta ? (oferta.descuentoPorcentaje ?? 0) : 0
  const precioFinal = precioConDescuento(precio, descuento)
  const tieneOferta = descuento > 0

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-[#ececec] p-3 sm:p-4">
      <img
        src={fotoPlato}
        alt={nombre}
        className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover bg-gray-300 sm:h-20 sm:w-20"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold text-gray-900">{nombre}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] text-gray-600">{descripcion}</p>
        <p className="mt-2 flex items-baseline gap-2">
          {tieneOferta ? (
            <>
              <span className="text-[14px] text-gray-400 line-through">{precio}$</span>
              <span className="text-[16px] font-bold text-red-600">{precioFinal}$</span>
            </>
          ) : (
            <span className="text-[16px] font-bold text-trego-brown">{precio}$</span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onAgregar?.(producto)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-trego-add text-white shadow-md transition hover:opacity-90"
        aria-label={`Agregar ${nombre}`}
      >
        <IconPlus className="h-5 w-5" />
      </button>
    </article>
  )
}
