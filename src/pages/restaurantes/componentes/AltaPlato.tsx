import { useState } from "react";
import ImageUploadField from "../../../components/ImagenUploadField.js";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { Ingrediente } from "../../../data/DTOIngrediente.js";

export interface SubcategoriaItem {
  id: string;
  label: string;
}

export const SUBCATEGORIAS: SubcategoriaItem[] = [
  { id: "sin_subcategoria", label: "Sin subcategoría" },
  { id: "helados", label: "Helados" },
  { id: "tartas", label: "Tartas" },
  { id: "mousses", label: "Mousses" },
  { id: "tortas", label: "Tortas" },
  { id: "sopas", label: "Sopas" },
  { id: "pastas", label: "Pastas" },
  { id: "arroces", label: "Arroces" },
];

interface AltaPlatoProps {
  foto: ImageField;
  onChangeImage: (file: ImageField) => void;
  error: Record<string, string>;
  nombrePlato: string;
  onChangeNombrePlato: (nombre: string) => void;
  subcategoria: SubcategoriaItem | undefined;
  onChangeSubCategoria: (item: SubcategoriaItem | undefined) => void;
  precio: number;
  onChangePrecio: (precio: number) => void;
  tiempoPreparacion: number;
  onChangeTiempoPrep: (tp: number) => void;
  descripcion: string;
  onChangeDescripcion: (desc: string) => void;
  ingredientes: Ingrediente[];
  ingredienteSeleccionado: Ingrediente | undefined;
  onChangeIngrediente: (item: Ingrediente) => void;
  listaDeIngredientes: (item: Ingrediente[]) => void;
}

export default function AltaPlato({
  foto,
  onChangeImage,
  error,
  nombrePlato,
  onChangeNombrePlato,
  subcategoria,
  onChangeSubCategoria,
  precio,
  onChangePrecio,
  tiempoPreparacion,
  onChangeTiempoPrep,
  descripcion,
  onChangeDescripcion,
  ingredientes,
  ingredienteSeleccionado,
  onChangeIngrediente,
  listaDeIngredientes,
}: AltaPlatoProps) {
  const [listaIngredientes, setListaIngredientes] = useState<Ingrediente[]>([]);
  const [mostrarFormIngrediente, setMostrarFormIngrediente] = useState(false);

  const agregarIngrediente = () => {
    const ing = ingredientes.find((i) => i.id === ingredienteSeleccionado?.id);
    if (!ing) return;
    if (listaIngredientes.find((i) => i.id === ing.id)) return;
    setListaIngredientes((prev) => [...prev, ing]);
    listaDeIngredientes(listaIngredientes);
  };

  const quitarIngrediente = (id: number) => {
    setListaIngredientes((prev) => prev.filter((i) => i.id !== id));
    listaDeIngredientes(listaIngredientes);
  };

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

            {/* Tiempo — solo con ingredientes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                Tiempo De Preparación
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tiempoPreparacion}
                  onChange={(e) => onChangeTiempoPrep(tiempoPreparacion)}
                  placeholder="T. Preparación"
                  //className={`${fieldClass("tiempoPreparacion")} pr-14`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  min
                </span>
              </div>
              {error.tiempoPreparacion && (
                <p className="text-xs text-red-500 mt-1 px-2">
                  {error.tiempoPreparacion}
                </p>
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

        {/* Ingredientes — con ingredientes */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700 px-1">
            Ingredientes Del Producto
          </label>

          {/* Selector + add button */}
          <div className="flex gap-2">
            <select
              value={ingredienteSeleccionado?.nombre}
              onChange={(e) => {
                const id = Number(e.target.value);
                const found = ingredientes.find((it) => it.id === id);
                if (found) onChangeIngrediente(found);
              }}
              className="flex-1 border border-gray-300 rounded-3xl px-5 py-3 outline-none text-sm bg-white
                        focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
            >
              {ingredientes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={agregarIngrediente}
              title="Agregar ingrediente a la lista"
              className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-sm"
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

          {/* Crear nuevo ingrediente */}
          {/*!mostrarFormIngrediente ? (
            <button
              onClick={() => setMostrarFormIngrediente(true)}
              className="text-sm text-trego-restaurante font-semibold hover:underline self-start px-1"
            >
              + Crear nuevo ingrediente
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={nuevoIngrediente}
                onChange={(e) => setNuevoIngrediente(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && crearIngrediente()}
                placeholder="Nombre del ingrediente"
                className="flex-1 border border-gray-300 rounded-3xl px-5 py-2.5 outline-none text-sm
                          focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
                autoFocus
              />
              <button
                onClick={crearIngrediente}
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
          )/*}

          {/* Lista de ingredientes seleccionados */}
          <div className="border border-gray-200 rounded-2xl p-3 min-h-[80px] bg-gray-50">
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
                    key={ing.id}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm shadow-sm"
                  >
                    <span>{ing.nombre}</span>
                    <button
                      onClick={() => quitarIngrediente(ing.id)}
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
