const BASE_URL = "http://localhost:8080/api";

export const fetchConAuth = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Buscamos el token
  const token = localStorage.getItem("jwtToken");

  // 2. Preparamos las cabeceras base
  const headers = new Headers(options.headers || {});
  
  // Por defecto asumimos que enviamos y recibimos JSON
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Si hay token, ¡le ponemos la pulsera VIP a la petición!
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 4. Ejecutamos el fetch real
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  //Control de token expirado (401 Unauthorized)
  if (response.status === 401) {
    console.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    localStorage.removeItem("jwtToken");
    window.location.href = "/login"; 
  }

  return response;
};