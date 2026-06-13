import { useState } from "react";
import { X, Save, Loader2, LocateFixed } from "lucide-react";
import type { DTODireccion } from "../../data/DTODireccion.js";
import FormInput from "./FormImput.js";
import DireccionAutocomplete from "../DireccionAutocomplete.js";
import { autocompletarDesdeGPS } from "../../pages/restaurantes/utilitis/geoapifyUtilitis.js";

export type DireccionFormMode = "edit" | "new";

interface DireccionFormProps {
  draft: DTODireccion;
  onChange: (nuevoDraft: DTODireccion) => void;
  onSave: () => void;
  onCancel: () => void;
  mode: DireccionFormMode;
  direcciones?: DTODireccion[];
  originalTag?: string;
}

export default function DireccionForm({
  draft,
  onChange,
  onSave,
  onCancel,
  mode,
  direcciones = [],
  originalTag = "",
}: DireccionFormProps) {
  // ── Estados de Error ─────────────────────────────────────────────────
  const [errorTag, setErrorTag] = useState<string | null>(null);
  const [errorCalle, setErrorCalle] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const field = <K extends keyof DTODireccion>(key: K) => ({
    value: draft[key] ?? (key === "latitud" || key === "longitud" ? 0 : ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;
      if (key === "latitud" || key === "longitud") {
        value = value === "" ? 0 : Number(value);
      }

      if (key === "tag" && errorTag) setErrorTag(null);

      onChange({ ...draft, [key]: value });
    },
  });

  // ── Validación estricta antes de guardar ─────────────────────────────
  const handleValidarYGuardar = () => {
    // Limpiamos errores previos
    setErrorTag(null);
    setErrorCalle(null);

    const tagIngresado = draft.tag?.trim().toLowerCase() || "";
    const calleIngresada = draft.calle?.trim() || "";

    // 1. Validar Tag Obligatorio
    if (!tagIngresado) {
      setErrorTag("La etiqueta es obligatoria.");
      return;
    }

    // 2. Validar Tag Duplicado
    const tagYaExiste = direcciones.some((d) => {
      const tagGuardado = d.tag?.trim().toLowerCase();
      if (mode === "edit" && originalTag.trim().toLowerCase() === tagGuardado) {
        return false;
      }
      return tagGuardado === tagIngresado;
    });

    if (tagYaExiste) {
      setErrorTag(
        `Ya tenés una dirección guardada como "${draft.tag.trim()}". Elegí otro nombre.`,
      );
      return;
    }

    // 3. Validar Calle Obligatoria y Selección Real de Geoapify (Lat/Lng)
    // Si la calle está vacía, O si hay texto pero las coordenadas son 0, significa que no seleccionó del mapa.
    if (!calleIngresada || draft.latitud === 0 || draft.longitud === 0) {
      setErrorCalle(
        "Debes seleccionar una dirección válida de la lista de sugerencias para ubicarla en el mapa.",
      );
      return;
    }

    // Si pasó todas las aduanas, guardamos
    onSave();
  };

  const handleUsarMiUbicacion = async () => {
    setIsLocating(true);
    setErrorCalle(null);

    try {
      // ubicacionGPS ahora es de tipo DireccionGeoapify
      const ubicacionGPS = await autocompletarDesdeGPS();

      onChange({
        ...draft,
        calle: ubicacionGPS.calle,
        numero: ubicacionGPS.numero ? ubicacionGPS.numero : draft.numero,
        esquina: ubicacionGPS.esquina ? ubicacionGPS.esquina : draft.esquina,
        latitud: ubicacionGPS.latitud,
        longitud: ubicacionGPS.longitud,
      });
    } catch (error) {
      setErrorCalle(
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener ubicación.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="border border-orange-200 rounded-xl p-5 bg-orange-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800 text-sm">
          {mode === "edit" ? "Editar dirección" : "Nueva dirección"}
        </h4>
        <button
          type="button"
          onClick={handleUsarMiUbicacion}
          disabled={isLocating}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-trego-orange bg-orange-100/50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LocateFixed size={14} />
          )}
          {isLocating ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
        </button>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* TAG */}
        <div className="sm:col-span-2">
          <FormInput
            label="Tag (etiqueta personal)"
            placeholder="Ej: Casa, Trabajo, Oficina"
            {...field("tag")}
          />
          {errorTag && (
            <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
              {errorTag}
            </p>
          )}
        </div>

        {/* AUTOCOMPLETE CON VALIDACIÓN ESTRICTA */}
        <div className="sm:col-span-2">
          <DireccionAutocomplete
            label="Dirección (Buscar en mapa)"
            value={draft.calle}
            error={errorCalle ?? ""} // 👈 Le pasamos nuestro nuevo error de validación
            onChangeText={(texto) => {
              if (errorCalle) setErrorCalle(null); // Limpiamos error al escribir
              onChange({
                ...draft,
                calle: texto,
                latitud: 0, // Invalidamos coordenadas inmediatamente si el texto cambia a mano
                longitud: 0,
              });
            }}
            onClear={() => {
              setErrorCalle(null);
              onChange({ ...draft, calle: "", latitud: 0, longitud: 0 });
            }}
            onSelectAddress={(dirCompletada) => {
              setErrorCalle(null); // Dirección seleccionada con éxito, limpiamos error
              onChange({
                ...draft,
                calle: dirCompletada.calle || "",
                numero: dirCompletada.numero
                  ? String(dirCompletada.numero)
                  : draft.numero,
                latitud: dirCompletada.latitud ?? 0,
                longitud: dirCompletada.longitud ?? 0,
              });
            }}
            className="rounded-xl text-sm  border-gray-200! focus:border-orange-300! focus:ring-orange-300! h-10!"
            classNameLabel="block text-xs font-medium text-slate-500 mb-1 px-0!"
          />
        </div>

        {/* RESTO DE LOS CAMPOS */}
        <FormInput
          label="Número"
          required
          placeholder="1234"
          {...field("numero")}
        />
        <FormInput
          label="Apartamento / Piso"
          placeholder="3B"
          {...field("apartamento")}
        />
        <FormInput
          label="Esquina / Referencia"
          placeholder="Ej: Bulevar Artigas"
          {...field("esquina")}
        />
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleValidarYGuardar}
          className="flex items-center gap-1.5 px-4 py-2 bg-trego-orange hover:bg-trego-cart text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Save size={14} />
          {mode === "edit" ? "Guardar cambios" : "Agregar dirección"}
        </button>
      </div>
    </div>
  );
}
