import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import { SUBCATEGORIAS, type SubcategoriaItem } from "./AltaPlato.js";

interface AltaComboProps {
  foto: ImageField;
  onChangeImage: (file: ImageField) => void;
  error: Record<string, string>;
  nombrePlato: string;
  onChangeNombrePlato: (nombre: string) => void;
  subcategoria: SubcategoriaItem | undefined;
  onChangeSubCategoria: (item: SubcategoriaItem | undefined) => void;
  precio: number;
  onChangePrecio: (precio: number) => void;
  descripcion: string;
  onChangeDescripcion: (desc: string) => void;
}

export default function AltaCombo({
  foto,
  onChangeImage,
  error,
  nombrePlato,
  onChangeNombrePlato,
  subcategoria,
  onChangeSubCategoria,
  precio,
  onChangePrecio,
  descripcion,
  onChangeDescripcion,
}: AltaComboProps) {
  const handleImageChange = (file: File | null) => {
    if (!file) {
      onChangeImage({
        file: null,
        previewUrl: null,
        cloudUrl: null,
        uploadState: "error",
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) =>
        onChangeImage({
          file,
          previewUrl: e.target?.result as string,
          uploadState: "uploading",
          cloudUrl: null,
        });
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg shadow-green-50 p-8 flex flex-col gap-6">
        {/* Row: image + fields */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="flex flex-col gap-1.5 items-start">
            <ImageUploadField
              label="Imagen Del Producto"
              imageField={foto}
              onImageChange={handleImageChange}
              hasError={error.foto ? true : false}
            />
          </div>

          {/* Right fields */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Nombre */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                Nombre Del Producto
              </label>
              <input
                type="text"
                value={nombrePlato}
                onChange={(e) => onChangeNombrePlato(e.target.value)}
                placeholder="Nombre del Producto"
                //className={fieldClass("nombre")}
              />
              {error.nombre && (
                <p className="text-xs text-red-500 mt-1 px-2">{error.nombre}</p>
              )}
            </div>

            {/* Subcategoria — solo con ingredientes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                Subcategoría Del Producto
              </label>
              <select
                value={subcategoria?.label}
                onChange={(e) => onChangeSubCategoria(subcategoria)}
                //className={fieldClass("")}
              >
                {SUBCATEGORIAS.map((s) => (
                  <option key={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                Precio
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => onChangePrecio(precio)}
                  placeholder="0.00"
                  //className={`${fieldClass("precio")} pr-10`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  $
                </span>
              </div>
              {error.precio && (
                <p className="text-xs text-red-500 mt-1 px-2">{error.precio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Descripcion — con ingredientes */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
            Descripción Del Producto
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => onChangeDescripcion(e.target.value)}
            placeholder="Describe el producto..."
            rows={3}
            className="w-full border border-gray-300 rounded-3xl px-5 py-3 outline-none text-sm
                              focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all resize-none"
          />
        </div>
      </div>
    </>
  );
}
