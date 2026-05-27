import React, { useEffect, useState } from 'react'
import ModalBase, { Z_MODAL } from './ModalBase'
import { useCarrito } from '../../context/CarritoContext'

export default function PagoModal() {
  const {
    pagoModalAbierto,
    cerrarModalPago,
    setMensajeCarrito,
    modalSuperior,
    confirmarPedidoYpagar,
  } = useCarrito()

  const [estado, setEstado] = useState('esperando') // esperando | procesando | exito | rechazado | error
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (!pagoModalAbierto) {
      setEstado('esperando')
      setErrorMsg(null)
      return
    }

    let cancelado = false

    async function procesarPago() {
      setEstado('procesando')
      setErrorMsg(null)
      try {
        const preferencia = await confirmarPedidoYpagar()
        if (cancelado) return

        const url = preferencia?.sandboxInitPoint || preferencia?.initPoint
        if (url) {
          window.location.href = url
          return
        }

        setEstado('error')
        setErrorMsg('No se recibió la URL de pago del servidor.')
      } catch (err) {
        if (cancelado) return
        setEstado('error')
        setErrorMsg(err instanceof Error ? err.message : 'No se pudo procesar el pago.')
      }
    }

    procesarPago()
    return () => {
      cancelado = true
    }
  }, [pagoModalAbierto, confirmarPedidoYpagar])

  function cerrar() {
    cerrarModalPago()
    setEstado('esperando')
    setErrorMsg(null)
  }

  function volverAlCarrito() {
    cerrar()
    setMensajeCarrito(errorMsg ?? 'No se pudo iniciar el pago.')
  }

  return (
    <ModalBase
      abierto={pagoModalAbierto}
      onCerrar={cerrar}
      ariaLabel="Pago"
      zIndex={Z_MODAL.pago}
      escucharEscape={modalSuperior === 'pago'}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-gray-900">Pago electrónico</h2>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        {estado === 'procesando' && (
          <div className="mt-8 flex flex-col items-center gap-4 py-10">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-trego-orange" />
            <p className="text-[13px] text-gray-600">Confirmando pedido y redirigiendo a Mercado Pago…</p>
          </div>
        )}

        {estado === 'error' && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-[14px] font-extrabold text-red-700">No se pudo iniciar el pago</p>
            <p className="mt-1 text-[13px] text-red-600">{errorMsg}</p>
            <button
              type="button"
              onClick={volverAlCarrito}
              className="mt-5 w-full rounded-full bg-trego-orange px-6 py-3 text-[13px] font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99]"
            >
              Volver al carrito
            </button>
          </div>
        )}
      </div>
    </ModalBase>
  )
}
