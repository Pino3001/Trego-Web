import type { DTOCliente } from "../data/DTOCliente.js";
import type { DTOClienteResponse } from "../data/DTOClienteResponse.js";
import type { DTODireccion } from "../data/DTODireccion.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

/**
 * Agrega una nueva dirección al cliente autenticado.
 * @param direccion Objeto DTODireccion con los datos a guardar.
 * @throws Error si los datos son inválidos, el usuario no está autenticado o hay un error de red.
 */
export async function agregarDireccionApi(
  direccion: DTODireccion,
): Promise<void> {
  try {
    const response = await fetchConAuth(ENDPOINTS.USUARIO_AGREGAR_DIRECCION, {
      method: "POST",
      body: JSON.stringify(direccion),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(
          "Datos de dirección inválidos. Revisá la información ingresada.",
        );
      }

      if (response.status === 401) {
        throw new Error(
          "No autenticado. Tu sesión expiró o no iniciaste sesión.",
        );
      }

      throw new Error(
        `Error al guardar la dirección (Código: ${response.status})`,
      );
    }
    return;
  } catch (error) {
    console.error("Error en agregarDireccionApi:", error);
    throw error;
  }
}

/**
 * Actualiza una dirección existente del cliente autenticado.
 * @param tagModificar El identificador (tag) actual de la dirección que se quiere modificar.
 * @param direccion Objeto DTODireccion con los nuevos datos actualizados.
 * @param isClient Indica si la petición viene del cliente (por defecto el backend espera false, ajustalo según tu lógica).
 * @throws Error si los datos son inválidos, el usuario no está autenticado o hay un error de red.
 */
export async function actualizarDireccionApi(
  tagModificar: string,
  direccion: DTODireccion,
  isClient: boolean = false,
): Promise<void> {
  const queryParams = new URLSearchParams({
    tagModificar: tagModificar,
    client: isClient.toString(),
  });

  try {
    const response = await fetchConAuth(
      `${ENDPOINTS.USUARIO_ACTUALIZAR_DIRECCION}?${queryParams.toString()}`,
      {
        method: "POST",
        body: JSON.stringify(direccion),
      },
    );

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(
          "Datos de dirección inválidos. Revisá la información ingresada.",
        );
      }

      if (response.status === 401) {
        throw new Error(
          "No autenticado. Tu sesión expiró o no iniciaste sesión.",
        );
      }

      throw new Error(
        `Error al actualizar la dirección (Código: ${response.status})`,
      );
    }

    return;
  } catch (error) {
    console.error("Error en actualizarDireccionApi:", error);
    throw error;
  }
}

/**
 * Actualiza los datos de un Cliente registrado.
 * @param dto Datos a modificar
 * @throws Error si los datos son inválidos, el usuario no está autenticado o hay un error de red.
 */
export async function actualizarPerfil(
  dto: DTOCliente,
): Promise<DTOClienteResponse> {
  try {
    const response = await fetchConAuth(ENDPOINTS.CLIENTE_MODIFICAR_PERFIL, {
      method: "PUT",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("No existe un cliente con tus credenciales");
      }

      throw new Error(
        `Error al actualizar el perfil (Código: ${response.status})`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error en actualizarPerfil:", error);
    throw error;
  }
}

/**
 *  Obtiene los datos actuales de un Cliente, incluido sus direcciones.
 * @throws Error si los datos son inválidos, el usuario no está autenticado o hay un error de red.
 */
export async function clienteActual(): Promise<DTOCliente> {
  try {
    const response = await fetchConAuth(ENDPOINTS.CLIENTE_ACTUAL, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("No existe un cliente con tus credenciales");
      }
      if (response.status === 404) {
        throw new Error("No se encontro el Cliente");
      }

      throw new Error(
        `Error al actualizar el perfil (Código: ${response.status})`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error en actualizarPerfil:", error);
    throw error;
  }
}
