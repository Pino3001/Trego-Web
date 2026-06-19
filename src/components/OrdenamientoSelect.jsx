import { OPCIONES_ORDEN } from '../utils/filtrosRestaurantes.js'

export default function OrdenamientoSelect({ value, onChange, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 text-[12px] text-gray-600 ${className}`}>
      <span className="font-medium whitespace-nowrap">Ordenar:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[12px] font-medium text-gray-800 outline-none focus:border-trego-orange"
      >
        {OPCIONES_ORDEN.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </label>
  )
}
