import type { DTOLoginRegistro } from "../data/DTOLoginRegistro.js";
import type { LoginResponseDTO } from "../data/LoginResponseDTO.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface RespuestaRegistro {
  success: boolean;
  message: string;
  login?: LoginResponseDTO;
}

export const apiRegistrarRestaurante = {

registrarRestaurante: async (registro: DTOLoginRegistro): Promise<RespuestaRegistro> => {
    try {
      const response = await fetch(`${BASE_URL}/api/usuarios/registrar-restaurante/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: registro.email, 
          password: registro.password 
        }),
      });

      // Leemos la respuesta como texto, no como JSON
      const data = await response.text();

      if (!response.ok) {
        console.log("Error del servidor (Status: " + response.status + "): ", data);
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

  confirmarRegistro: async (email: string, codigo: string): Promise<RespuestaRegistro> => {
    try {
      // Como usa @RequestParam, construimos la URL con los parámetros
      const url = new URL(`${BASE_URL}/api/usuarios/registrar-restaurante/confirmar`, window.location.origin);
      url.searchParams.append("email", email);
      url.searchParams.append("codigo", codigo);

      const response = await fetch(url.toString(), {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text(); // El error viene como String
        return {
          success: false,
          message: errorText || "Código inválido o expirado.",
        };
      }

      // Si es 200 (Éxito)
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
      const url = new URL(`${BASE_URL}/api/usuarios/registrar-restaurante/reenviar-codigo`, window.location.origin);
      url.searchParams.append("email", email);

      const response = await fetch(url.toString(), {
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
  }
};