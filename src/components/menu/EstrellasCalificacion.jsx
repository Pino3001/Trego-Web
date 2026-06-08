import { useState } from 'react'

export default function EstrellasCalificacion({
  valor = 0,
  max = 5,
  tamano = 'md',
  soloLectura = false,
  onCambiar,
}) {
  const [hover, setHover] = useState(null)

  const sizeClass =
    tamano === 'sm' ? 'text-base' : tamano === 'lg' ? 'text-2xl' : 'text-xl'

  const resaltado = hover ?? valor

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${sizeClass}`}
      role={soloLectura ? 'img' : 'group'}
      aria-label={
        soloLectura
          ? `Calificación: ${valor} de ${max} estrellas`
          : 'Seleccionar calificación'
      }
      onMouseLeave={soloLectura ? undefined : () => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const estrella = i + 1
        const activa = estrella <= resaltado

        if (soloLectura) {
          return (
            <span
              key={estrella}
              className={activa ? 'text-amber-400' : 'text-gray-300'}
              aria-hidden
            >
              ★
            </span>
          )
        }

        return (
          <button
            key={estrella}
            type="button"
            onClick={() => onCambiar?.(estrella)}
            onMouseEnter={() => setHover(estrella)}
            className={`transition hover:scale-110 ${
              activa ? 'text-amber-400' : 'text-gray-300'
            }`}
            aria-label={`${estrella} estrella${estrella > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}