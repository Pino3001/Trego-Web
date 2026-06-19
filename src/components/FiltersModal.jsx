import { useEffect, useState } from 'react'
import { CATEGORIAS_RESTAURANTE, CALIFICACIONES_FILTRO } from '../constants/categorias'
import { FILTROS_INICIALES } from '../utils/filtrosRestaurantes.js'

export default function FiltersModal({ abierto, filtros, onCerrar, onAplicar }) {
  const [local, setLocal] = useState(filtros)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (abierto) setLocal(filtros)
  }, [abierto, filtros])

  if (!abierto) return null

  const handleAplicar = () => {
    onAplicar(local)
    onCerrar()
  }

  const handleLimpiar = () => {
    setLocal({ ...FILTROS_INICIALES })
    onAplicar({ ...FILTROS_INICIALES })
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onCerrar}
        aria-label="Cerrar filtros"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Aplicar filtros</h2>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Categoría del restaurante
          </span>
          <select
            value={local.categoria}
            onChange={(e) => setLocal({ ...local, categoria: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_RESTAURANTE.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-gray-700">
            Clasificación (estrellas mínimas)
          </legend>
          <div className="flex flex-wrap gap-2">
            {CALIFICACIONES_FILTRO.map(({ value, label }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                  local.calificacionMin === value
                    ? 'border-trego-orange bg-trego-orange text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="calificacion"
                  value={value}
                  checked={local.calificacionMin === value}
                  onChange={() => setLocal({ ...local, calificacionMin: value })}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-gray-700">
            Rango de precio de platos ($)
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Mínimo"
              value={local.precioMin}
              onChange={(e) => setLocal({ ...local, precioMin: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <span className="text-gray-500">a</span>
            <input
              type="number"
              min="0"
              placeholder="Máximo"
              value={local.precioMax}
              onChange={(e) => setLocal({ ...local, precioMax: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Aplica a búsqueda de platos y a la sección Mejores ofertas.
          </p>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-gray-700">
            Horario de atención
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={local.horarioDesde}
              onChange={(e) => setLocal({ ...local, horarioDesde: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm"
            />
            <span className="text-gray-500">a</span>
            <input
              type="time"
              value={local.horarioHasta}
              onChange={(e) => setLocal({ ...local, horarioHasta: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm"
            />
          </div>
        </fieldset>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Ordenamiento
          </span>
          <select
            value={local.ordenamiento}
            onChange={(e) => setLocal({ ...local, ordenamiento: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="calificacion_desc">Mejor calificación</option>
            <option value="calificacion_asc">Menor calificación</option>
            <option value="nombre_asc">Nombre A-Z</option>
            <option value="nombre_desc">Nombre Z-A</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLimpiar}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleAplicar}
            className="flex-1 rounded-xl bg-trego-orange py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
