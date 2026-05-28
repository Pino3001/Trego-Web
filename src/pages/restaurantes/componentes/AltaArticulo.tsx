import ImageUploadField from "../../../components/ImagenUploadField.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import { TextInput } from "../../../components/TextInput.js";
import { TextSelector } from "../../../components/TextSelector.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import { SUBCATEGORIAS, type SubcategoriaItem } from "../AltaProducto.js";

interface AltaArticuloProps {
  foto: ImageField;
  onChangeImage: (file: File | null) => void;
  error: Record<string, string>;
  nombre: string;
  onChangeNombre: (nombre: string) => void;
  subcategoria: SubcategoriaItem | undefined;
  onChangeSubCategoria: (item: SubcategoriaItem | undefined) => void;
  precio: number;
  onChangePrecio: (precio: number) => void;
  descripcion: string;
  onChangeDescripcion: (desc: string) => void;
}

export default function AltaArticulo({
  foto,
  onChangeImage,
  error,
  nombre,
  onChangeNombre,
  subcategoria,
  onChangeSubCategoria,
  precio,
  onChangePrecio,
  descripcion,
  onChangeDescripcion,
}: AltaArticuloProps) {
  const handleImageChange = (file: File | null) => {
    onChangeImage(file);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-8 flex flex-col gap-3">
        {/* Row: image + fields */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <ImageUploadField
            label="Imagen Del Producto"
            imageField={foto}
            onImageChange={handleImageChange}
            hasError={error.foto ? true : false}
            className="w-55 h-40"
          />

          {/* Right fields */}
          <div className="w-100 m-auto mt-5 flex flex-col gap-10">
            <TextInput
              placeholder="Tipo de Articulo"
              value={nombre}
              onChange={onChangeNombre}
              colorStyle="trego-restaurante"
              type="text"
              error={error.nombre ?? ""}
            />

            <TextSelector
              items={SUBCATEGORIAS}
              placeholder="Categorias"
              colorStyle="trego-restaurante"
              mapToItem={(t) => ({ id: t.id, label: t.label })}
              selected={subcategoria}
              onSelect={onChangeSubCategoria}
            />
          </div>
        </div>

        <div className="flex flex-row gap-10">
          <div className="w-120 max-w-full">
            <h1 className="text-sm font-semibold px-5">Descripción</h1>
            <textarea
              value={descripcion}
              onChange={(e) => onChangeDescripcion(e.target.value)}
              placeholder="Describe el producto..."
              rows={3}
              className={`peer w-full border rounded-3xl p-5 outline-none focus:ring-1 transition-all
                          ${
                            error.descripcion
                              ? "border-red-400 focus:border-red-400 focus:ring-red-300 bg-red-50"
                              : "border-gray-400 focus:border-trego-restaurante focus:ring-trego-restaurante"
                          }`}
            />
            {error.descripcion && (
              <p className="text-xs text-red-500 mt-1 px-5">
                {error.descripcion}
              </p>
            )}
          </div>
          <div className="w-60 m-auto">
            <TextInputNumber
              value={precio}
              onChange={onChangePrecio}
              label="Precio"
              suffix="$"
              error={error.precio}
              min={0}
            />
          </div>
        </div>
      </div>
    </>
  );
}
