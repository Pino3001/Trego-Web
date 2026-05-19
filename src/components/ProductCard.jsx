import { Link } from 'react-router'
import { IconStar } from './icons'
import { BadgeAbierto, BadgeOfertas } from './badges'
import { formatearHorario } from '../utils/restaurantes'

const cardBase =
  'block w-[310px] shrink-0 rounded-[18px] bg-trego-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:w-[330px]'

export default function ProductCard({ plato }) {
  const {
    nombre,
    precio,
    restauranteNombre,
    restauranteId,
    zona,
    calificacionProm,
    horarioServicio,
    abierto,
    tieneOfertas,
    fotoPlato,
  } = plato

  const horario = formatearHorario(horarioServicio)

  return (
    <Link to={`/restaurante/${restauranteId}`} className={cardBase}>
      <article className="flex gap-3">
        <img
          src={fotoPlato}
          alt=""
          className="h-14 w-14 shrink-0 self-center rounded-full bg-[#d4d4d9] object-cover"
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <div className="flex items-start justify-between gap-1">
            <p className="line-clamp-2 text-[14px] font-bold leading-snug text-gray-900">
              {nombre}
            </p>
            <span className="shrink-0 text-[14px] font-bold text-red-600">{precio}$</span>
          </div>
          <p className="truncate text-[13px] text-gray-600">{restauranteNombre}</p>
          <p className="flex items-center gap-2 text-[12px] text-gray-800">
            <span className="font-medium">{zona}</span>
            <span className="flex items-center gap-0.5 font-semibold">
              <IconStar className="h-3.5 w-3.5 text-amber-400" />
              {calificacionProm?.toFixed(1)}
            </span>
          </p>
        </div>

        <aside className="flex w-[88px] shrink-0 flex-col items-end justify-between py-0.5">
          {tieneOfertas ? <BadgeOfertas /> : <span className="h-[26px]" aria-hidden />}
          <BadgeAbierto abierto={abierto} />
          <span className="text-right text-[11px] leading-tight text-gray-600">{horario}</span>
        </aside>
      </article>
    </Link>
  )
}
