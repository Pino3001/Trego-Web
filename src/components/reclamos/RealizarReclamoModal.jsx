import { useEffect, useState } from 'react'
import ModalBase from '../carrito/ModalBase.jsx'
import { crearReclamo } from '../../api/reclamosApi.js'

export default function RealizarReclamoModal({
  abierto,
  pedido,
  nombreRestaurante,
  onCerrar,
  onExito,
}) {
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!abierto) return
    setMotivo('')
    setError(null)
    setEnviando(false)
  }, [abierto, pedido?.idPedido])

  async function handleEnviar(e) {
    e.preventDefault()
    const texto = motivo.trim()
    if (!texto) {
      setError('Ingresá el motivo del reclamo.')
      return
    }
    if (texto.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres.')
      return
    }
    if (!pedido?.idPedido) return

    setEnviando(true)
    setError(null)
    try {
      await crearReclamo({ idPedido: pedido.idPedido, texto })
      onExito?.(pedido.idPedido)
      onCerrar?.()
    } catch (err) {
      if (err?.code === 'RECLAMO_YA_EXISTE') {
        onExito?.(pedido.idPedido)
        onCerrar?.()
        return
      }
      setError(err instanceof Error ? err.message : 'No se pudo enviar el reclamo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      abierto={abierto}
      onCerrar={onCerrar}
      ariaLabel="Realizar reclamo"
      zIndex={75}
    >
      <form
        onSubmit={handleEnviar}
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <h2 className="text-lg font-bold text-gray-900">Realizar reclamo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pedido #{pedido?.idPedido ?? '—'}
          {nombreRestaurante ? ` · ${nombreRestaurante}` : ''}
        </p>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Motivo del reclamo</span>
          <textarea
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value)
              setError(null)
            }}
            rows={5}
            maxLength={2000}
            placeholder="Contanos qué pasó con tu pedido..."
            className="resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-trego-orange focus:outline-none focus:ring-2 focus:ring-orange-100"
            disabled={enviando}
          />
          <span className="text-xs text-gray-400">Mínimo 10 caracteres</span>
        </label>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-trego-orange px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600 disabled:opacity-50"
          >
            {enviando ? 'Enviando…' : 'Enviar reclamo'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
