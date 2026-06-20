import { useEffect, useState } from "react";
import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { DTOProducto } from "../../../data/DTOProducto.js";
import { TextSelector } from "../../../components/TextSelector.js";
import { TextInput } from "../../../components/TextInput.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import { TextBuscador } from "../../../components/TextBuscador.js";
import { listarProductos } from "../../../api/apiRestaurante.js";
import {
  CATEGORIAS_PRODUCTO,
  type EnumCategoriaProducto,
} from "../../../data/EnumCategoriaProducto.js";
import type { DTOSubcategoria } from "../../../data/DTOSubcategoria.js";
import { useProductoRestaurante } from "../../../hooks/useProductoRestaurante.js";

interface AltaComboProps {
  foto: ImageField;
  onChangeImage: (file: File | null) => void;
  error: Record<string, string>;
  onChangeApiError: (err: string | null) => void;
  nombre: string;
  onChangeNombre: (nombre: string) => void;
  subcategorias: DTOSubcategoria[] | undefined;
  subcategoria: DTOSubcategoria | undefined;
  onChangeSubCategoria: (item: DTOSubcategoria | undefined) => void;
  categoria: EnumCategoriaProducto | undefined;
  onChangeCategoria: (item: EnumCategoriaProducto | undefined) => void;
  precio: number;
  onChangePrecio: (precio: number) => void;
  descripcion: string;
  onChangeDescripcion: (desc: string) => void;
  productosSeleccionados: DTOProducto[];
  onChangeListaProd: (prod: DTOProducto[]) => void;
}

export default function AltaCombo({
  foto,
  onChangeImage,
  error,
  onChangeApiError,
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
  productosSeleccionados,
  onChangeListaProd,
}: AltaComboProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    DTOProducto | undefined
  >();
  const { productos, loadingProductos, errorProductos, recargarProductos } =
    useProductoRestaurante();

  const handleImageChange = (file: File | null) => {
    onChangeImage(file);
  };

  // Al agregar, sumamos el precio del producto al precio actual del combo
  const agregarProducto = (producto: DTOProducto) => {
    const nuevoPrecio = precio + (producto.precio ?? 0);
    onChangePrecio(nuevoPrecio);
    onChangeListaProd([...productosSeleccionados, producto]);
  };

  // Al quitar, restamos el precio del producto eliminado
  const quitarProducto = (indice: number) => {
    const producto = productosSeleccionados[indice];
    const nuevoPrecio = precio - (producto?.precio ?? 0);
    const nuevaLista = productosSeleccionados.filter((_, i) => i !== indice);
    onChangePrecio(nuevoPrecio);
    onChangeListaProd(nuevaLista);
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

            <div className="w-55 m-auto">
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
              placeholder="Categoria"
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

        <div className="flex flex-col px-10 gap-3">
          <label className="text-sm text-center font-semibold text-gray-700 px-1">
            Productos para el Combo
          </label>

          {/* Selector + add button */}
          <div className="w-160 m-auto flex flex-col gap-2">
            <div>
              <TextBuscador
                items={productos ?? []}
                placeholder="Agregar Producto"
                selected={productoSeleccionado}
                onSelect={(item) => {
                  setProductoSeleccionado(item);
                  if (item) agregarProducto(item);
                }}
                mapToItem={(t) => ({ id: t.idProducto ?? 0, label: t.nombre ?? ""})}
              />
            </div>
            {/* Indicador de carga */}
            {loadingProductos && (
              <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                <svg
                  className="animate-spin h-4 w-4 text-trego-orange"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Cargando productos...
              </div>
            )}

            {/* Mensaje de error */}
            {errorProductos && !loadingProductos && (
              <div className="flex items-center gap-2 text-xs text-red-600 px-1">
                <span>Error al cargar productos.</span>
                <button
                  onClick={recargarProductos}
                  className="underline hover:text-red-800 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          {/* Lista de productos seleccionados */}
          <div className="border border-gray-200 rounded-2xl p-3 min-h-20 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
              Lista De Productos
            </p>
            {productosSeleccionados.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Ningún producto agregado al combo
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {productosSeleccionados.map((prod, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-trego-orange border border-trego-orange rounded-full px-3 py-1 text-base font-medium text-white shadow-sm"
                  >
                    <span>{prod.nombre}</span>
                    <button
                      onClick={() => quitarProducto(index)}
                      className="text-white hover:text-blue-600 transition-colors"
                      title="Eliminar producto"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
