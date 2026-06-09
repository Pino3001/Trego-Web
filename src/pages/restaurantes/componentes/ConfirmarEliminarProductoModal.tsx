import { AlertTriangle, Trash2 } from "lucide-react";
import ModalBase from "../../../components/carrito/ModalBase.jsx";

interface ConfirmarEliminarProductoModalProps {
  abierto: boolean;
  nombreProducto: string;
  urlImagen?: string | null;
  eliminando?: boolean;
  error?: string | null;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export default function ConfirmarEliminarProductoModal({
  abierto,
  nombreProducto,
  urlImagen,
  eliminando = false,
  error = null,
  onCerrar,
  onConfirmar,
}: ConfirmarEliminarProductoModalProps) {
  return (
    <ModalBase
      abierto={abierto}
      onCerrar={eliminando ? undefined : onCerrar}
      ariaLabel="Confirmar eliminación de producto"
      escucharEscape={!eliminando}
      zIndex={75}
      className="max-w-md overflow-hidden shadow-green-50"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-8 ring-orange-50/60">
            <Trash2 className="h-8 w-8 text-trego-orange" strokeWidth={2} />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            ¿Deshabilitar producto?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            El producto ya no sera visible para los clientes.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {urlImagen ? (
              <img
                src={urlImagen}
                alt={nombreProducto}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <Trash2 className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Producto a deshabilitar
            </p>
            <p className="truncate text-base font-bold text-gray-900">
              {nombreProducto}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Si este producto forma parte de un combo, revisá que tu menú siga
            completo después de deshabilitarlo.
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCerrar}
            disabled={eliminando}
            className="flex-1 rounded-3xl border border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={eliminando}
            className="flex-1 rounded-3xl bg-trego-orange px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-trego-cart disabled:opacity-50"
          >
            {eliminando ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando...
              </span>
            ) : (
              "Sí, deshabilitar"
            )}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
