import React, { useMemo, useState } from 'react'
import ModalBase, { Z_MODAL } from './ModalBase'
import { useCarrito } from '../../context/CarritoContext'

function obtenerIngredientes(producto) {
  if (producto?.ingredientes?.length) {
    return producto.ingredientes.map((i) => (typeof i === 'string' ? i : i.nombre)).filter(Boolean)
  }
  return []
}

export default function DetalleProductoModal() {
  const {
    productoEnDetalle,
    restauranteDelDetalle,
    cerrarDetalleProducto,
    agregarProductoAlCarrito,
    modalSuperior,
  } = useCarrito()

  const abierto = !!productoEnDetalle
  const producto = productoEnDetalle

  const [cantidad, setCantidad] = useState(1)
  const [comentarios, setComentarios] = useState('')
  const [quitados, setQuitados] = useState([])

  const ingredientes = useMemo(() => obtenerIngredientes(producto), [producto])

  function toggleQuitado(nombre) {
    setQuitados((prev) => (prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre]))
  }

  function cerrar() {
    setCantidad(1)
    setComentarios('')
    setQuitados([])
    cerrarDetalleProducto()
  }

  function agregar() {
    agregarProductoAlCarrito(
      { producto, cantidad, comentarios, ingredientesQuitados: quitados },
      restauranteDelDetalle,
    )
    cerrar()
  }

  return (
    <ModalBase
      abierto={abierto}
      onCerrar={cerrar}
      ariaLabel="Detalle del producto"
      zIndex={Z_MODAL.detalle}
      escucharEscape={modalSuperior === 'detalle'}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <img
            src={producto?.fotoPlato}
            alt={producto?.nombre}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover bg-gray-200"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-extrabold text-gray-900">{producto?.nombre}</h2>
            <p className="mt-1 text-[13px] text-gray-600">{producto?.descripcion}</p>
            <p className="mt-2 text-[18px] font-extrabold text-trego-brown">{producto?.precio}$</p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] p-4">
            <p className="text-[12px] font-extrabold text-gray-800">Cantidad</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white text-[18px] font-black text-gray-700 hover:bg-gray-50"
              >
                -
              </button>
              <div className="min-w-[52px] text-center text-[18px] font-extrabold text-gray-900">
                {cantidad}
              </div>
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white text-[18px] font-black text-gray-700 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-[12px] font-extrabold text-gray-800">Ingredientes</p>
            {ingredientes.length === 0 ? (
              <p className="mt-2 text-[12px] text-gray-500">Este producto no tiene ingredientes configurados.</p>
            ) : (
            <p className="mt-1 text-[12px] text-gray-500">Tocá para quitar.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {ingredientes.map((ing) => {
                const quitado = quitados.includes(ing)
                return (
                  <button
                    type="button"
                    key={ing}
                    onClick={() => toggleQuitado(ing)}
                    className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${
                      quitado
                        ? 'bg-gray-200 text-gray-500 line-through'
                        : 'bg-trego-orange/10 text-trego-orange hover:bg-trego-orange/15'
                    }`}
                  >
                    {ing}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-[12px] font-extrabold text-gray-800">Comentarios (opcional)</p>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Ej: sin sal, bien cocido, etc."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-[#fafafa] p-3 text-[13px] outline-none focus:border-trego-orange"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[13px] text-gray-500">
            Subtotal:{' '}
            <span className="font-extrabold text-gray-900">{(producto?.precio ?? 0) * cantidad}$</span>
          </p>
          <button
            type="button"
            onClick={agregar}
            className="rounded-full bg-trego-orange px-6 py-3 text-[13px] font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99]"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

