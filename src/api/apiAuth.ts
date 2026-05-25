import type { DTOLoginRegistro } from "../data/DTOLoginRegistro.js";
import type { LoginResponseDTO } from "../data/LoginResponseDTO.js";
import { fetchConAuth } from "./header/fetchConAuth.js";

const BASE_URL = "http://localhost:8080/api";

//Creamos un objeto con las funciones de comunicación
export const apiAuth = {
  // Función centralizada para enviar el token de Firebase
  loginConGoogle: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí podrías agregar en el futuro el token en el Header si fuera necesario
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      // Manejo básico de errores HTTP que lanzará al catch del componente
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      throw new Error("ERROR_SERVIDOR");
    }

    return response.json();
  },

  loginConSMS: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(`${BASE_URL}/auth/sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      throw new Error("ERROR_SERVIDOR");
    }

    return response.json();
  },

  loginRestaurante: async (login: DTOLoginRegistro) => {
    const response = await fetch(`${BASE_URL}/auth/login/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(login),
    });

    if (!response.ok) {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("CREDENCIALES_INVALIDAS");
        }
        if (response.status === 403) {
          throw new Error("CUENTA_DESHABILITADA");
        }
        throw new Error("ERROR_SERVIDOR");
      }
    }

    return response.json();
  },

  cerrarSesion: async (): Promise<void> => {
    // La funcion fetchConAuth manda el token de sesion al backend
    const response = await fetchConAuth("/cerrarSesion", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("ERROR_AL_CERRAR_SESION");
    }
  },
};
