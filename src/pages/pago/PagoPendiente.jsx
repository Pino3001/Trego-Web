import { useNavigate, useSearchParams } from 'react-router'
import Header from '../../components/body/Header.js'

export default function PagoPendiente() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const paymentId = params.get('payment_id') || params.get('collection_id')
  const status = params.get('status') || params.get('collection_status')
  const externalReference =
    params.get('external_reference') ||
    params.get('externalReference') ||
    params.get('idPedido') ||
    params.get('pedidoId') ||
    sessionStorage.getItem('trego_ultimo_pedido_pago')

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl shadow-yellow-100">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-3xl font-bold">
              ⏳
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              Pago pendiente
            </h1>
            <p className="text-sm text-gray-500">
              Tu pago está siendo procesado por Mercado Pago. Te confirmamos cuando se acredite.
            </p>

            <div className="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-[13px] text-gray-600">
              {externalReference && (
                <p>
                  <span className="font-semibold">N° de pedido:</span> {externalReference}
                </p>
              )}
              {paymentId && (
                <p>
                  <span className="font-semibold">N° de pago:</span> {paymentId}
                </p>
              )}
              {status && (
                <p>
                  <span className="font-semibold">Estado MP:</span> {status}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/restaurantes')}
              className="mt-6 w-full rounded-full bg-trego-orange px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
