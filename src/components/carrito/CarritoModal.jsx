import React, { useEffect, useMemo, useState } from 'react'
import ModalBase, { Z_MODAL } from './ModalBase'
import { useCarrito } from '../../context/CarritoContext'
import { esLabelSoloCoordenadas, resolverDireccionDesdeCoords } from '../../api/mapeadores'

function formatearMoneda(n) {
  const num = Number(n) || 0
  return `${num}$`
}

function IngredientesChips({ ingredientesQuitados, onChange }) {
  const quitados = ingredientesQuitados ?? []
  if (!quitados.length) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {quitados.map((q) => (
        <span
          key={q}
          className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-600 line-through"
        >
          {q}
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange?.([])}
        className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-extrabold text-gray-500 hover:bg-gray-200"
      >
        Limpiar
      </button>
    </div>
  )
}

export default function CarritoModal({ restauranteAbierto }) {
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
  } = useCarrito()

  const [editandoId, setEditandoId] = useState(null)
  const [comentarioTmp, setComentarioTmp] = useState('')

  const carritoVacio = items.length === 0

  const direccionLabel = useMemo(() => {
    if (!direccionSeleccionada) return null
    return direccionSeleccionada.nombre ?? 'Ubicación actual'
  }, [direccionSeleccionada])

  useEffect(() => {
    if (
      !carritoAbierto ||
      direccionSeleccionada?.tipo !== 'actual' ||
      !direccionSeleccionada?.coords ||
      !esLabelSoloCoordenadas(direccionSeleccionada.nombre)
    ) {
      return
    }
    let cancelado = false
    resolverDireccionDesdeCoords(direccionSeleccionada.coords).then((resuelta) => {
      if (cancelado) return
      setDireccionSeleccionada({
        ...direccionSeleccionada,
        nombre: resuelta.nombre,
        datos: resuelta.datos,
      })
    })
    return () => {
      cancelado = true
    }
  }, [carritoAbierto, direccionSeleccionada, setDireccionSeleccionada])

  function cerrar() {
    setMensajeCarrito(null)
    setEditandoId(null)
    setComentarioTmp('')
    cerrarCarrito()
  }

  function pedirDireccion() {
    abrirModalDireccion()
  }

  function intentarPagar() {
    const abierto = validarRestauranteAbierto(typeof restauranteAbierto === 'boolean' ? restauranteAbierto : undefined)
    if (!abierto) {
      setMensajeCarrito('El Restaurante está cerrado y no se encuentra disponible para recibir pedidos.')
      vaciarCarrito()
      return
    }
    abrirModalPago()
  }

  function realizarPedido() {
    if (carritoVacio) return
    if (!direccionSeleccionada) {
      pedirDireccion()
      return
    }
    intentarPagar()
  }

  function abrirEditorComentario(item) {
    setEditandoId(item.idProducto)
    setComentarioTmp(item.comentarios ?? '')
  }

  function guardarComentario() {
    if (!editandoId) return
    cambiarComentarios(editandoId, comentarioTmp)
    setEditandoId(null)
    setComentarioTmp('')
  }

  return (
    <ModalBase
      abierto={carritoAbierto}
      onCerrar={cerrar}
      ariaLabel="Carrito"
      className="max-w-[520px]"
      zIndex={Z_MODAL.carrito}
      escucharEscape={modalSuperior === 'carrito'}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-gray-900">Carrito</h2>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        {mensajeCarrito && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-[13px] font-bold ${
              mensajeCarrito.includes('seleccionad') || mensajeCarrito.includes('correctamente')
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-orange-200 bg-orange-50 text-orange-800'
            }`}
          >
            {mensajeCarrito}
          </div>
        )}

        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-[12px] font-extrabold text-gray-600">Dirección</p>
              <p className="mt-0.5 text-[13px] font-extrabold text-gray-900">
                {direccionLabel ?? 'Sin seleccionar'}
              </p>
            </div>
            <button
              type="button"
              onClick={pedirDireccion}
              className="rounded-full border border-gray-200 bg-white px-4 py-3 text-[12px] font-extrabold text-gray-700 hover:bg-gray-50"
            >
              Elegir dirección
            </button>
          </div>

          {cargandoCarrito ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-trego-orange" />
              <p className="text-[13px] text-gray-500">Cargando carrito…</p>
            </div>
          ) : carritoVacio ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-gray-600">
              No hay productos en el carrito :(
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((it) => (
                <div
                  key={it.idProducto}
                  className="flex items-stretch gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <img
                    src={it.fotoPlato}
                    alt={it.nombre}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover bg-gray-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-gray-900">{it.nombre}</p>
                        <p className="mt-0.5 text-[12px] text-gray-500">
                          Total: <span className="font-extrabold text-gray-900">{formatearMoneda(it.precio * it.cantidad)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditorComentario(it)}
                          className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-gray-600 hover:bg-gray-50"
                          title="Editar comentario"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(it.idProducto)}
                          className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 hover:bg-red-100"
                          title="Eliminar producto"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <IngredientesChips
                      ingredientesQuitados={it.ingredientesQuitados}
                      onChange={(val) => cambiarIngredientesQuitados(it.idProducto, val)}
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(it.idProducto, (it.cantidad ?? 1) - 1)}
                          className="h-9 w-9 rounded-full border border-gray-200 bg-white text-[16px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <div className="min-w-[38px] text-center text-[14px] font-extrabold text-gray-900">
                          {it.cantidad}
                        </div>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(it.idProducto, (it.cantidad ?? 1) + 1)}
                          className="h-9 w-9 rounded-full border border-gray-200 bg-white text-[16px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[13px] font-extrabold text-gray-900">{formatearMoneda(it.precio)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!carritoVacio && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-[#f5f5f5] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-extrabold text-gray-900">Total :</p>
              <p className="text-[16px] font-extrabold text-red-600">{formatearMoneda(total)}</p>
            </div>
            <button
              type="button"
              onClick={realizarPedido}
              disabled={carritoVacio}
              className="mt-4 w-full rounded-full bg-trego-orange px-6 py-3 text-[13px] font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
            >
              {direccionSeleccionada ? 'REALIZAR PAGO' : 'REALIZAR PEDIDO'}
            </button>
          </div>
        )}

        {editandoId && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-[12px] font-extrabold text-gray-800">Comentario del producto</p>
            <textarea
              value={comentarioTmp}
              onChange={(e) => setComentarioTmp(e.target.value)}
              placeholder="Ej: sin sal, sin cebolla..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-[#fafafa] p-3 text-[13px] outline-none focus:border-trego-orange"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null)
                  setComentarioTmp('')
                }}
                className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-3 text-[13px] font-extrabold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarComentario}
                className="flex-1 rounded-full bg-trego-orange px-6 py-3 text-[13px] font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99]"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  )
}

