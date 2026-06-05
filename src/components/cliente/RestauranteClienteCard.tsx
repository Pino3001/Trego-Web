import { Link } from "react-router";
import { IconStar } from "../icons";
import { BadgeAbierto } from "../badges";
import type { DTORestaurante } from "../../data/DTORestaurante.js";

function formatearHorario(restaurante: DTORestaurante): string {
  const fmt = (h?: string | null) =>
    h && h.length >= 5 ? h.slice(0, 5) : null;
  const a = fmt(restaurante.horaApertura);
  const c = fmt(restaurante.horaCierre);
  if (a && c) return `${a} - ${c}`;
  return "—";
}

interface RestauranteClienteCardProps {
  restaurante: DTORestaurante;
}

export default function RestauranteClienteCard({
  restaurante,
}: RestauranteClienteCardProps) {
  const id = restaurante.idRestaurante;
  const zona = restaurante.direccion?.calle ?? "Montevideo";
  const horario = formatearHorario(restaurante);

  if (id == null) return null;

  return (
    <Link
      to={`/cliente/restaurantes/${id}/menu`}
      className="block rounded-[18px] bg-trego-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)]"
    >
      <article className="flex gap-3">
        <img
          src={restaurante.fotoPerfil}
          alt=""
          className="h-14 w-14 shrink-0 self-center rounded-full bg-[#d4d4d9] object-cover"
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <h3 className="truncate text-[15px] font-bold leading-tight text-gray-900">
            {restaurante.nombre}
          </h3>
          <p className="truncate text-[13px] text-gray-600">
            {restaurante.descripcion || restaurante.categoria || "Restaurante"}
          </p>
          <p className="flex items-center gap-2 text-[12px] text-gray-800">
            <span className="font-medium">{zona}</span>
            <span className="flex items-center gap-0.5 font-semibold">
              <IconStar className="h-3.5 w-3.5 text-amber-400" />
              {restaurante.calificacionProm?.toFixed(1) ?? "—"}
            </span>
          </p>
        </div>

        <aside className="flex w-[88px] shrink-0 flex-col items-end justify-between py-0.5">
          <BadgeAbierto abierto={restaurante.abierto ?? true} />
          {restaurante.categoria ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
              {restaurante.categoria}
            </span>
          ) : (
            <span className="h-[26px]" aria-hidden />
          )}
          <span className="text-right text-[11px] leading-tight text-gray-600">
            {horario}
          </span>
        </aside>
      </article>
    </Link>
  );
}
