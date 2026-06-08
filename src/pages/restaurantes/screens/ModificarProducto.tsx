import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageField } from "../../../components/typos/ImageField.js";
import type { DTOSubcategoria } from "../../../data/DTOSubcategoria.js";
import { EnumCategoriaProducto } from "../../../data/EnumCategoriaProducto.js";
import type { DTOProducto } from "../../../data/DTOProducto.js";
import { EnumTipoProducto } from "../../../data/EnumTipoProducto.js";
import AltaPlato from "../componentes/AltaPlato.js";
import AltaArticulo from "../componentes/AltaArticulo.js";
import AltaCombo from "../componentes/AltaCombo.js";
import ConfirmarEliminarProductoModal from "../componentes/ConfirmarEliminarProductoModal.js";
import type { DTOIngrediente } from "../../../data/DTOIngrediente.js";
import { useSubCategorias } from "../../../hooks/useSubCategorias.js";
import { useProductoRestaurante } from "../../../hooks/useProductoRestaurante.js";
import {
  eliminarProducto,
  modificarProducto,
  obtenerFirmaCloudinary,
} from "../../../api/apiRestaurante.js";

type StepState = "FORM" | "LOADING" | "SUCCESS";

// ─── Componente principal ──────────────────────────────────────
interface ModificarProductoProps {
  producto: DTOProducto;
  onReturn: () => void;
}

export default function ModificarProducto({
  producto,
  onReturn,
}: ModificarProductoProps) {
  const [step, setStep] = useState<StepState>("FORM");
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { subcategorias, subcategoriaSeleccionada, seleccionarSubcategoria } =
    useSubCategorias();
  const { productos } = useProductoRestaurante();

  // Nombre del producto a modificar
  const [nombre, setNombre] = useState(producto.nombre);
  // Precio del producto a modificar
  const [precio, setPrecio] = useState(producto.precio);
  // Foto del producto a modificar
  const [foto, setFoto] = useState<ImageField>({
    file: null,
    previewUrl: producto.urlImagen || null,
    cloudUrl: producto.urlImagen,
    uploadState: "idle",
  });
  // Categoria del Producto seleccionado
  const [categoriaProducto, setCategoriaProducto] =
    useState<EnumCategoriaProducto>(producto.categoria);
  // Descripcion del producto a modificar
  const [descripcion, setDescripcion] = useState(producto.descripcion);
  // SubCategoria del producto seleccionado a modificar
  const [subcategoriaSelect, setSubcategoriaSelect] = useState<
    DTOSubcategoria | undefined
  >(producto.subCategoria);

  // Estados para Plato (con ingredientes)
  // Tiempo de preparacion del Plato
  const [tiempoPreparacion, setTiempoPreparacion] = useState(
    producto.plato?.tiempoPreparacionMinutos,
  );
  // Lista de ingredientes que contiene el Plato
  const [listaIngredientes, setListaIngredientes] = useState<DTOIngrediente[]>(
    producto.ingredientes ?? [],
  );
  const listaIngredientesRef = useRef<DTOIngrediente[]>(
    producto.ingredientes ?? [],
  );

  const handleListaIngredientesChange = useCallback((lista: DTOIngrediente[]) => {
    listaIngredientesRef.current = lista;
    setListaIngredientes(lista);
  }, []);

  // Estados para Combo
  // Productos que conforman el Combo a modificar -- Viene como lista de numeros
  const [idProductosCombo, setIdProductosCombo] = useState<Number[]>(
    producto.combo?.productosIncluidosIds ?? [],
  );
  // Productos completos pertenecientes al combo
  const productosDelCombo = useMemo(() => {
    if (!productos || idProductosCombo.length === 0) return [];
    return idProductosCombo
      .map((id) => productos.find((p) => p.idProducto === id))
      .filter((p): p is DTOProducto => p != null);
  }, [productos, idProductosCombo]);

  // Lista completa de Productos que utiliza el combo
  const handleChangeListaProd = (nuevosProductos: DTOProducto[]) => {
    const nuevosIds = nuevosProductos
      .map((p) => p.idProducto)
      .filter((id): id is number => id != null); // descartamos undefined/null
    setIdProductosCombo(nuevosIds);
  };

  useEffect(() => {
    setFoto({
      file: null,
      previewUrl: producto.urlImagen || null,
      cloudUrl: producto.urlImagen,
      uploadState: "idle",
    });
  }, [producto.idProducto]);

  useEffect(() => {
    return () => {
      if (foto.previewUrl && foto.file) {
        URL.revokeObjectURL(foto.previewUrl);
      }
    };
  }, [foto.previewUrl]);
  /**
   * Maneja el cambio de imagen de la modificacion de producto
   * Si existe una imagen, la limpia antes de cargar la nueva, esta imagen viene desde el backend y es cargada desde setFoto
   * @param file archivo que se va a subir
   */
  const handleImageChange = (file: File | null) => {
    if (!file) {
      // Opcional: resetear la imagen si se elimina
      // setFoto({ file: null, previewUrl: null, cloudUrl: null, uploadState: "idle" });
      return;
    }

    // Liberar URL anterior
    if (foto.previewUrl) {
      URL.revokeObjectURL(foto.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setFoto({ file, previewUrl, uploadState: "uploading", cloudUrl: null });

    subirImagen(file, previewUrl); // No retorna nada → void
  };

  /**
   * Obtiene la firma del backend y procede a subir la imagen a cloudinary si salio todo bien
   * @param file archivo de donde se obtendran los datos para subir la imagen a cloudinary y firmar en el backend
   * @param previewUrl Preview para mostrar la imagen subida en pantalla del usuario
   */
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

      const cloudinaryRes = await fetch(datosBack.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryRes.ok) throw new Error("Cloudinary rechazó la imagen");

      const cloudinaryData = await cloudinaryRes.json();

      setFoto((prev) => ({
        ...prev,
        uploadState: "done",
        cloudUrl: cloudinaryData.secure_url,
      }));
    } catch (error) {
      console.error("Error en el proceso de imagen:", error);
      setFoto({ file, previewUrl, uploadState: "idle", cloudUrl: null });
      setErrors((p) => ({ ...p, foto: "Error al subir la imagen" }));
    }
  }

  /**
   * Valida los datos ingresados antes de Cargar el producto en el backend
   * @returns True si los datos obligatorios se encuentran cargados, False si faltan datos obligatorios
   */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (precio < 0 || isNaN(precio)) errs.precio = "Ingrese un precio válido.";
    if (!foto.cloudUrl && !foto.file) errs.foto = "La imagen es obligatoria.";

    if (producto.tipo === EnumTipoProducto.Plato) {
      // Plato con ingredientes
      if (!tiempoPreparacion || tiempoPreparacion < 0)
        errs.tiempoPreparacion = "Ingrese un tiempo válido.";
    }
    if (
      producto.tipo === EnumTipoProducto.Combo &&
      productosDelCombo.length === 0
    ) {
      errs.combo = "Seleccione al menos un producto para el combo.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setStep("LOADING");
    try {
      if (!foto.cloudUrl) {
        setApiError("Foto no cargada correctamente.");
        setStep("FORM");
        return;
      }
      if (!subcategoriaSelect?.idSubCategoria) {
        setApiError("Sin sub-categoría seleccionada.");
        setStep("FORM");
        return;
      }
      if (!producto.idProducto) {
        setApiError("El producto no tiene id válido.");
        setStep("FORM");
        return;
      }

      const data: DTOProducto = {
        idProducto: producto.idProducto,
        nombre,
        descripcion,
        precio,
        urlImagen: foto.cloudUrl,
        categoria: categoriaProducto ?? EnumCategoriaProducto.Bebida,
        idSubCategoria: subcategoriaSelect.idSubCategoria,
        tipo: producto.tipo,
      };

      switch (producto.tipo) {
        case EnumTipoProducto.Plato:
          data.ingredientes = listaIngredientesRef.current
            .filter((i) => i.idIngrediente != null)
            .map((i) => ({
              idIngrediente: i.idIngrediente!,
              nombre: i.nombre,
              idRestaurante: i.idRestaurante ?? producto.idRestaurante ?? 0,
            }));
          data.plato = {
            tiempoPreparacionMinutos: tiempoPreparacion ?? 0,
          };
          break;
        case EnumTipoProducto.Combo:
          data.combo = {
            productosIncluidosIds: productosDelCombo.map(
              (p) => p.idProducto ?? 0,
            ),
          };
          break;
      }

      await modificarProducto(data);
      setStep("SUCCESS");
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Error al guardar el producto.",
      );
      setStep("FORM");
    }
  };

  const handleAbrirModalEliminar = () => {
    if (!producto.idProducto) return;
    setErrorEliminar(null);
    setMostrarModalEliminar(true);
  };

  const handleCerrarModalEliminar = () => {
    if (eliminando) return;
    setMostrarModalEliminar(false);
    setErrorEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!producto.idProducto) return;

    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarProducto(producto.idProducto);
      setMostrarModalEliminar(false);
      onReturn();
    } catch (err) {
      setErrorEliminar(
        err instanceof Error ? err.message : "Error al eliminar el producto.",
      );
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-10 py-8 min-h-screen bg-gray-75">
        <div className="relative mb-2">
          <button
            type="button"
            onClick={onReturn} // o tu función de volver
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600 hover:text-trego-restaurante"
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
            Volver al Listado
          </button>

          <h1 className="text-3xl font-bold text-center">
            Modificar {producto.nombre}
          </h1>
        </div>

        {/* SUCCESS */}
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
              ¡Producto modificado!
            </h2>
            <p className="text-gray-500 text-center max-w-sm">
              Los cambios ya están guardados en tu menú.
            </p>
            <button
              onClick={onReturn}
              className="mt-2 px-8 py-3 rounded-3xl bg-trego-restaurante text-white font-bold hover:bg-green-700 transition-colors"
            >
              Volver al listado
            </button>
          </div>
        )}

        {/* LOADING */}
        {step === "LOADING" && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-trego-restaurante animate-spin" />
            <p className="text-sm text-gray-400">Guardando producto...</p>
          </div>
        )}

        {/* FORM */}
        {step === "FORM" && (
          <div className="bg-white rounded-3xl shadow-lg shadow-green-50 p-8 flex flex-col gap-1">
            {/* Renderizado condicional según tipo.id */}
            {producto.tipo === EnumTipoProducto.Plato && (
              <AltaPlato
                nombre={nombre}
                descripcion={descripcion}
                precio={precio}
                subcategoria={subcategoriaSelect}
                tiempoPreparacion={tiempoPreparacion ?? 0}
                foto={foto}
                onChangeNombre={setNombre}
                onChangeDescripcion={setDescripcion}
                onChangePrecio={setPrecio}
                onChangeSubCategoria={setSubcategoriaSelect}
                onChangeTiempoPrep={setTiempoPreparacion}
                onChangeImage={handleImageChange}
                onChangeListaDeIngredientes={handleListaIngredientesChange}
                error={errors}
                onChangeApiError={setApiError}
                categoria={categoriaProducto}
                onChangeCategoria={(item) =>
                  setCategoriaProducto(item ?? EnumCategoriaProducto.Otros)
                }
                subcategorias={subcategorias}
                ingredientesIniciales={listaIngredientes}
              />
            )}

            {producto.tipo === EnumTipoProducto.Articulo && (
              <AltaArticulo
                nombre={nombre}
                descripcion={descripcion}
                precio={precio}
                subcategorias={subcategorias}
                subcategoria={subcategoriaSelect}
                foto={foto}
                onChangeNombre={setNombre}
                onChangeDescripcion={setDescripcion}
                onChangePrecio={setPrecio}
                onChangeSubCategoria={setSubcategoriaSelect}
                onChangeImage={handleImageChange}
                error={errors}
                categoria={categoriaProducto}
                onChangeCategoria={(item) =>
                  setCategoriaProducto(item ?? EnumCategoriaProducto.Otros)
                }
              />
            )}

            {producto.tipo === EnumTipoProducto.Combo && (
              <AltaCombo
                nombre={nombre}
                descripcion={descripcion}
                precio={precio}
                subcategoria={subcategoriaSelect}
                foto={foto}
                onChangeNombre={setNombre}
                onChangeDescripcion={setDescripcion}
                onChangePrecio={setPrecio}
                onChangeSubCategoria={setSubcategoriaSelect}
                onChangeImage={handleImageChange}
                productosSeleccionados={productosDelCombo}
                onChangeListaProd={handleChangeListaProd}
                error={errors}
                onChangeApiError={setApiError}
                categoria={categoriaProducto}
                onChangeCategoria={(item) =>
                  setCategoriaProducto(item ?? EnumCategoriaProducto.Otros)
                }
                subcategorias={subcategorias}
              />
            )}

            {/* API Error */}
            {apiError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span>⚠</span> {apiError}
              </div>
            )}

            {/* Errores de validación generales */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                ⚠ Faltan campos por completar. Revisá los campos marcados en
                rojo.
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3.5 px-6 rounded-3xl bg-trego-restaurante hover:bg-green-700 text-white text-base font-bold transition-all duration-200 shadow-md"
              >
                Modificar Producto
              </button>
              <button
                type="button"
                onClick={handleAbrirModalEliminar}
                className="flex-1 py-3.5 px-6 rounded-3xl bg-trego-orange hover:bg-trego-cart text-white text-base font-semibold transition-all duration-200"
              >
                Eliminar Producto
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmarEliminarProductoModal
        abierto={mostrarModalEliminar}
        nombreProducto={producto.nombre}
        urlImagen={producto.urlImagen ?? null}
        eliminando={eliminando}
        error={errorEliminar}
        onCerrar={handleCerrarModalEliminar}
        onConfirmar={handleConfirmarEliminar}
      />
    </>
  );
}
