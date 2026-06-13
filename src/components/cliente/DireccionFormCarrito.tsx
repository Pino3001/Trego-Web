import { useCallback, useEffect, useRef, useState } from "react";
import type { DTODireccion } from "../../data/DTODireccion.js";
import { autocompletarDesdeGPS } from "../../pages/restaurantes/utilitis/geoapifyUtilitis.js";
import { Save, X } from "lucide-react";
import FormInput from "./FormImput.js";
import DireccionAutocomplete from "../DireccionAutocomplete.js";

interface DireccionFormCarritoProps {
  draft: DTODireccion;
  onChange: (nuevoDraft: DTODireccion) => void;
  onSave: (draftFinal: DTODireccion) => void;
  onCancel: () => void;
  autoLocate?: boolean;
}

export default function DireccionFormCarrito({
  draft,
  onChange,
  onSave,
  onCancel,
  autoLocate = false,
}: DireccionFormCarritoProps) {
  const [errorCalle, setErrorCalle] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const hasAutoLocated = useRef(false);

  // Helper para generar props de campos controlados
  const field = useCallback(
    <K extends keyof DTODireccion>(key: K) => ({
      value: draft[key] ?? (key === "latitud" || key === "longitud" ? 0 : ""),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = e.target.value;
        if (key === "latitud" || key === "longitud") {
          value = value === "" ? 0 : Number(value);
        }
        onChange({ ...draft, [key]: value });
      },
    }),
    [draft, onChange]
  );

  // Geolocalización automática si autoLocate === true
  useEffect(() => {
    if (autoLocate && !hasAutoLocated.current) {
      hasAutoLocated.current = true;
      (async () => {
        setIsLocating(true);
        setErrorCalle(null);
        try {
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
              : "Error desconocido al obtener ubicación."
          );
        } finally {
          setIsLocating(false);
        }
      })();
    }
  }, [autoLocate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidarYGuardar = () => {
    setErrorCalle(null);
    const calleIngresada = draft.calle?.trim() || "";
    if (!calleIngresada || draft.latitud === 0 || draft.longitud === 0) {
      setErrorCalle(
        "Debes seleccionar una dirección válida de la lista de sugerencias para ubicarla en el mapa."
      );
      return;
    }
    onSave(draft);
  };

  return (
    <div className="border border-orange-200 rounded-xl p-5 bg-orange-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800 text-sm">Mi ubicación</h4>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Autocomplete con validación */}
        <div className="sm:col-span-2">
          <DireccionAutocomplete
            label="Dirección (Buscar en mapa)"
            value={draft.calle}
            error={errorCalle ?? ""}
            onChangeText={(texto: string) => {
              if (errorCalle) setErrorCalle(null);
              onChange({
                ...draft,
                calle: texto,
                latitud: 0,
                longitud: 0,
              });
            }}
            onClear={() => {
              setErrorCalle(null);
              onChange({ ...draft, calle: "", latitud: 0, longitud: 0 });
            }}
            onSelectAddress={(dirCompletada: any) => {
              setErrorCalle(null);
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
            className="rounded-xl text-sm border-gray-200! focus:border-orange-300! focus:ring-orange-300! h-10!"
            classNameLabel="block text-xs font-medium text-slate-500 mb-1 px-0!"
          />
        </div>

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
          disabled={isLocating}
          className="flex items-center gap-1.5 px-4 py-2 bg-trego-orange hover:bg-trego-cart text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Save size={14} />
          {isLocating ? "Obteniendo ubicación…" : "Usar dirección actual"}
        </button>
      </div>
    </div>
  );
}