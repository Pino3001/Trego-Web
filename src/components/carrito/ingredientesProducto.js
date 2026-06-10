export const MSG_TODOS_INGREDIENTES =
  'No podés quitar todos los ingredientes. Dejá al menos uno en el plato.'

export function obtenerNombresIngredientes(producto) {
  if (!producto?.ingredientes?.length) return []
  return producto.ingredientes
    .map((i) => (typeof i === 'string' ? i : i.nombre))
    .filter(Boolean)
}

export function validarIngredientesQuitados(ingredientes, quitados) {
  if (ingredientes.length === 0) return null
  if (quitados.length >= ingredientes.length) return MSG_TODOS_INGREDIENTES
  return null
}

export function toggleIngredienteQuitado(ingredientes, quitados, nombre) {
  if (quitados.includes(nombre)) {
    return { quitados: quitados.filter((x) => x !== nombre), error: null }
  }
  if (ingredientes.length > 0 && quitados.length + 1 >= ingredientes.length) {
    return { quitados, error: MSG_TODOS_INGREDIENTES }
  }
  return { quitados: [...quitados, nombre], error: null }
}
