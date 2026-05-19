import { CATEGORIAS_MENU, ORDEN_PRECIO } from '../../constants/categoriasProducto'

export default function MenuSidebar({
  categoria,
  onCategoriaChange,
  ordenPrecio,
  onOrdenChange,
}) {
  return (
    <aside className="w-full shrink-0 rounded-2xl bg-trego-sidebar p-4 shadow-sm lg:w-[200px] lg:p-5">
      <section className="mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-gray-900">Categorias</h2>
        <ul className="space-y-0.5">
          {CATEGORIAS_MENU.map(({ id, label }) => (
            <li key={id || 'todas'}>
              <button
                type="button"
                onClick={() => onCategoriaChange(id)}
                className={`w-full py-1.5 text-left text-[14px] transition ${
                  categoria === id
                    ? 'font-bold text-gray-900'
                    : 'font-normal text-gray-600 hover:text-trego-orange'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-bold text-gray-900">Ordenar por Precio</h2>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() =>
                onOrdenChange(
                  ordenPrecio === ORDEN_PRECIO.MAYOR ? ORDEN_PRECIO.NINGUNO : ORDEN_PRECIO.MAYOR,
                )
              }
              className={`w-full py-1.5 text-left text-[14px] transition ${
                ordenPrecio === ORDEN_PRECIO.MAYOR
                  ? 'font-bold text-gray-900'
                  : 'font-normal text-gray-600 hover:text-gray-900'
              }`}
            >
              Mayor Precio
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() =>
                onOrdenChange(
                  ordenPrecio === ORDEN_PRECIO.MENOR ? ORDEN_PRECIO.NINGUNO : ORDEN_PRECIO.MENOR,
                )
              }
              className={`w-full py-1.5 text-left text-[14px] transition ${
                ordenPrecio === ORDEN_PRECIO.MENOR
                  ? 'font-bold text-gray-900'
                  : 'font-normal text-gray-600 hover:text-gray-900'
              }`}
            >
              Menor Precio
            </button>
          </li>
        </ul>
      </section>
    </aside>
  )
}
