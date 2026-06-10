import { useState } from "react";
import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import {
  crearOferta,
  obtenerFirmaCloudinary,
} from "../../../api/apiRestaurante.js";
import type { DTOProducto } from "../../../data/DTOProducto.js";
import type { DTOOferta } from "../../../data/DTOOferta.js";

interface AltaOfertaProps {
  producto?: DTOProducto;
  onCancelar: () => void;
}

export default function AltaOferta({ producto, onCancelar }: AltaOfertaProps) {
  const [foto, setFoto] = useState<ImageField>({
    file: null,
    previewUrl: null,
    cloudUrl: null,
    uploadState: "idle",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- ESTADO PARA NOTIFICACIONES ---
  const [notificacion, setNotificacion] = useState<{
    tipo: "exito" | "error";
    mensaje: string;
  } | null>(null);

  const [descripcion, setDescripcion] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [descuento, setDescuento] = useState(0);

  const precioFinal =
    (producto?.precio ?? 0) > 0
      ? +((producto?.precio ?? 0) * (1 - descuento / 100)).toFixed(2)
      : 0;

  // --- imagen ---
  const handleImageChange = (file: File | null) => {
    if (!file) return;
    if (foto.previewUrl) URL.revokeObjectURL(foto.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    setFoto({ file, previewUrl, uploadState: "uploading", cloudUrl: null });
    subirImagen(file, previewUrl);
  };

  async function subirImagen(file: File, previewUrl: string) {
    try {
      const nombreSinExtension =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const datosBack = await obtenerFirmaCloudinary(
        nombreSinExtension,
        "image",
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", datosBack.apiKey);
      formData.append("timestamp", datosBack.timestamp.toString());
      formData.append("signature", datosBack.firma);
      formData.append("public_id", datosBack.publicId);

      const res = await fetch(datosBack.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary rechazó la imagen");

      const data = await res.json();
      setFoto((prev) => ({
        ...prev,
        uploadState: "done",
        cloudUrl: data.secure_url,
      }));
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setFoto({ file, previewUrl, uploadState: "idle", cloudUrl: null });
      setErrors((prev) => ({ ...prev, foto: "Error al subir la imagen" }));
    }
  }

  // --- validación ---
  const validar = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!foto.cloudUrl) newErrors.foto = "La imagen es requerida";
    if (!fechaDesde) newErrors.fechaDesde = "Ingresá la fecha de inicio";
    if (!fechaHasta) newErrors.fechaHasta = "Ingresá la fecha de fin";
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta)
      newErrors.fechaHasta = "La fecha fin debe ser posterior a la de inicio";
    if (descuento <= 0 || descuento > 100)
      newErrors.descuento = "Ingresá un descuento entre 1 y 100";
    if (!descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCrear = async () => {
    if (!validar()) return;

    const fechaInicioFormateada = `${fechaDesde}T00:00:00`;
    const fechaFinFormateada = `${fechaHasta}T00:00:00`;

    try {
      const oferta: DTOOferta = {
        urlImagen: foto.cloudUrl ?? "",
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada,
        descuento: descuento,
        descripcion: descripcion,
      };
      await crearOferta(oferta, producto?.idProducto ?? 0);

      setNotificacion({
        tipo: "exito",
        mensaje: "¡La oferta se creó correctamente!",
      });

      setTimeout(() => setNotificacion(null), 3000);
      onCancelar();
    } catch (error) {
      console.error("Error al crear oferta:", error);
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error inesperado al crear la oferta";

      setNotificacion({
        tipo: "error",
        mensaje,
      });

      setTimeout(() => setNotificacion(null), 3000);
    }
  };

  const isUploading = foto.uploadState === "uploading";

  return (
    <div className="bg-white w-5xl mx-auto rounded-3xl p-2 flex flex-col gap-6">
      <div className="relative py-5">
        <button
          type="button"
          onClick={onCancelar}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600 hover:text-trego-restaurante transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Volver al producto
        </button>
        <h2 className="text-center font-semibold text-4xl">Nueva oferta</h2>
      </div>
      <h2 className="text-center font-semibold text-trego-restaurante text-3xl pb-5">{`${producto?.tipo ?? "Producto"} - ${producto?.nombre ?? "Sin Nombre"}`}</h2>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col px-15 items-center gap-1 shrink-0">
          <ImageUploadField
            label="Imagen Oferta"
            imageField={foto}
            onImageChange={handleImageChange}
            hasError={!!errors.foto}
            className="w-55 h-40"
          />
          {errors.foto && (
            <p className="text-xs text-red-500 text-center">{errors.foto}</p>
          )}
        </div>

        <div className="flex flex-col px-15 gap-8 flex-1 min-w-0">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium text-gray-700">Desde</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className={`rounded-xl border h-11 px-4 text-sm focus:outline-none focus:ring-2 transition-colors
                  ${
                    errors.fechaDesde
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-300 focus:border-trego-restaurante focus:ring-trego-restaurante"
                  }`}
              />
              {errors.fechaDesde && (
                <p className="text-xs text-red-500">{errors.fechaDesde}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium text-gray-700">Hasta</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className={`rounded-xl border h-11 px-4 text-sm focus:outline-none focus:ring-2 transition-colors
                  ${
                    errors.fechaHasta
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-300 focus:border-trego-restaurante focus:ring-trego-restaurante"
                  }`}
              />
              {errors.fechaHasta && (
                <p className="text-xs text-red-500">{errors.fechaHasta}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                Descuento
              </span>
              <TextInputNumber
                value={descuento}
                onChange={setDescuento}
                label="Descuento"
                suffix="%"
                error={errors.descuento}
                min={0}
                max={100}
                className="h-11! rounded-xl!"
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                Precio con descuento
              </span>
              <TextInputNumber
                value={precioFinal}
                onChange={() => {}}
                label=""
                suffix="$"
                min={0}
                disabled
                className="h-11! rounded-xl!"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-30 gap-1">
        <span className="text-sm font-semibold text-gray-700 px-1">
          Descripción
        </span>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describí la oferta, los productos incluidos y las condiciones..."
          rows={3}
          className={`w-full border rounded-3xl p-5 text-sm outline-none resize-none transition-colors
            ${
              errors.descripcion
                ? "border-red-400 focus:ring-1 focus:ring-red-400"
                : "border-gray-300 focus:border-trego-restaurante focus:ring-trego-restaurante"
            }`}
        />
        {errors.descripcion && (
          <p className="text-xs text-red-500 px-1">{errors.descripcion}</p>
        )}
      </div>

      {notificacion && (
        <div className="px-30 transition-all duration-300">
          <div
            className={`p-3 rounded-2xl text-center text-sm font-medium border ${
              notificacion.tipo === "exito"
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {notificacion.mensaje}
          </div>
        </div>
      )}

      <div className="flex w-full m-auto gap-3 pt-2 px-30 pb-5">
        <button
          type="button"
          onClick={handleCrear}
          disabled={isUploading}
          className="px-6 py-2.5 rounded-3xl w-full bg-trego-restaurante text-white text-sm font-semibold
                     hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Subiendo imagen…" : "Crear oferta"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-6 py-2.5 rounded-3xl border w-full border-trego-orange text-trego-orange text-sm font-medium hover:bg-trego-orange hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
