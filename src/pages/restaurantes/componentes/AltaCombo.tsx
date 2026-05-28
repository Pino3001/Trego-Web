import { useState } from "react";
import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { DTOProducto } from "../../../data/DTOProducto.js";
import { TextSelector } from "../../../components/TextSelector.js";
import { TextInput } from "../../../components/TextInput.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import { TextBuscador } from "../../../components/TextBuscador.js";
import { SUBCATEGORIAS, type SubcategoriaItem } from "../AltaProducto.js";

const PRODUCTOS_EXISTENTES: DTOProducto[] = [
  {
    idProducto: 1,
    nombre: "Pizza Margherita",
    descripcion: "Pizza clásica con tomate, mozzarella y albahaca",
    precio: 9.99,
    categoria: "PIZZA",
    tipo: "COMIDA",
  },
  {
    idProducto: 2,
    nombre: "Coca-Cola 500ml",
    descripcion: "Refresco de cola bien frío",
    precio: 2.5,
    categoria: "BEBIDA",
    tipo: "BEBIDA",
  },
  {
    idProducto: 3,
    nombre: "Hamburguesa Completa",
    descripcion: "Carne 150g, lechuga, tomate, queso y bacon",
    precio: 8.5,
    categoria: "HAMBURGUESA",
    tipo: "COMIDA",
  },
];

interface AltaComboProps {
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
  onChangeListaProd: (prod: DTOProducto[]) => void;
  productosSeleccionados: DTOProducto[];
}

export default function AltaCombo({
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
  onChangeListaProd,
  productosSeleccionados,
}: AltaComboProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    DTOProducto | undefined
  >();

  const handleImageChange = (file: File | null) => {
    onChangeImage(file);
  };

  const toggleProducto = (producto: DTOProducto) => {
    const existe = productosSeleccionados.some(
      (p) => p.idProducto === producto.idProducto,
    );
    if (existe) {
      onChangeListaProd(
        productosSeleccionados.filter(
          (p) => p.idProducto !== producto.idProducto,
        ),
      );
    } else {
      onChangeListaProd([...productosSeleccionados, producto]);
    }
  };


  return (
    <>
      <div className="bg-white rounded-3xl  p-8 flex flex-col gap-3">
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
          <div className="w-120 max-w-full ">
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

        <div className="flex flex-col gap-3">
          <label className="text-sm text-center font-semibold text-gray-700 px-1">
            Productos para el Combo
          </label>

          {/* Selector + add button */}
          <div className="w-160 m-auto flex gap-4">
            <TextBuscador
              items={PRODUCTOS_EXISTENTES}
              selected={productoSeleccionado}
              onSelect={(item) => {
                setProductoSeleccionado(item); // opcional, para mostrar feedback visual
                if (item) toggleProducto(item);
              }}
              mapToItem={(t) => ({ id: t.idProducto ?? 0, label: t.nombre })}
            />
          </div>

          {/* Lista de ingredientes seleccionados */}
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
                {productosSeleccionados.map((ing) => (
                  <div
                    key={ing.idProducto}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm shadow-sm"
                  >
                    <span>{ing.nombre}</span>
                    <button
                      onClick={() => toggleProducto(ing)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar ingrediente"
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
