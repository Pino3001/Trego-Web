import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  agregarComentarioRestaurante,
  clienteYaComentoEnRestaurante,
  listarComentariosRestaurante,
} from '../../api/comentariosApi.js'
import EstrellasCalificacion from './EstrellasCalificacion.jsx'
import { esSesionCliente } from '../../utils/sesion.js'
import { obtenerMisPedidos } from '../../api/pedidosApi.js'

function formatearFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function calcularPromedio(comentarios) {
  if (!comentarios?.length) return null
  const suma = comentarios.reduce((acc, c) => acc + (c.calificacion ?? 0), 0)
  return suma / comentarios.length
}

/** Un cliente = una reseña por restaurante; filtra filas duplicadas en BD. */
function deduplicarComentarios(lista) {
  const vistos = new Set()
  return (lista ?? []).filter((c) => {
    const clave = c.nombreCliente ?? String(c.idComentario)
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

const MIN_VISIBLE = 2

export default function ComentariosRestaurantePanel({
  idRestaurante,
  onResenasActualizadas,
}) {
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const [texto, setTexto] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [mensajeForm, setMensajeForm] = useState(null)
  const [errorForm, setErrorForm] = useState(null)
  const [formularioOculto, setFormularioOculto] = useState(false)
  const [yaComento, setYaComento] = useState(false)
  const [tienePedidoValido, setTienePedidoValido] = useState(null)
  const enviandoRef = useRef(false)

  const esCliente = esSesionCliente()

  const promedio = useMemo(() => calcularPromedio(comentarios), [comentarios])
  const hayResenas = comentarios.length > 0

  const visibles = mostrarTodos
    ? comentarios
    : comentarios.slice(0, MIN_VISIBLE)

  const notificarCambio = useCallback(
    (lista) => {
      onResenasActualizadas?.({
        calificacionProm: calcularPromedio(lista),
        cantidadResenas: lista.length,
      })
    },
    [onResenasActualizadas],
  )

  const cargar = useCallback(async () => {
    if (!idRestaurante) return
    setCargando(true)
    setErrorCarga(null)
    try {
      const lista = deduplicarComentarios(
        await listarComentariosRestaurante(idRestaurante),
      )
      setComentarios(lista)
      notificarCambio(lista)
    } catch (e) {
      if (e.message === 'SIN_SESION') {
        setErrorCarga('iniciar_sesion')
      } else {
        setErrorCarga(e.message ?? 'No se pudieron cargar las reseñas')
      }
      setComentarios([])
    } finally {
      setCargando(false)
    }
  }, [idRestaurante, notificarCambio])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!esCliente || !idRestaurante) {
      setYaComento(false)
      return
    }

    let cancelado = false
    clienteYaComentoEnRestaurante(idRestaurante)
      .then((comento) => {
        if (!cancelado) setYaComento(comento)
      })
      .catch(() => {
        if (!cancelado) setYaComento(false)
      })

    return () => {
      cancelado = true
    }
  }, [esCliente, idRestaurante])

  useEffect(() => {
    if (!esCliente || !idRestaurante) {
      setTienePedidoValido(false)
      return
    }

    let cancelado = false
    obtenerMisPedidos()
      .then((pedidos) => {
        if (cancelado) return
        const valido = pedidos.some(
          (p) => String(p.idRestaurante) === String(idRestaurante),
        )
        setTienePedidoValido(valido)
      })
      .catch(() => {
        if (!cancelado) setTienePedidoValido(null)
      })

    return () => {
      cancelado = true
    }
  }, [esCliente, idRestaurante])

  async function handleEnviar(e) {
    e.preventDefault()
    setMensajeForm(null)
    setErrorForm(null)

    if (!esCliente) {
      setErrorForm('Iniciá sesión como cliente para dejar una reseña.')
      return
    }
    if (calificacion < 1) {
      setErrorForm('Seleccioná una calificación de 1 a 5 estrellas.')
      return
    }
    if (!texto.trim()) {
      setErrorForm('Escribí un comentario.')
      return
    }

    setEnviando(true)
    try {
      await agregarComentarioRestaurante({
        idRestaurante,
        calificacion,
        texto: texto.trim(),
      })
      setTexto('')
      setCalificacion(0)
      setMensajeForm('¡Gracias! Tu reseña fue publicada.')
      setYaComento(true)
      setFormularioOculto(true)
      await cargar()
    } catch (err) {
      const codigo = err?.message
      if (codigo === 'SIN_PEDIDO') {
        setErrorForm(
          'Solo podés comentar si ya realizaste un pedido en este restaurante.',
        )
      } else if (codigo === 'YA_COMENTO') {
        setYaComento(true)
        setFormularioOculto(true)
      } else if (codigo === 'SIN_SESION') {
        setErrorForm('Iniciá sesión como cliente para dejar una reseña.')
      } else {
        setErrorForm(err?.message ?? 'No se pudo publicar el comentario.')
      }
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-trego-sidebar p-4 shadow-sm lg:w-[240px] lg:p-5">
      <section>
        <h2 className="mb-2 text-[15px] font-bold text-gray-900">Reseñas</h2>

        <div className="mb-4 flex items-center gap-2">
          {hayResenas ? (
            <>
              <EstrellasCalificacion
                valor={Math.round(promedio ?? 0)}
                soloLectura
                tamano="sm"
              />
              <span className="text-[13px] font-semibold text-gray-800">
                {promedio?.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-medium text-gray-500">
              Sin calificar
            </span>
          )}
          <span className="text-[12px] text-gray-500">
            ({comentarios.length})
          </span>
        </div>

        {cargando ? (
          <p className="text-[13px] text-gray-500">Cargando reseñas...</p>
        ) : errorCarga === 'iniciar_sesion' ? (
          <p className="text-[13px] text-gray-600">
            <Link
              to="/login/cliente"
              className="font-semibold text-trego-orange hover:underline"
            >
              Iniciá sesión
            </Link>{' '}
            para ver las reseñas.
          </p>
        ) : errorCarga ? (
          <p className="text-[13px] text-red-600">{errorCarga}</p>
        ) : comentarios.length === 0 ? (
          <p className="text-[13px] text-gray-500">
            Aún no hay reseñas. ¡Sé el primero!
          </p>
        ) : (
          <ul className="space-y-3">
            {visibles.map((c) => (
              <li
                key={c.idComentario ?? `${c.nombreCliente}-${c.fechaCreacion}`}
                className="rounded-xl border border-gray-200/80 bg-white p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-semibold text-gray-800">
                    {c.nombreCliente ?? 'Cliente'}
                  </span>
                  <EstrellasCalificacion
                    valor={c.calificacion ?? 0}
                    soloLectura
                    tamano="sm"
                  />
                </div>
                <p className="line-clamp-3 text-[12px] leading-snug text-gray-600">
                  {c.texto}
                </p>
                {c.fechaCreacion ? (
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    {formatearFecha(c.fechaCreacion)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {!cargando && comentarios.length > MIN_VISIBLE && (
          <button
            type="button"
            onClick={() => setMostrarTodos((v) => !v)}
            className="mt-2 text-[12px] font-semibold text-trego-orange hover:underline"
          >
            {mostrarTodos
              ? 'Ver menos'
              : `Ver ${comentarios.length - MIN_VISIBLE} más`}
          </button>
        )}
      </section>

      {!formularioOculto && !yaComento && !cargando && errorCarga !== 'iniciar_sesion' && (
        <section className="mt-5 border-t border-gray-200/70 pt-4">
          <h3 className="mb-2 text-[14px] font-bold text-gray-900">
            Dejá tu reseña
          </h3>

          {!esCliente ? (
            <p className="text-[13px] text-gray-600">
              <Link
                to="/login/cliente"
                className="font-semibold text-trego-orange hover:underline"
              >
                Iniciá sesión
              </Link>{' '}
              para calificar este restaurante.
            </p>
          ) : tienePedidoValido === null ? (
            <p className="text-[13px] text-gray-500">
              Verificando si podés dejar una reseña...
            </p>
          ) : tienePedidoValido === false ? (
            <p className="text-[13px] text-gray-600">
              Solo podés reseñar si ya hiciste al menos un pedido en este
              restaurante.
            </p>
          ) : (
            <form onSubmit={handleEnviar} className="space-y-3">
              <div>
                <p className="mb-1 text-[12px] font-medium text-gray-700">
                  Calificación
                </p>
                <EstrellasCalificacion
                  valor={calificacion}
                  onCambiar={setCalificacion}
                  tamano="lg"
                />
              </div>

              <div>
                <label
                  htmlFor={`comentario-${idRestaurante}`}
                  className="mb-1 block text-[12px] font-medium text-gray-700"
                >
                  Comentario
                </label>
                <textarea
                  id={`comentario-${idRestaurante}`}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Contanos tu experiencia..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-trego-orange focus:ring-1 focus:ring-trego-orange"
                />
              </div>

              {errorForm ? (
                <p className="text-[12px] text-red-600">{errorForm}</p>
              ) : null}
              {mensajeForm ? (
                <p className="text-[12px] font-medium text-emerald-600">
                  {mensajeForm}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-xl bg-trego-orange px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {enviando ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </form>
          )}
        </section>
      )}

      {esCliente && yaComento && !cargando && errorCarga !== 'iniciar_sesion' && (
        <p className="mt-5 border-t border-gray-200/70 pt-4 text-[13px] text-gray-600">
          Ya dejaste tu reseña en este restaurante.
        </p>
      )}
    </aside>
  )
}
