import { Edit2, MapPin, Trash2 } from "lucide-react";
import type { DTODireccion } from "../../data/DTODireccion.js";
import { formatAddressLine } from "../../utils/funcionesFormateo.js";

export interface DireccionCardProps {
  direccion: any;
  onEdit: () => void;
  onDelete?: () => void;
}

export default function DireccionCard({
  direccion,
  onEdit,
  onDelete,
}: DireccionCardProps) {
  const addressText = formatAddressLine(direccion);
  const tagText = direccion.tag || "Sin etiqueta";

  return (
    <div
      className="group relative flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white
                 hover:border-trego-orange/40 hover:shadow-sm transition-all duration-200 cursor-default"
    >
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-trego-orange
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />

      <div
        className="mt-1 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center
                   shrink-0 group-hover:bg-orange-50 border border-slate-100 transition-colors"
      >
        <MapPin
          size={18}
          className="text-slate-400 group-hover:text-trego-orange transition-colors"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
        <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide truncate">
          {tagText}
        </h4>

        <p className="text-slate-500 text-sm mt-0.5 leading-relaxed truncate">
          {addressText}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 self-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Editar"
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <Edit2 size={16} />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
