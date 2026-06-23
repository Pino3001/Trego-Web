import { Link } from 'react-router'
import { IconStar } from './icons'
import { BadgeOfertas } from './badges'
import { obtenerPrecios } from '../utils/productos.js'

const cardBase =
  'block rounded-[18px] bg-trego-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)]'

function formatearPrecio(n) {
  return `$ ${Number(n).toLocaleString('es-UY', { maximumFractionDigits: 0 })}`
}

export default function OfertaRestauranteCard({ grupo, enGrid = false }) {
  const id = grupo.idRestaurante ?? grupo.idUsuario
  const productoDestacado = grupo.productos?.[0]
  const { conDescuento, original, tieneOferta } = obtenerPrecios(productoDestacado ?? {})
  const widthClass = enGrid ? 'w-full' : 'w-[310px] shrink-0 sm:w-[330px]'
  const imagen =
    productoDestacado?.fotoPlato ??
    productoDestacado?.urlImagen ??
    grupo.fotoPerfil

  const extraOfertas =
    (grupo.productos?.length ?? 0) > 1
      ? ` +${grupo.productos.length - 1} más`
      : ''

  return (
    <Link to={`/restaurante/${id}`} className={`${cardBase} ${widthClass}`}>
      <article className="flex gap-3">
        <img
          src={imagen}
          alt=""
          className="h-14 w-14 shrink-0 self-center rounded-full bg-[#d4d4d9] object-cover"
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <h3 className="truncate text-[15px] font-bold leading-tight text-gray-900">
            {grupo.nombre}
          </h3>
          <p className="truncate text-[13px] text-gray-600">
            {productoDestacado?.nombre ?? 'Oferta especial'}
            {extraOfertas}
          </p>
          <p className="flex items-center gap-2 text-[12px] text-gray-800">
            <span className="flex items-center gap-0.5 font-semibold">
              <IconStar className="h-3.5 w-3.5 text-amber-400" />
              {(grupo.calificacionProm ?? 0).toFixed(1)}
            </span>
            {tieneOferta ? (
              <span className="font-bold text-trego-orange">
                {formatearPrecio(conDescuento)}
                <span className="ml-1 font-normal text-gray-400 line-through">
                  {formatearPrecio(original)}
                </span>
              </span>
            ) : (
              <span className="font-semibold">{formatearPrecio(conDescuento)}</span>
            )}
          </p>
        </div>

        <aside className="flex w-[88px] shrink-0 flex-col items-end justify-between py-0.5">
          <BadgeOfertas />
          <span className="text-right text-[11px] leading-tight text-gray-600">
            {grupo.productos?.length ?? 0} oferta{(grupo.productos?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </aside>
      </article>
    </Link>
  )
}
