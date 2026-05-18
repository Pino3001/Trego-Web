export default function EmptyState({ mensaje = 'No hay nada para mostrar', onLimpiarFiltros }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center">
      <p className="text-lg font-medium text-gray-600">{mensaje}</p>
      {onLimpiarFiltros && (
        <button
          type="button"
          onClick={onLimpiarFiltros}
          className="mt-4 rounded-xl bg-trego-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
