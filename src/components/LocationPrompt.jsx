export default function LocationPrompt({ onActivar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onCancelar}
        aria-label="Cerrar"
      />
      <div className="relative max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-bold text-gray-900">Activar ubicación</h2>
        <p className="mb-6 text-sm text-gray-600">
          Para mostrarte los restaurantes que reparten en tu zona, necesitamos acceso a tu
          ubicación.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onActivar}
            className="flex-1 rounded-xl bg-trego-orange py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Activar
          </button>
        </div>
      </div>
    </div>
  )
}
