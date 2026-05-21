// Definimos la URL base de tu backend en Spring Boot
const BASE_URL = "http://localhost:8080/api"; 

// Definimos la estructura exacta que devuelve tu Spring Boot (LoginResponseDTO)
export interface LoginResponseDTO {
  token: string; // O jwtToken, según como quedó en tu Java
  rol: string;
  nombre: string;
  email: string;
}

//Creamos un objeto con las funciones de comunicación
export const apiService = {
  
  // Función centralizada para enviar el token de Firebase
  loginConGoogle: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí podrías agregar en el futuro el token en el Header si fuera necesario
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      // Manejo básico de errores HTTP que lanzará al catch del componente
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      throw new Error("ERROR_SERVIDOR");
    }

    return response.json();
  },

  loginConSMS: async (idToken: string): Promise<LoginResponseDTO> => {
    const response = await fetch(`${BASE_URL}/auth/google`, { // 👈 Apunta al mismo endpoint por ahora
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("CUENTA_DESHABILITADA");
      throw new Error("ERROR_SERVIDOR");
    }

    return response.json();
  }
};