import { IconClock, IconLocation } from '../icons'
import { formatearHorario } from '../../utils/restaurantes'

export default function RestauranteBanner({ restaurante }) {
  const {
    nombre,
    calificacionProm,
    cantidadResenas,
    direccion,
    horarioServicio,
    abierto,
  } = restaurante

  const ubicacion = direccion?.nombre
    ? `${direccion.nombre} - ${direccion.ciudad ?? 'Montevideo'}`
    : 'Montevideo'

  const horario = formatearHorario(horarioServicio)

  return (
    <section className="overflow-hidden rounded-2xl shadow-sm">
      <header className="flex min-h-[100px] items-center justify-center bg-trego-brown px-6 py-8 sm:min-h-[110px]">
        <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-[28px]">
          {nombre}
        </h1>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 bg-trego-beige px-4 py-3 text-[13px] text-gray-800 sm:gap-x-10 sm:px-6">
        <span className="font-semibold text-gray-900">
          {calificacionProm?.toFixed(1)} ({cantidadResenas ?? 0} Reseñas)
        </span>
        <span className="flex items-center gap-1.5 text-gray-700">
          <IconLocation className="h-4 w-4 shrink-0 text-gray-600" />
          {ubicacion}
        </span>
        <span className="flex items-center gap-1.5 text-gray-700">
          <IconClock className="h-4 w-4 shrink-0 text-gray-600" />
          {horario}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-gray-800">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          {abierto ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
    </section>
  )
}
