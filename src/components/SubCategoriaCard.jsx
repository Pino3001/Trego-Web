import { Link } from "react-router";
import { obtenerThumbnail } from "../pages/restaurantes/utilitis/cloudinaryUtilitis.js";

const cardBase =
  "block shrink-0 overflow-hidden rounded-[18px] bg-trego-card text-left shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_3px_12px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-trego-orange";

export default function SubCategoriaCard({ subcategoria, enGrid = false }) {
  const sizeClass = enGrid
    ? "w-full max-w-[220px] mx-auto"
    : "w-[calc((100%-0.75rem)/2)] min-w-[136px] max-w-[172px] shrink-0 snap-start sm:w-[172px]";

  const imgClass = enGrid
    ? "relative h-28 sm:h-32 shrink-0 bg-[#d4d4d9]"
    : "relative h-[44%] min-h-[72px] shrink-0 bg-[#d4d4d9]";

  const imagen = subcategoria.urlImagen ?? null;
  const iniciales = subcategoria.nombre?.slice(0, 2)?.toUpperCase() ?? "—";

  return (
    <Link
      to={`/subcategoria/${subcategoria.idSubCategoria}`}
      state={{ subcategoria }}
      className={`${cardBase} ${sizeClass} flex flex-col`}
    >
      <div className={imgClass}>
        {imagen ? (
          <img
            src={obtenerThumbnail(imagen)}
            alt={subcategoria.nombre ?? "Subcategoría"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-500"
            aria-hidden
          >
            {iniciales}
          </div>
        )}
      </div>

      <article className="flex flex-1 flex-col justify-center gap-0.5 p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900">
          {subcategoria.nombre ?? "Subcategoría"}
        </h3>
        {subcategoria.categoria ? (
          <p className="truncate text-[11px] text-gray-600">
            {subcategoria.categoria}
          </p>
        ) : null}
      </article>
    </Link>
  );
}
