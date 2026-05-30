export function formatearHorario(horarioServicio) {
  if (!horarioServicio?.length) return '—'
  if (horarioServicio.length >= 2) {
    return `${horarioServicio[0]} - ${horarioServicio[horarioServicio.length - 1]}`
  }
  return horarioServicio[0]
}
