import type { DTODireccion } from '../data/DTODireccion.js';
import type { DTOPedido } from '../data/DTOPedido.js';
import type { DTOPreferenciaMP } from '../data/DTOPreferenciaMP.js';
import { ENDPOINTS } from './endpoints.js'
import { fetchConAuth } from './header/fetchConAuth.js'


/**
 * Extensión de la preferencia para incluir los campos que la función normaliza
 */
export interface PreferenciaNormalizada extends DTOPreferenciaMP {
  externalReference: string | number;
  [key: string]: any; // Mantiene propiedades dinámicas que vengan del backend
}

/**
 * Interfaz para el objeto laxo que puede venir de Mercado Pago/Backend
 */
interface RawPreferenciaPago {
  initPoint?: string;
  init_point?: string;
  initpoint?: string;
  url?: string;
  sandboxInitPoint?: string;
  sandbox_init_point?: string;
  sandboxInitpoint?: string;
  externalReference?: string | number;
  external_reference?: string | number;
  idPedido?: number;
  pedidoId?: number;
  [key: string]: any;
}

async function leerJson(response: Response): Promise<any> {
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

function normalizarPreferenciaPago(preferencia: RawPreferenciaPago | null | undefined): PreferenciaNormalizada | null | undefined {
  if (!preferencia) return preferencia as any

  const initPoint =
    preferencia.initPoint ??
    preferencia.init_point ??
    preferencia.initpoint ??
    preferencia.url ?? ''

  const sandboxInitPoint =
    preferencia.sandboxInitPoint ??
    preferencia.sandbox_init_point ??
    preferencia.sandboxInitpoint ?? ''

  const externalReference =
    preferencia.externalReference ??
    preferencia.external_reference ??
    preferencia.idPedido ??
    preferencia.pedidoId ?? ''

  return {
    ...preferencia,
    initPoint,
    sandboxInitPoint,
    externalReference,
  } as PreferenciaNormalizada
}

interface ConfirmarPedidoParams {
  carrito?: any; // Marcado como opcional/any ya que el backend lo ignora por sesión
  direccion: DTODireccion;
  restauranteId?: any; // Marcado como opcional/any ya que el backend lo ignora
}

export async function confirmarPedido({ 
  carrito, 
  direccion, 
  restauranteId 
}: ConfirmarPedidoParams): Promise<PreferenciaNormalizada | null | undefined> {
  const response = await fetchConAuth(ENDPOINTS.PEDIDO_CONFIRMAR, {
    method: 'POST',
    // El backend /api/pedido/confirmar espera únicamente un DTODireccion.
    body: JSON.stringify(direccion),
  })

  if (!response.ok) {
    const text = await response.text()
    let msg = text
    try {
      const body = JSON.parse(text)
      msg = body?.message ?? body?.error ?? text
    } catch {
      // texto plano, lo dejamos como está
    }
    throw new Error(msg || `No se pudo confirmar el pedido (HTTP ${response.status})`)
  }

  const body = await leerJson(response)
  return normalizarPreferenciaPago(body)
}

export async function consultarEstadoPago(idPedido: string | number): Promise<any> {
  const url = ENDPOINTS.PAGO_ESTADO.replace(':idPedido', String(idPedido))
  const response = await fetchConAuth(url)
  if (!response.ok) throw new Error('No se pudo consultar el estado del pago')
  return leerJson(response)
}

export async function obtenerMisPedidos(): Promise<DTOPedido[]> {
  const response = await fetchConAuth(ENDPOINTS.PEDIDO_MIS_PEDIDOS)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || 'No se pudo cargar el historial de compras')
  }
  const data = await leerJson(response)
  return Array.isArray(data) ? (data as DTOPedido[]) : []
}

/** Cancela un pedido del cliente vía reembolso (POST /api/pedido/reembolsar). */
export async function cancelarPedido(pedido: DTOPedido): Promise<DTOPedido> {
  const response = await fetchConAuth(ENDPOINTS.CANCELAR_PEDIDO, {
    method: 'POST',
    body: JSON.stringify(pedido),
  })

  if (!response.ok) {
    let mensaje = `Error ${response.status}`
    try {
      const errorData = await response.json()
      mensaje = errorData.message || errorData.error || JSON.stringify(errorData)
    } catch {
      mensaje = await response.text().catch(() => 'Error desconocido')
    }

    if (response.status === 400) {
      throw new Error(mensaje || 'Pedido inválido o no tiene pago asociado.')
    }
    if (response.status === 409) {
      throw new Error(mensaje || 'El pedido ya había sido cancelado.')
    }

    throw new Error(mensaje || 'No se pudo cancelar el pedido.')
  }

  return (await leerJson(response)) as DTOPedido
}
