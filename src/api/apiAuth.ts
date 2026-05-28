import type { DTOLoginRegistro } from "../data/DTOLoginRegistro.js";
import type { LoginResponseDTO } from "../data/LoginResponseDTO.js";
import { fetchConAuth } from "./header/fetchConAuth.js";
import { ENDPOINTS } from "./endpoints.js";

//Creamos un objeto con las funciones de comunicación
export const apiAuth = {
  // Función centralizada para enviar el token de Firebase
  loginConGoogle: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(ENDPOINTS.AUTH_GOOGLE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí podrías agregar en el futuro el token en el Header si fuera necesario
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      if (response.status === 401) throw new Error("TOKEN_INVALIDO");
      throw new Error("ERROR_SERVIDOR");
    }

    const data = await response.json();
    return {
      token: data.jwtToken ?? data.token,
      rol: data.rol,
      nombre: data.nombre,
      email: data.email,
    };
  },

  loginConSMS: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(ENDPOINTS.AUTH_SMS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firebaseToken: idToken }),
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      if (response.status === 401) throw new Error("TOKEN_INVALIDO");
      throw new Error("ERROR_SERVIDOR");
    }

    const data = await response.json();
    return {
      token: data.jwtToken ?? data.token,
      rol: data.rol,
      nombre: data.nombre,
      email: data.email,
    };
  },

  login: async (login: DTOLoginRegistro) => {
    const response = await fetch(ENDPOINTS.AUTH_LOGIN_ADMIN, {
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

    const data = await response.json();
    return {
      token: data.jwtToken ?? data.token,
      rol: data.rol,
      nombre: data.nombre,
      email: data.email,
    };
  },

  cerrarSesion: async (): Promise<void> => {
    // La funcion fetchConAuth manda el token de sesion al backend
    const response = await fetchConAuth(ENDPOINTS.AUTH_CERRAR_SESION, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("ERROR_AL_CERRAR_SESION");
    }
  },
};
