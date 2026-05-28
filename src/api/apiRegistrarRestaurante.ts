import type { DTOLoginRegistro } from "../data/DTOLoginRegistro.js";
import type { LoginResponseDTO } from "../data/LoginResponseDTO.js";
import { ENDPOINTS } from "./endpoints.js";
import { fetchSinAuth } from "./header/fetchSinAuth.js";

export interface RespuestaRegistro {
  success: boolean;
  message: string;
  login?: LoginResponseDTO;
}

export const apiRegistrarRestaurante = {
  registrarRestaurante: async (
    registro: DTOLoginRegistro,
  ): Promise<RespuestaRegistro> => {
    try {
      const response = await fetchSinAuth(ENDPOINTS.REGISTRAR_RESTAURANTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registro.email,
          password: registro.password,
        }),
      });

      // Leemos la respuesta como texto, no como JSON
      const data = await response.text();

      if (!response.ok) {
        console.log(
          "Error del servidor (Status: " + response.status + "): ",
          data,
        );
        return {
          success: false,
          message: data || "Error al solicitar el registro.",
        };
      }

      return {
        success: true,
        message: data,
      };
    } catch (error) {
      console.error("Error real de fetch:", error);
      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    }
  },

  confirmarRegistro: async (
    email: string,
    codigo: string,
  ): Promise<RespuestaRegistro> => {
    try {
      // Construimos la ruta relativa con los query params (el backend espera @RequestParam)
      const url = `${ENDPOINTS.CONFIRMAR_REGISTRO}?email=${encodeURIComponent(email)}&codigo=${encodeURIComponent(codigo)}`;

      const response = await fetchSinAuth(url, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: errorText || "Código inválido o expirado.",
        };
      }

      // Si es 200
      const userData: LoginResponseDTO = await response.json();
      return {
        success: true,
        message: "Registro Exitoso",
        login: userData,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    }
  },

  // POST: /registrar-restaurante/reenviar-codigo
  reenviarCodigo: async (email: string): Promise<RespuestaRegistro> => {
    try {
      const url = `${ENDPOINTS.REENVIAR_CODIGO}?email=${encodeURIComponent(email)}`;

      const response = await fetchSinAuth(url, {
        method: "POST",
      });

      const dataText = await response.text(); // Ambos (éxito o error) devuelven un String

      if (!response.ok) {
        return {
          success: false,
          message: dataText || "No se pudo reenviar el código.",
        };
      }

      return {
        success: true,
        message: dataText, // "Se ha enviado un nuevo código..."
      };
    } catch (error) {
      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    }
  },
};
