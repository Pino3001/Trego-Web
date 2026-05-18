import { Link } from 'react-router'
import { IconStar } from './icons'
import { BadgeAbierto, BadgeOfertas } from './badges'
import { formatearHorario } from '../utils/restaurantes'

const cardBase =
  'block rounded-[18px] bg-trego-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)]'

export default function RestaurantCard({
  restaurante,
  modoBusqueda = false,
  enGrid = false,
}) {
  const {
    idUsuario,
    nombre,
    descripcion,
    categoria,
    calificacionProm,
    abierto,
    reparteEnZona,
    tieneOfertas,
    fotoPerfil,
    direccion,
    horarioServicio,
  } = restaurante

  const zona = direccion?.nombre ?? 'Pocitos'
  const horario = formatearHorario(horarioServicio)
  const tipoComida = descripcion || categoria || 'Un tipo de comida'

  const mostrarCerrado = modoBusqueda && !abierto
  const mostrarSinReparto = modoBusqueda && !reparteEnZona

  let badgeEstado
  if (mostrarCerrado) {
    badgeEstado = <BadgeAbierto abierto={false} texto="Cerrado" />
  } else if (mostrarSinReparto) {
    badgeEstado = <BadgeAbierto abierto={false} texto="No reparte en la zona" />
  } else {
    badgeEstado = <BadgeAbierto abierto={abierto} />
  }

  const widthClass = enGrid ? 'w-full' : 'w-[310px] shrink-0 sm:w-[330px]'

  return (
    <Link to={`/restaurante/${idUsuario}`} className={`${cardBase} ${widthClass}`}>
      <article className="flex gap-3">
        <img
          src={fotoPerfil}
          alt=""
          className="h-14 w-14 shrink-0 self-center rounded-full bg-[#d4d4d9] object-cover"
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <h3 className="truncate text-[15px] font-bold leading-tight text-gray-900">
            {nombre}
          </h3>
          <p className="truncate text-[13px] text-gray-600">{tipoComida}</p>
          <p className="flex items-center gap-2 text-[12px] text-gray-800">
            <span className="font-medium">{zona}</span>
            <span className="flex items-center gap-0.5 font-semibold">
              <IconStar className="h-3.5 w-3.5 text-amber-400" />
              {calificacionProm?.toFixed(1) ?? '—'}
            </span>
          </p>
        </div>

        <aside className="flex w-[88px] shrink-0 flex-col items-end justify-between py-0.5">
          {badgeEstado}
          {tieneOfertas ? <BadgeOfertas /> : <span className="h-[26px]" aria-hidden />}
          <span className="text-right text-[11px] leading-tight text-gray-600">{horario}</span>
        </aside>
      </article>
    </Link>
  )
}
