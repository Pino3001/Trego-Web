import { useState, useRef, useCallback } from "react";
import Sidebar from "../../components/body/Sidebar.js";
import Header from "../../components/body/Header.js";
import type { Ingrediente } from "../../data/DTOIngrediente.js";
import AltaPlato, {
  SUBCATEGORIAS,
  type SubcategoriaItem,
} from "./componentes/AltaPlato.js";
import type { ImageField } from "../../components/typos/ImageField.js";
import AltaArticulo from "./componentes/AltaArticulo.js";

// ─── Types ───────────────────────────────────────────────────────────────────

type TipoProducto = "con-ingredientes" | "sin-ingredientes" | "combo";
type StepState = "FORM" | "LOADING" | "SUCCESS";

interface ProductoBase {
  nombre: string;
  foto: ImageField;
  precio: string;
}

interface ProductoConIngredientes extends ProductoBase {
  descripcion: string;
  subcategoria: string;
  ingredientesSeleccionados: Ingrediente[];
  tiempoPreparacion: string;
}

interface ProductoSinIngredientes extends ProductoBase {}

interface ProductoCombo extends ProductoBase {
  productosSeleccionados: number[]; // IDs de productos existentes
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INGREDIENTES_DISPONIBLES: Ingrediente[] = [
  { id: 1, nombre: "Harina" },
  { id: 2, nombre: "Azúcar" },
  { id: 3, nombre: "Huevo" },
  { id: 4, nombre: "Mantequilla" },
  { id: 5, nombre: "Leche" },
  { id: 6, nombre: "Sal" },
  { id: 7, nombre: "Aceite de Oliva" },
  { id: 8, nombre: "Ajo" },
];

const PRODUCTOS_EXISTENTES = [
  { id: 1, nombre: "Pizza Margarita" },
  { id: 2, nombre: "Coca-Cola 500ml" },
  { id: 3, nombre: "Ensalada César" },
  { id: 4, nombre: "Tiramisú" },
  { id: 5, nombre: "Agua Mineral" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  field: ImageField;
  onChange: (file: File | null) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AltaProducto() {
  const [step, setStep] = useState<StepState>("FORM");
  const [tipo, setTipo] = useState<TipoProducto>("con-ingredientes");
  const [apiError, setApiError] = useState<string | null>(null);

  // Shared fields
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [foto, setFoto] = useState<ImageField>({
    file: null,
    previewUrl: null,
    cloudUrl: null,
    uploadState: "idle",
  });

  // Con ingredientes
  const [descripcion, setDescripcion] = useState("");
  const [subcategoria, setSubcategoria] = useState<
    SubcategoriaItem | undefined
  >(SUBCATEGORIAS[0]);
  const [tiempoPreparacion, setTiempoPreparacion] = useState(0);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<
    Ingrediente[]
  >(INGREDIENTES_DISPONIBLES);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<
    Ingrediente | undefined
  >(INGREDIENTES_DISPONIBLES[0]);
  const [listaIngredientes, setListaIngredientes] = useState<Ingrediente[]>([]);
  const [mostrarFormIngrediente, setMostrarFormIngrediente] = useState(false);
  const [nuevoIngrediente, setNuevoIngrediente] = useState("");

  // Combo
  const [productosCombo, setProductosCombo] = useState<number[]>([]);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setFoto({
        file: null,
        previewUrl: null,
        cloudUrl: null,
        uploadState: "error",
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) =>
        setFoto({
          file,
          previewUrl: e.target?.result as string,
          uploadState: "uploading",
          cloudUrl: null,
        });
      reader.readAsDataURL(file);
    }
  };

  const agregarIngrediente = () => {
    const ing = ingredientesDisponibles.find(
      (i) => i.id === ingredienteSeleccionado?.id,
    );
    if (!ing) return;
    if (listaIngredientes.find((i) => i.id === ing.id)) return;
    setListaIngredientes((prev) => [...prev, ing]);
  };

  const quitarIngrediente = (id: number) => {
    setListaIngredientes((prev) => prev.filter((i) => i.id !== id));
  };

  const crearIngrediente = () => {
    const nombre = nuevoIngrediente.trim();
    if (!nombre) return;
    const nuevo: Ingrediente = { id: Date.now(), nombre };
    setIngredientesDisponibles((prev) => [...prev, nuevo]);
    setListaIngredientes((prev) => [...prev, nuevo]);
    setNuevoIngrediente("");
    setMostrarFormIngrediente(false);
  };

  const toggleProductoCombo = (id: number) => {
    setProductosCombo((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!precio || isNaN(Number(precio)))
      errs.precio = "El precio debe ser un número válido.";
    if (!foto.file) errs.foto = "La imagen del producto es obligatoria.";

    if (tipo === "con-ingredientes") {
      if (!tiempoPreparacion)
        errs.tiempoPreparacion = "El tiempo de preparación es obligatorio.";
    }
    if (tipo === "combo" && productosCombo.length === 0) {
      errs.combo = "Debe seleccionar al menos un producto para el combo.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;

    setStep("LOADING");
    try {
      // Simulate upload + API call
      await new Promise((res) => setTimeout(res, 1800));
      setStep("SUCCESS");
    } catch {
      setApiError(
        "Ocurrió un error al guardar el producto. Intente nuevamente.",
      );
      setStep("FORM");
    }
  };

  const handleCancel = () => {
    // Reset
    setNombre("");
    setPrecio(0);
    setDescripcion("");
    setSubcategoria(SUBCATEGORIAS[0]);
    setTiempoPreparacion(0);
    setListaIngredientes([]);
    setProductosCombo([]);
    setFoto({
      file: null,
      previewUrl: null,
      cloudUrl: null,
      uploadState: "idle",
    });
    setErrors({});
    setApiError(null);
  };

  const fieldClass = (key: string) =>
    `w-full border rounded-3xl px-5 py-3 outline-none text-sm transition-all duration-200
    ${
      errors[key]
        ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 bg-red-50"
        : "border-gray-300 focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante bg-white"
    }`;

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar placeholder — matches host layout */}
        <Sidebar />

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 py-8">
          <div className="w-full max-w-4xl">
            <h1 className="text-3xl font-bold text-trego-restaurante text-center mb-6 tracking-tight">
              Alta Producto
            </h1>

            {/* ── SUCCESS ── */}
            {step === "SUCCESS" && (
              <div className="flex flex-col items-center gap-6 py-20">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-trego-restaurante"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  ¡Producto agregado correctamente!
                </h2>
                <p className="text-gray-500 text-center max-w-sm">
                  El producto ya está disponible en tu menú y visible para los
                  clientes.
                </p>
                <button
                  onClick={() => {
                    handleCancel();
                    setStep("FORM");
                  }}
                  className="mt-2 px-8 py-3 rounded-3xl bg-trego-restaurante text-white font-bold hover:bg-green-700 transition-colors"
                >
                  Agregar otro producto
                </button>
              </div>
            )}

            {/* ── LOADING ── */}
            {step === "LOADING" && (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-trego-restaurante animate-spin" />
                <p className="text-sm text-gray-400">Guardando producto...</p>
              </div>
            )}

            <AltaPlato
              descripcion=""
              error={errors}
              foto={foto}
              ingredienteSeleccionado={ingredienteSeleccionado}
              ingredientes={INGREDIENTES_DISPONIBLES}
              listaDeIngredientes={setListaIngredientes}
              nombrePlato=""
              onChangeDescripcion={setDescripcion}
              onChangeImage={setFoto}
              onChangeIngrediente={setIngredienteSeleccionado}
              onChangeNombrePlato={setNombre}
              onChangePrecio={setPrecio}
              onChangeSubCategoria={setSubcategoria}
              onChangeTiempoPrep={setTiempoPreparacion}
              precio={precio}
              subcategoria={subcategoria}
              tiempoPreparacion={tiempoPreparacion}
            />

            <AltaArticulo
              descripcion=""
              error={errors}
              foto={foto}
              nombrePlato=""
              onChangeDescripcion={setDescripcion}
              onChangeImage={setFoto}
              onChangeNombrePlato={setNombre}
              onChangePrecio={setPrecio}
              onChangeSubCategoria={setSubcategoria}
              precio={precio}
              subcategoria={subcategoria}
            />

            {/* ── FORM ── */}
            {step === "FORM" && (
              <div className="bg-white rounded-3xl shadow-lg shadow-green-50 p-8 flex flex-col gap-6">
                {/* API Error */}
                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Tipo de producto */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5 px-1">
                    Tipo de Producto
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => {
                      setTipo(e.target.value as TipoProducto);
                      setErrors({});
                    }}
                    className="w-full border border-gray-300 rounded-3xl px-5 py-3 outline-none text-sm bg-white
                    focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
                  >
                    <option value="con-ingredientes">
                      Producto con ingredientes
                    </option>
                    <option value="sin-ingredientes">
                      Producto sin ingredientes
                    </option>
                    <option value="combo">Combo</option>
                  </select>
                </div>

                {/* Row: image + fields */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="flex flex-col gap-1.5 items-start">

                    {errors.foto && (
                      <span className="text-xs text-red-500">
                        {errors.foto}
                      </span>
                    )}
                    {foto.uploadState === "error" && (
                      <span className="text-xs text-red-500">{"error"}</span>
                    )}
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
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre del Producto"
                        className={fieldClass("nombre")}
                      />
                      {errors.nombre && (
                        <p className="text-xs text-red-500 mt-1 px-2">
                          {errors.nombre}
                        </p>
                      )}
                    </div>

                    {/* Subcategoria — solo con ingredientes */}
                    {tipo === "con-ingredientes" && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                          Subcategoría Del Producto
                        </label>
                        <select
                          value={subcategoria?.label}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            // Buscamos el objeto completo en la lista
                            const selectedItem = SUBCATEGORIAS.find(
                              (s) => s.id === selectedId,
                            );
                            setSubcategoria(selectedItem);
                          }}
                          className={fieldClass("")}
                        >
                          {SUBCATEGORIAS.map((s) => (
                            <option key={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Precio */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                        Precio
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={precio}
                          onChange={(e) => setPrecio(Number(e.target.value))}
                          placeholder="0.00"
                          className={`${fieldClass("precio")} pr-10`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          $
                        </span>
                      </div>
                      {errors.precio && (
                        <p className="text-xs text-red-500 mt-1 px-2">
                          {errors.precio}
                        </p>
                      )}
                    </div>

                    {/* Tiempo — solo con ingredientes */}
                    {tipo === "con-ingredientes" && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                          Tiempo De Preparación
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={tiempoPreparacion}
                            onChange={(e) =>
                              setTiempoPreparacion(Number(e.target.value))
                            }
                            placeholder="T. Preparación"
                            className={`${fieldClass("tiempoPreparacion")} pr-14`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            min
                          </span>
                        </div>
                        {errors.tiempoPreparacion && (
                          <p className="text-xs text-red-500 mt-1 px-2">
                            {errors.tiempoPreparacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripcion — con ingredientes */}
                {tipo === "con-ingredientes" && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1 px-1">
                      Descripción Del Producto
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el producto..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-3xl px-5 py-3 outline-none text-sm
                      focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all resize-none"
                    />
                  </div>
                )}

                {/* Ingredientes — con ingredientes */}
                {tipo === "con-ingredientes" && (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700 px-1">
                      Ingredientes Del Producto
                    </label>

                    {/* Selector + add button */}
                    <div className="flex gap-2">
                      <select
                        value={ingredienteSeleccionado?.id ?? ""}
                        onChange={(e) => {
                          const id = Number(e.currentTarget.value);
                          const found = ingredientesDisponibles.find(
                            (i) => i.id === id,
                          );
                          setIngredienteSeleccionado(found);
                        }}
                        className="flex-1 border border-gray-300 rounded-3xl px-5 py-3 outline-none text-sm bg-white
                        focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
                      >
                        {ingredientesDisponibles.map((i) => (
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
                    {!mostrarFormIngrediente ? (
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
                          onKeyDown={(e) =>
                            e.key === "Enter" && crearIngrediente()
                          }
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
                    )}

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
                )}

                {/* Combo: selección de productos */}
                {tipo === "combo" && (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700 px-1">
                      Productos Del Combo
                    </label>
                    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col gap-2">
                      {PRODUCTOS_EXISTENTES.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={productosCombo.includes(p.id)}
                            onChange={() => toggleProductoCombo(p.id)}
                            className="w-4 h-4 accent-trego-restaurante"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-trego-restaurante transition-colors">
                            {p.nombre}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.combo && (
                      <p className="text-xs text-red-500 px-2">
                        {errors.combo}
                      </p>
                    )}
                  </div>
                )}

                {/* Campos faltantes banner */}
                {Object.keys(errors).length > 0 && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>
                      Faltan campos por completar. Revisá los campos marcados en
                      rojo.
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3.5 px-6 rounded-3xl bg-trego-restaurante hover:bg-green-700
                    text-white text-base font-bold transition-all duration-200 shadow-md hover:shadow-green-200"
                  >
                    Confirmar Producto
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3.5 px-6 rounded-3xl bg-gray-100 hover:bg-gray-200
                    text-gray-600 text-base font-semibold transition-all duration-200"
                  >
                    Cancelar Producto
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
