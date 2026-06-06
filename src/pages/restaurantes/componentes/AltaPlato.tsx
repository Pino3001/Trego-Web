import { useEffect, useState } from "react";
import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { DTOIngrediente } from "../../../data/DTOIngrediente.js";
import { TextSelector } from "../../../components/TextSelector.js";
import { TextInput } from "../../../components/TextInput.js";
import { TextInputNumber } from "../../../components/TextImputNumber.js";
import { TextBuscador } from "../../../components/TextBuscador.js";
import {
  crearIngrediente,
  listarIngredientes,
} from "../../../api/apiRestaurante.js";
import type { DTOSubcategoria } from "../../../data/DTOSubcategoria.js";
import {
  CATEGORIAS_PRODUCTO,
  type EnumCategoriaProducto,
} from "../../../data/EnumCategoriaProducto.js";
import { useIngredientes } from "../../../hooks/useIngredientes.js";

interface AltaPlatoProps {
  foto: ImageField;
  onChangeImage: (file: File | null) => void; // solo File | null
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
  tiempoPreparacion: number;
  onChangeTiempoPrep: (tp: number) => void;
  descripcion: string;
  onChangeDescripcion: (desc: string) => void;
  onChangeListaDeIngredientes: (items: DTOIngrediente[]) => void;
  ingredientesIniciales?: DTOIngrediente[] | undefined;
}

export default function AltaPlato({
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
  tiempoPreparacion,
  onChangeTiempoPrep,
  descripcion,
  onChangeDescripcion,
  onChangeListaDeIngredientes,
  ingredientesIniciales,
}: AltaPlatoProps) {
  const {
    listaIngredientesBackend,
    listaIngredientes,
    ingredienteSeleccionado,
    nuevoIngrediente,
    setNuevoIngrediente,
    mostrarFormIngrediente,
    setMostrarFormIngrediente,
    agregarIngrediente,
    quitarIngrediente,
    crearIngredienteLocal,
  } = useIngredientes({
    onError: onChangeApiError,
    onListaCambiada: onChangeListaDeIngredientes,
    initialIngredientes: ingredientesIniciales ?? [],
  });

  const handleImageChange = (file: File | null) => {
    onChangeImage(file);
  };

  return (
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

        <div className="w-100 m-auto mt-5 flex flex-col gap-3">
          <TextInput
            placeholder="Nombre del plato"
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
          />

          <TextInputNumber
            value={tiempoPreparacion}
            onChange={onChangeTiempoPrep}
            label="Tiempo Preparacion"
            suffix="Min"
            error={error.precio}
            min={0}
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
          <p className="text-xs text-red-500 mt-1 px-5">{error.descripcion}</p>
        )}
      </div>

      {/* Ingredientes */}
      <div className="flex flex-col px-10 gap-3">
        <label className="text-sm text-center font-semibold text-gray-700">
          Ingredientes Del Producto
        </label>

        <div className="w-full max-w-2xl mx-auto flex gap-4">
          <div className="flex-1">
            <TextBuscador
              id="Ingredientes listado"
              items={listaIngredientesBackend}
              selected={ingredienteSeleccionado}
              onSelect={(item) => {
                agregarIngrediente(item);
              }}
              mapToItem={(t) => ({ id: t.idIngrediente ?? 0, label: t.nombre })}
              placeholder="Buscar ingrediente"
              label
            />
          </div>
          <button
            onClick={() => setMostrarFormIngrediente(true)}
            title="Agregar ingrediente a la lista"
            className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>

        {mostrarFormIngrediente && (
          <div className="flex gap-2 items-center max-w-2xl mx-auto w-full">
            <input
              type="text"
              value={nuevoIngrediente}
              onChange={(e) => setNuevoIngrediente(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearIngredienteLocal()}
              placeholder="Nombre del ingrediente"
              className="flex-1 border border-gray-300 rounded-3xl px-5 py-2.5 outline-none text-sm
                          focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
              autoFocus
            />
            <button
              onClick={crearIngredienteLocal}
              className="px-4 py-2.5 rounded-3xl bg-trego-restaurante text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setMostrarFormIngrediente(false);
                setNuevoIngrediente("");
              }}
              className="px-4 py-2.5 rounded-3xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Lista de ingredientes seleccionados */}
        <div className="border border-gray-200 rounded-2xl p-3 min-h-20 bg-gray-50  w-full">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
            Lista De Ingredientes
          </p>
          {listaIngredientes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Ningún ingrediente agregado
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {listaIngredientes.map((ing) => (
                <div
                  key={ing.idIngrediente}
                  className="flex items-center gap-1.5 bg-trego-orange border border-trego-orange rounded-full px-3 py-1 text-base font-medium text-white shadow-sm"
                >
                  <span>{ing.nombre}</span>
                  <button
                    onClick={() => quitarIngrediente(ing)}
                    className="text-white hover:text-blue-600 transition-colors"
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
  );
}
