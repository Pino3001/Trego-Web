import React, { useEffect, useMemo, useState } from "react";
import ModalBase, { Z_MODAL } from "./ModalBase.jsx";
import {
  esLabelSoloCoordenadas,
  resolverDireccionDesdeCoords,
} from "../../api/mapeadores.js";
import { useCarrito } from "../../context/CarritoContext.js";
import type { DTOIngrediente } from "../../data/DTOIngrediente.js";
import type { DTOProductoPedido } from "../../data/DTOProductoPedido.js";
import { EnumTipoProducto } from "../../data/EnumTipoProducto.js";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DetalleCombo } from "./DetalleCombo.js";
import { obtenerPrecios } from "../../utils/productos.js";

// ---------------------------------------------------------------------------
// INTERFACES
// ---------------------------------------------------------------------------

interface IngredientesChipsProps {
  ingredientesQuitados?: DTOIngrediente[];
  onChange?: (val: DTOIngrediente[]) => void;
}

interface ItemCarritoProps {
  item: DTOProductoPedido;
  onEditar: (item: DTOProductoPedido) => void;
  onEliminar: (id: number) => void;
  onCambiarCantidad: (id: number, cantidad: number) => void;
  onCambiarIngredientes: (id: number, ingredientes: DTOIngrediente[]) => void;
}

// ---------------------------------------------------------------------------
// CLASES TAILWIND (extraídas del render para evitar repetición)
// ---------------------------------------------------------------------------

const CLS = {
  btnEditar:
    "rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-gray-500 hover:bg-gray-50 transition-colors",
  btnEliminar:
    "rounded-xl border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-500 hover:bg-red-100 transition-colors",
} as const;

/** Clases del banner de mensaje según si es positivo o de advertencia */
function clsBanner(positivo: boolean): string {
  return `mt-4 rounded-2xl border px-4 py-3 text-[13px] font-bold ${
    positivo
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-orange-100 bg-orange-50 text-orange-800"
  }`;
}

// ---------------------------------------------------------------------------
// FUNCIONES AUXILIARES
// ---------------------------------------------------------------------------

function formatearMoneda(n: number | string | undefined | null): string {
  const num = Number(n) || 0;
  return `${num} $`;
}

function esMensajePositivo(mensaje: string): boolean {
  return mensaje.includes("seleccionad") || mensaje.includes("correctamente");
}

/** Extrae el id real del producto, contemplando variaciones de la API */
function extraerIdItem(item: DTOProductoPedido): number {
  return item.producto?.idProducto || (item.producto as any)?.id || 0;
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTES
// ---------------------------------------------------------------------------

function IngredientesChips({
  ingredientesQuitados,
  onChange,
}: IngredientesChipsProps): React.JSX.Element | null {
  const quitados = ingredientesQuitados ?? [];
  if (!quitados.length) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {quitados.map((q) => (
        <span
          key={q.nombre}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 line-through"
        >
          {q.nombre}
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange?.([])}
        className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-extrabold text-gray-400 hover:bg-gray-200 transition-colors"
      >
        Limpiar
      </button>
    </div>
  );
}

function ItemCarrito({
  item,
  onEditar,
  onEliminar,
  onCambiarCantidad,
  onCambiarIngredientes,
}: ItemCarritoProps): React.JSX.Element {
  const idReal = extraerIdItem(item);
  const cantidad = item.cantidad || 1;
  const { tieneOferta, conDescuento, original } = obtenerPrecios(
    item.producto ?? {},
  );

  return (
    <div className="flex items-stretch gap-6 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
      <img
        src={item.producto?.urlImagen}
        alt={item.producto?.nombre}
        className="h-17 w-17 shrink-0 rounded-xl my-auto object-cover bg-gray-100"
      />

      <div className="flex flex-col m-auto items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarCantidad(idReal, cantidad + 1)}
          className="h-7 w-7 rounded-full border-[1.5px] border-trego-orange bg-orange-50 
               flex items-center justify-center
               text-trego-orange hover:bg-orange-100 active:scale-95 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <ChevronUp size={16} />
        </button>

        <span className="min-w-8 text-center text-[14px] font-extrabold text-gray-900">
          {cantidad}
        </span>

        <button
          type="button"
          onClick={() => onCambiarCantidad(idReal, cantidad - 1)}
          className="h-7 w-7 rounded-full border-[1.5px] border-trego-orange bg-orange-50 
               flex items-center justify-center
               text-trego-orange hover:bg-orange-100 active:scale-95 transition-colors"
          aria-label="Disminuir cantidad"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <p className="truncate text-[14px] font-extrabold text-gray-900">
          {item.producto?.nombre}
        </p>
        <p className="text-[12px] text-gray-400">
          Precio unidad:{" "}
          <span className="font-extrabold text-gray-700">
            {formatearMoneda(conDescuento)}
          </span>
        </p>
        {/* Ingredientes quitados (solo para Platos) */}
        {item.producto?.tipo === EnumTipoProducto.Plato && (
          <IngredientesChips
            ingredientesQuitados={item.ingredientesAQuitar ?? []}
            onChange={(val) => onCambiarIngredientes(idReal, val)}
          />
        )}
        {/* Detalle de productos incluidos (solo para Combos) */}
        {item.producto?.tipo === EnumTipoProducto.Combo &&
          item.producto.combo && (
            <DetalleCombo
              productos={item.producto.combo.productosIncluidos ?? []}
            />
          )}
      </div>
      <div className="flex flex-col gap-5 justify-between">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditar(item)}
            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-extrabold 
                        text-gray-500 hover:bg-gray-50 transition-colors"
            title="Agregar nota al producto"
          >
            Nota
          </button>
          <button
            type="button"
            onClick={() => onEliminar(idReal)}
            className="rounded-xl border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold 
                          text-red-500 hover:bg-red-100 transition-colors"
            title="Eliminar producto"
          >
            Eliminar
          </button>
        </div>
        <div className="mt-3 flex ml-auto items-center justify-between gap-3">
          <p className="text-[13px] text-end text-gray-400">
            Subtotal:{" "}
            <span className="font-extrabold text-gray-900">
              {formatearMoneda(item.subtotal)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------

export default function CarritoModal(): React.JSX.Element {
  const {
    carritoAbierto,
    cerrarCarrito,
    items,
    total,
    direccionSeleccionada,
    setDireccionSeleccionada,
    abrirModalDireccion,
    abrirModalPago,
    eliminarProducto,
    cambiarCantidad,
    cambiarComentarios,
    cambiarIngredientesQuitados,
    vaciarCarrito,
    mensajeCarrito,
    setMensajeCarrito,
    validarRestauranteAbierto,
    modalSuperior,
    cargandoCarrito,
    restauranteAbierto,
  } = useCarrito();

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNombre, setEditandoNombre] = useState<string>("");
  const [comentarioTmp, setComentarioTmp] = useState<string>("");

  const carritoVacio = items.length === 0;

  // ── Generador del Label de Dirección ──
  const direccionLabel = useMemo(() => {
    if (!direccionSeleccionada?.data) return "Sin dirección seleccionada";
    const { calle, numero } = direccionSeleccionada.data;
    if (!calle) return "Ubicación actual";
    return `${calle} ${numero ?? ""}`.trim();
  }, [direccionSeleccionada]);

  // ── Efecto para resolver coordenadas a dirección real ──
  useEffect(() => {
    const data = direccionSeleccionada?.data;

    if (!carritoAbierto || !data?.latitud || !data?.longitud) return;
    if (direccionSeleccionada?.tipo !== "actual") return;

    const tieneCalleValida = data.calle && !esLabelSoloCoordenadas(data.calle);
    if (tieneCalleValida) return;

    let cancelado = false;
    const cords = { latitud: data.latitud, longitud: data.longitud };

    resolverDireccionDesdeCoords(cords).then((resuelta: any) => {
      if (cancelado) return;

      setDireccionSeleccionada((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tipo: resuelta.nombre || "actual",
          data: {
            ...prev.data,
            ...resuelta.datos,
          },
        };
      });
    });

    return () => {
      cancelado = true;
    };
  }, [carritoAbierto, direccionSeleccionada, setDireccionSeleccionada]);

  // --- Handlers ---

  function cerrar(): void {
    setMensajeCarrito(null);
    cancelarEdicion();
    cerrarCarrito();
  }

  function intentarPagar(): void {
    if (!restauranteAbierto) {
      setMensajeCarrito(
        "El Restaurante está cerrado y no se encuentra disponible para recibir pedidos.",
      );
      vaciarCarrito();
      return;
    }
    abrirModalPago();
  }

  function realizarPedido(): void {
    if (carritoVacio) return;
    if (!direccionSeleccionada) {
      abrirModalDireccion();
      return;
    }
    intentarPagar();
  }

  function abrirEditorComentario(item: DTOProductoPedido): void {
    setEditandoId(item.producto?.idProducto ?? 0);
    setEditandoNombre(item.producto?.nombre ?? "Producto");
    setComentarioTmp(item.observaciones ?? "");
  }

  function guardarComentario(): void {
    if (!editandoId) return;
    cambiarComentarios(editandoId, comentarioTmp);
    cancelarEdicion();
  }

  function cancelarEdicion(): void {
    setEditandoId(null);
    setEditandoNombre("");
    setComentarioTmp("");
  }

  function cambiarCantidadItem(id: number, x: number): void {
    cambiarCantidad(id, x);
    if (x <= 0) {
      setComentarioTmp("");
      setEditandoId(null);
    }
  }

  return (
    <ModalBase
      abierto={carritoAbierto}
      onCerrar={cerrar}
      ariaLabel="Carrito"
      className="max-w-160"
      zIndex={Z_MODAL?.carrito ?? 50}
      escucharEscape={modalSuperior === "carrito"}
    >
      <div className="p-4 sm:p-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-gray-900">Carrito</h2>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Banner de mensaje */}
        {mensajeCarrito && (
          <div
            className={`${clsBanner(esMensajePositivo(mensajeCarrito))} mt-2`}
          >
            {mensajeCarrito}
          </div>
        )}

        {/* Sección de dirección */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-1.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e85d04"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-400">
              Entrega en
            </p>
            <p className="truncate text-[13px] font-extrabold text-gray-900">
              {direccionLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalDireccion}
            className="shrink-0 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Cambiar
          </button>
        </div>

        {/* Lista de items scrolleable */}
        <div className="mt-3 max-h-170 overflow-y-auto pr-1 flex flex-col gap-2.5 custom-scrollbar">
          {cargandoCarrito ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-trego-orange" />
              <p className="text-[13px] text-gray-400">Cargando carrito…</p>
            </div>
          ) : carritoVacio ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <p className="text-[13px] font-bold text-gray-400">
                No hay productos en el carrito
              </p>
              <p className="mt-1 text-[12px] text-gray-300">
                ¡Agregá algo para comenzar!
              </p>
            </div>
          ) : (
            items.map((item: DTOProductoPedido) => (
              <ItemCarrito
                key={extraerIdItem(item)}
                item={item}
                onEditar={abrirEditorComentario}
                onEliminar={eliminarProducto}
                onCambiarCantidad={cambiarCantidadItem}
                onCambiarIngredientes={cambiarIngredientesQuitados}
              />
            ))
          )}
        </div>

        {/* Total y botón de pago */}
        {!carritoVacio && (
          <div className="mt-4 rounded-2xl border border-orange-100 bg-[#fff8f4] px-4 pt-2 pb-4">
            <div className="flex pb-2 items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-orange-400">
                Total del pedido
              </p>
              <p className="text-[20px] font-extrabold text-gray-900">
                {formatearMoneda(total)}
              </p>
            </div>
            <button
              type="button"
              onClick={realizarPedido}
              disabled={carritoVacio}
              className="w-full rounded-full bg-trego-orange py-3 text-[13px] font-extrabold text-white shadow-sm hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 transition-colors"
            >
              {direccionSeleccionada ? "Realizar pago" : "Realizar pedido"}
            </button>
          </div>
        )}

        {/* Editor de notas */}
        {editandoId && (
          <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[12px] font-extrabold text-gray-600">
                Nota para
              </p>
              <span className="max-w-50 truncate rounded-xl bg-gray-100 px-3 py-1 text-[12px] font-extrabold text-gray-800">
                {editandoNombre}
              </span>
            </div>
            <textarea
              value={comentarioTmp}
              onChange={(e) => setComentarioTmp(e.target.value)}
              placeholder="Ej: sin sal, sin cebolla..."
              rows={2}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-[#fafafa] p-3 text-[13px] outline-none focus:border-trego-orange transition-colors"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={cancelarEdicion}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-extrabold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarComentario}
                className="flex-1 rounded-full bg-trego-orange px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm hover:bg-orange-600 active:scale-[0.99] transition-colors"
              >
                Guardar nota
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
}
