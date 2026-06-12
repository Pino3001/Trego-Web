import ImageUploadField from "../../../components/ImagenUploadField.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import { TextInput } from "../../../components/TextInput.js";
import { TextSelector } from "../../../components/TextSelector.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { DTOSubcategoria } from "../../../data/DTOSubcategoria.js";
import {
  CATEGORIAS_PRODUCTO,
  EnumCategoriaProducto,
} from "../../../data/EnumCategoriaProducto.js";

interface AltaArticuloProps {
  foto: ImageField;
  onChangeImage: (file: File | null) => void;
  error: Record<string, string>;
  nombre: string;
  subcategorias: DTOSubcategoria[] | undefined;
  onChangeNombre: (nombre: string) => void;
  subcategoria: DTOSubcategoria | undefined;
  onChangeSubCategoria: (item: DTOSubcategoria | undefined) => void;
  categoria: EnumCategoriaProducto | undefined;
  onChangeCategoria: (item: EnumCategoriaProducto | undefined) => void;
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
  subcategorias,
  subcategoria,
  onChangeSubCategoria,
  categoria,
  onChangeCategoria,
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
          <div className="flex flex-col gap-5 m-auto">
            <ImageUploadField
              label="Imagen Del Producto"
              imageField={foto}
              onImageChange={handleImageChange}
              hasError={!!error.foto}
              className="w-55 h-40"
            />

            <div className="w-55   m-auto">
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
              items={CATEGORIAS_PRODUCTO}
              placeholder="Categoria "
              colorStyle="trego-restaurante"
              mapToItem={(t) => ({ id: t.id, label: t.label })}
              selected={
                categoria ? { id: categoria, label: categoria } : undefined
              }
              onSelect={(item) =>
                onChangeCategoria(item?.id as EnumCategoriaProducto)
              }
              error={error.categoria ?? ""}
            />

            <TextSelector
              items={subcategorias ?? []}
              placeholder="Sub-Categoria Producto"
              colorStyle="trego-restaurante"
              mapToItem={(t) => ({
                id: t.idSubCategoria ?? "",
                label: t.nombre ?? "",
              })}
              selected={subcategoria}
              onSelect={onChangeSubCategoria}
              error={error.subcategoria ?? ""}
            />
          </div>
        </div>

        <div className="flex1 px-10">
          <h1 className="text-sm font-semibold px-5">Descripción</h1>
          <textarea
            value={descripcion}
            onChange={(e) => onChangeDescripcion(e.target.value)}
            placeholder="Describe el producto..."
            rows={2}
            className="w-full border border-gray-400 rounded-3xl p-5 outline-none
                       focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante"
          />
          {error.descripcion && (
            <p className="text-xs text-red-500 mt-1 px-5">
              {error.descripcion}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
